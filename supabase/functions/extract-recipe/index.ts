import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build multimodal message with image
    const userContent: any[] = [
      {
        type: "image_url",
        image_url: { url: image },
      },
      {
        type: "text",
        text: "Extract the recipe from this image. Look for the recipe title, ingredients with their amounts/measurements, step-by-step instructions, and any additional notes. If some parts are unclear or missing, still extract what you can.",
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a recipe extraction assistant. Extract structured recipe data from images of recipes (photos, screenshots, scanned pages). Be thorough and accurate. If text is partially obscured or unclear, do your best to infer the content.",
            },
            { role: "user", content: userContent },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_recipe",
                description:
                  "Extract structured recipe data from an image of a recipe.",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "The recipe title",
                    },
                    ingredients: {
                      type: "array",
                      description: "List of ingredients with amounts",
                      items: {
                        type: "object",
                        properties: {
                          amount: {
                            type: "string",
                            description:
                              "Quantity and unit, e.g. '2 cups', '1 tbsp'. Empty string if not specified.",
                          },
                          name: {
                            type: "string",
                            description:
                              "Ingredient name, e.g. 'all-purpose flour', 'olive oil'",
                          },
                        },
                        required: ["amount", "name"],
                        additionalProperties: false,
                      },
                    },
                    instructions: {
                      type: "string",
                      description:
                        "Step-by-step cooking instructions, with each step on a new line",
                    },
                    notes: {
                      type: "string",
                      description:
                        "Any additional notes, tips, or details from the recipe. Empty string if none.",
                    },
                    confidence: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                      description:
                        "How confident you are in the extraction accuracy",
                    },
                  },
                  required: [
                    "title",
                    "ingredients",
                    "instructions",
                    "notes",
                    "confidence",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_recipe" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to process image", confidence: "low" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({
          error: "Could not extract recipe from this image",
          confidence: "low",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-recipe error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        confidence: "low",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
