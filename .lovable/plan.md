

## Plan: OCR Recipe Import from Photo

### Overview
Add a "Scan Recipe" option to the new recipe flow. Users upload a photo of a recipe, an edge function sends it to Gemini (via Lovable AI) for vision-based extraction, and the results pre-fill the editable recipe form.

### Architecture

```text
User uploads image
       │
       ▼
Client: preview + compress image (canvas API)
       │
       ▼
Edge Function: /extract-recipe
  - Receives base64 image
  - Sends to Lovable AI (Gemini 3 Flash) with vision prompt
  - Uses tool calling to extract structured JSON
  - Returns { title, ingredients[], instructions, notes, confidence }
       │
       ▼
Client: pre-fills RecipeForm with extracted data
  - User reviews/edits all fields
  - Saves normally via existing flow
```

### Changes

**1. Edge Function: `supabase/functions/extract-recipe/index.ts`**
- Accepts `{ image: string }` (base64 data URL)
- Calls Lovable AI Gateway with `google/gemini-3-flash-preview` (multimodal, fast)
- Uses tool calling to get structured output: `{ title, ingredients: [{amount, name}], instructions, notes, confidence }`
- Returns extracted data or `{ error, confidence: "low" }` on failure
- Update `supabase/config.toml` with `[functions.extract-recipe]` and `verify_jwt = false`

**2. New component: `src/components/RecipeImageImport.tsx`**
- Upload button accepting JPG, PNG, HEIC (with note that HEIC support varies by browser)
- Client-side image compression via canvas (resize to max 1600px, JPEG quality 0.7)
- Shows image preview
- "Extract Recipe" button that calls the edge function
- Loading state with spinner during OCR
- On success: calls a callback with extracted data
- On failure/low confidence: shows friendly message, lets user proceed manually

**3. Update `src/pages/RecipeFormPage.tsx`**
- Add a step before the form: choice between "Start from scratch" or "Import from photo"
- When import completes, pre-fill the `RecipeForm` with extracted data (title, ingredients, instructions mapped to existing types)
- The uploaded image becomes the recipe's `imageUrl`

**4. Update `src/components/RecipeForm.tsx`**
- No structural changes needed — it already accepts `initial` data
- The parent page handles the import-to-form data flow

**5. Image handling**
- Compression happens client-side before sending to the edge function and before storing
- Default: store only the compressed version as a base64 data URL (matching current `imageUrl` pattern)
- Original is discarded after OCR extraction

**6. Error handling**
- Edge function returns a `confidence` field ("high", "medium", "low")
- If low or error: toast message "We couldn't fully read this image. Please review and complete the recipe manually."
- User is never blocked — they can always edit or start fresh

### No database changes needed
The existing `recipes` table and `Ingredient` type already support all extracted fields.

