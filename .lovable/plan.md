

## Plan: Choose Main Photo from Existing Photos or Upload New

### Problem
In edit mode, users can only upload a new photo or adjust the crop. There's no way to pick from photos already attached to the recipe as the main image.

### Changes

**`src/components/RecipeForm.tsx`**

1. **Add a photo picker section** below the current main photo area (when `form.photos.length > 0` and a photo is already set):
   - Show a row of thumbnail images from `form.photos`
   - Clicking a thumbnail sets it as the main photo (`form.imageUrl = photo.url`) and also updates `originalImageSrc` for re-cropping
   - Each thumbnail gets a subtle border/ring when it matches the current `form.imageUrl`

2. **Update the button row** under the main photo:
   - Keep "Adjust Crop" and "Change Photo" (upload new) buttons as-is
   - The gallery thumbnails below serve as the "pick from existing" option — no extra button needed, just a label like "Or choose from gallery:"

3. **Handle state**: When a gallery photo is selected as main, set `form.imageUrl` and `originalImageSrc` to that photo's URL so "Adjust Crop" works on it too.

### UI Layout
```text
┌─────────────────────────┐
│     Main Photo Preview  │
└─────────────────────────┘
[Adjust Crop] [Upload New]

Or choose from gallery:
[ img1 ] [ img2 ] [ img3 ]  ← clickable thumbnails with selected ring
```

### Scope
- Only `src/components/RecipeForm.tsx` needs changes
- No database or backend changes required

