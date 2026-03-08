

## Plan: Import Recipe from URL

### Overview
Add an "Import from URL" option alongside the existing "Import from Photo" on the new recipe screen. When a URL is pasted, a new edge function fetches the page, tries JSON-LD structured data first, then falls back to AI extraction of the page content. The result flows into the same editable review form.

### Changes

**1. New Edge Function: `supabase/functions/extract-recipe-url/index.ts`**
- Accept `{ url: string }` in the request body
- Fetch the webpage HTML server-side
- Parse for `<script type="application/ld+json">` blocks containing `@type: "Recipe"` — extract title, ingredients, instructions, image, cookTime, servings, notes directly
- If no structured data found, extract the page's text content (strip HTML tags), truncate to a reasonable size, and send to the Lovable AI gateway with a prompt to parse recipe fields (same tool-calling pattern as extract-recipe)
- Return the same shape as the image extractor: `{ title, ingredients, instructions, notes, cook_time, servings, confidence, image_url }`
- Handle 429/402 errors from AI gateway

**2. Update `supabase/config.toml`**
- Add `[functions.extract-recipe-url]` with `verify_jwt = false`

**3. Update `src/pages/RecipeFormPage.tsx`**
- Change the import step from showing only `RecipeImageImport` to showing a choice screen with two options: "Import from Photo" and "Import from URL"
- Add a URL input state and handler that calls the new edge function
- On success, map the result into `RecipeFormData` and proceed to the editable form (same `handleExtracted` flow)

**4. New Component: `src/components/RecipeUrlImport.tsx`**
- URL input field with paste-friendly UX
- "Extract" button with loading state
- Error display for failed extractions
- Calls `supabase.functions.invoke('extract-recipe-url', { body: { url } })`
- On success, calls `onExtracted(data)` with the same `ExtractedRecipe` shape
- "Back" button to return to the import method chooser

**5. Update `src/pages/RecipeFormPage.tsx` import screen**
- Show a chooser with three options: "Import from Photo", "Import from URL", "Start from scratch"
- Track which import mode is active: `'choose' | 'photo' | 'url'`
- Wire both importers to the same `handleExtracted` callback

### Edge Function Detail

The URL extractor will:
1. Fetch the URL with a browser-like User-Agent
2. Look for JSON-LD `Recipe` schema — if found, map fields directly (high confidence, no AI call needed)
3. If not found, strip HTML to text, take first ~8000 chars of main content, send to AI gateway with the same tool-calling schema as the image extractor but with text input instead of image
4. For the source field: automatically set `source: { type: 'website', name: hostname, url: originalUrl }` in the RecipeFormPage handler when imported from URL

