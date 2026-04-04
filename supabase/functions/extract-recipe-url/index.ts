import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractJsonLdRecipe(html: string): any | null {
  const scriptRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of candidates) {
        if (item["@type"] === "Recipe") return item;
        if (item["@graph"]) {
          const recipe = item["@graph"].find((g: any) => g["@type"] === "Recipe");
          if (recipe) return recipe;
        }
      }
    } catch { /* skip invalid JSON-LD */ }
  }
  return null;
}

function parseIsoDuration(iso: string): string {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return "";
  const hours = parseInt(m[1] || "0");
  const mins = parseInt(m[2] || "0");
  const total = hours * 60 + mins;
  const options = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 150, 180, 240];
  const labels = ["5 min","10 min","15 min","20 min","25 min","30 min","45 min","1 hour","1.5 hours","2 hours","2.5 hours","3 hours","4+ hours"];
  let closest = 0;
  let closestDiff = Infinity;
  for (let i = 0; i < options.length; i++) {
    const diff = Math.abs(options[i] - total);
    if (diff < closestDiff) { closestDiff = diff; closest = i; }
  }
  return labels[closest] || "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseIngredientString(input: string): { amount: string; name: string } {
  const trimmed = input.trim();
  // Match leading quantity (numbers, fractions, unicode fractions, decimals, ranges)
  // optionally followed by a unit of measurement
  const regex = /^([\d\s\/\.\-–—½⅓⅔¼¾⅛⅜⅝⅞]+(?:\s*(?:cups?|tablespoons?|tbsps?|teaspoons?|tsps?|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|millilit(?:er|re)s?|ml|lit(?:er|re)s?|l|pinch(?:es)?|dash(?:es)?|cloves?|cans?|packages?|pkgs?|bunche?s?|heads?|stalks?|slices?|pieces?|sprigs?|handfuls?|quarts?|qts?|pints?|pts?|gallons?|gal|sticks?|large|small|medium|whole)\.?))\s+(.+)$/i;
  const match = trimmed.match(regex);
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }
  // Check for just a number at the start (e.g. "3 eggs")
  const numMatch = trimmed.match(/^([\d½⅓⅔¼¾⅛⅜⅝⅞]+(?:\s*[\-–—\/]\s*[\d½⅓⅔¼¾⅛⅜⅝⅞]+)?)\s+(.+)$/);
  if (numMatch) {
    return { amount: numMatch[1].trim(), name: numMatch[2].trim() };
  }
  return { amount: "", name: trimmed };
}

function normalizeIngredients(raw: any): { amount: string; name: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any) => {
    if (typeof item === "string") return parseIngredientString(item);
    return { amount: item.amount || "", name: item.name || String(item) };
  });
}

function normalizeInstructions(raw: any): string {
  if (typeof raw === "string") return raw;
  if (!Array.isArray(raw)) return "";
  const steps = raw
    .flatMap((step: any) => {
      if (typeof step === "string") return [step];
      if (step.text) return [step.text];
      if (step["@type"] === "HowToStep") return [step.text || step.name || ""];
      if (step["@type"] === "HowToSection") {
        const items = step.itemListElement || [];
        return items.map((s: any) => s.text || s.name || "");
      }
      return [""];
    })
    .filter(Boolean);
  return "<ol>" + steps.map((s: string) => `<li>${s}</li>`).join("") + "</ol>";
}

function findImage(recipe: any): string {
  if (!recipe.image) return "";
  if (typeof recipe.image === "string") return recipe.image;
  if (Array.isArray(recipe.image)) return recipe.image[0]?.url || recipe.image[0] || "";
  if (recipe.image.url) return recipe.image.url;
  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "No URL provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch page
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)",
        "Accept": "text/html",
      },
    });
    if (!pageRes.ok) {
      return new Response(
        JSON.stringify({ error: `Could not fetch URL (status ${pageRes.status})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const html = await pageRes.text();

    // Try JSON-LD first
    const jsonLd = extractJsonLdRecipe(html);
    if (jsonLd) {
      const totalTime = jsonLd.totalTime || jsonLd.cookTime || jsonLd.prepTime || "";
      const servingsRaw = jsonLd.recipeYield;
      let servings = 0;
      if (servingsRaw) {
        const num = Array.isArray(servingsRaw) ? servingsRaw[0] : servingsRaw;
        servings = parseInt(String(num)) || 0;
      }

      return new Response(
        JSON.stringify({
          title: jsonLd.name || "",
          description: jsonLd.description || "",
          ingredients: normalizeIngredients(jsonLd.recipeIngredient),
          instructions: normalizeInstructions(jsonLd.recipeInstructions),
          notes: "",
          cook_time: parseIsoDuration(totalTime),
          servings,
          confidence: "high",
          image_url: findImage(jsonLd),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: AI extraction using Claude and Haiku for speed and affordability
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");


    const text = stripHtml(html).slice(0, 8000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        system: "You are a recipe extraction assistant. Extract structured recipe data from webpage text. Ignore blog intros, ads, and unrelated content. Focus only on the recipe itself.",
        messages: [
          {
            role: "user",
            content: `Extract the recipe from this webpage text:\n\n${text}`,
          },
        ],
        tools: [
          {
            name: "extract_recipe",
            description: "Extract structured recipe data from webpage text.",
            input_schema: {
              type: "object",
              properties: {
                title: { type: "string", description: "The recipe title" },
                ingredients: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      amount: { type: "string", description: "The quantity and unit of measurement ONLY, e.g. '2 cups', '1 tbsp', '½ tsp', '3 cloves'. Do NOT include the ingredient name here. Empty string if no quantity specified." },
                      name: { type: "string", description: "The ingredient name ONLY, without any quantity or unit. e.g. 'all-purpose flour', 'olive oil', 'garlic'. Do NOT include amounts here." },
                    },
                    required: ["amount", "name"],
                    additionalProperties: false,
                  },
                },
                instructions: { type: "string", description: "Step-by-step cooking instructions as an HTML ordered list. Use <ol><li>Step one</li><li>Step two</li></ol> format. Each step should be a separate <li> element. Do NOT include step numbers in the text — the <ol> handles numbering automatically." },
                description: { type: "string", description: "A brief summary or description of the dish — the main introductory text. Empty string if none." },
                notes: { type: "string", description: "Any specific tips, variations, or additional notes. NOT the main description. Empty string if none." },
                cook_time: {
                  type: "string",
                  enum: ["5 min","10 min","15 min","20 min","25 min","30 min","45 min","1 hour","1.5 hours","2 hours","2.5 hours","3 hours","4+ hours",""],
                },
                servings: { type: "integer" },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["title", "ingredients", "instructions", "notes", "cook_time", "servings", "confidence"],
              additionalProperties: false,
            },
          },
        ],
        tool_choice: { type: "tool", name: "extract_recipe" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to process page", confidence: "low" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.content?.find((b: any) => b.type === "tool_use");
    if (!toolCall?.input) {
      return new Response(JSON.stringify({ error: "Could not extract recipe from this page", confidence: "low" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = toolCall.input;
    // Try to find an og:image from the page
    const ogMatch = html.match(/<meta[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i);
    extracted.image_url = ogMatch?.[1] || "";

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-recipe-url error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", confidence: "low" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
