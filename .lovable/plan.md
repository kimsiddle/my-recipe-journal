

## Plan: Comment Photo Uploads (Compressed)

### Database
- Add `photo_url text` nullable column to `recipe_comments`

### Code: `src/components/RecipeComments.tsx`
- Add a hidden file input and `photoPreview` state
- Reuse the `compressImage` helper (already exists in `RecipeImageImport.tsx` — extract it to a shared util or inline it)
- On file select: compress the image (max 800px, quality 0.6) and store as data URL in state
- Add an "Attach photo" icon button next to the Post button; show thumbnail preview with X to remove
- On submit: include `photo_url: photoPreview` in the insert payload; clear after posting
- Update `Comment` interface to include `photo_url?: string`
- Render comment photos inline as a clickable thumbnail below the comment text

### Shared utility
- Move `compressImage` from `RecipeImageImport.tsx` into `src/lib/imageUtils.ts` so both components can use it without duplication

