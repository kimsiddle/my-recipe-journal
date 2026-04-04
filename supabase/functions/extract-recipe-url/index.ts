import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  const labels = [
    "5 min", "10 min", "15 min", "20 min", "25 min", "30 min",
    "45 min", "1 hour", "1.5 hours", "2 hours", "2.5 hours",
    "3 hours", "4+ hours",
  ];
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
  const numMatch = trimmed.match(
    /^([\d½⅓⅔¼¾⅛⅜⅝⅞]+(?:\s*[\-–—\/]\s*[\d½⅓⅔¼¾⅛⅜⅝⅞]+)?)\s+(.+)$/
  );
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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const text = stripHtml(html).slice(0, 8000);

    const cookTimeEnum = [
      "5 min", "10 min", "15 min", "20 min", "25 min", "30 min",
      "45 min", "1 hour", "1.5 hours", "2 hours", "2.5 hours",
      "3 hours", "4+ hours", "",
    ];

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
        system: "You are a recipe extraction assistant. Extract structured recipe data from webpage text. Ignore blog intros, ads, and unrelated content. Focus only on the recipe itself. For ingredients, preserve any grouping sections from the original recipe (e.g. 'Dry Rub', 'Sauce', 'For the dough'). Set the section field to the group name, or empty string if there are no groups.",
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
                title: { type: "string" },
                ingredients: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      amount: { type: "string" },
                      name: { type: "string" },
                      section: { type: "string" },
                    },
                    required: ["amount", "name", "section"],
                    additionalProperties: false,
                  },
                },
                instructions: { type: "string" },
                description: { type: "string" },
                notes: { type: "string" },
                cook_time: {
                  type: "string",
                  enum: cookTimeEnum,
                },
                servings: { type: "integer" },
                confidence: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                },
              },
              required: [
                "title",
                "ingredients",
                "instructions",
                "notes",
                "cook_time",
                "servings",
                "confidence",
              ],
              additionalProperties: false,
            },
          },
        ],
        tool_choice: { type: "tool", name: "extract_recipe" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Anthropic API error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to process page", confidence: "low" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.content?.find((b: any) => b.type === "tool_use");
    if (!toolCall?.input) {
      return new Response(
        JSON.stringify({ error: "Could not extract recipe from this page", confidence: "low" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extracted = toolCall.input;
    const ogMatch = html.match(
      /<meta[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );
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
