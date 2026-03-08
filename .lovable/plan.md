

## Plan: Add Description Field to AI Recipe Extraction

### Problem
Both edge functions (image and URL extraction) only extract a `notes` field. The recipe description — which is often the most relevant summary text (e.g., "A creamy Thai curry with tender vegetables...") — is mapped to nothing. The `notes` field in `RecipeFormPage.tsx` line 60 shows `description: ''` is always empty after import.

### Changes

**1. Both edge functions: Add `description` to the tool schema**

**`supabase/functions/extract-recipe/index.ts`**
- Add a `description` property to the tool parameters: `"A brief summary or description of the dish. This is the main introductory text about what the recipe is."`
- Update the `notes` description to: `"Any specific tips, variations, or additional notes. NOT the main description."`
- Add `description` to the required fields

**`supabase/functions/extract-recipe-url/index.ts`**
- Same tool schema changes for the AI fallback path
- For the JSON-LD path: map `jsonLd.description` to a new `description` field in the response (currently it goes to `notes`)

**2. Update the shared type and consumer mapping**

**`src/components/RecipeImageImport.tsx`**
- Add `description: string` to the `ExtractedRecipe` interface
- Map `data.description` in both the image and URL extraction callbacks

**`src/components/RecipeUrlImport.tsx`**
- Map `data.description` in the extraction callback

**3. Wire description into the form**

**`src/pages/RecipeFormPage.tsx`** (line 60)
- Change `description: ''` to `description: data.description || ''`

### Summary of data flow
- AI returns both `description` (dish summary) and `notes` (tips/extras)
- JSON-LD: `jsonLd.description` maps to `description`, separate from notes
- Form pre-fills the Description field instead of leaving it blank

