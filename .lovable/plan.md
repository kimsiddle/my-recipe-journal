

## Plan: Retain Original Image for Re-cropping

### Problem
When a photo is cropped, `rawImageSrc` (the original full image) is cleared. The "re-crop" button then uses the already-cropped image as the source, causing quality loss and inability to adjust the crop area properly.

### Solution
Keep the original uncropped image stored separately so re-cropping always works from the full-resolution original.

### Changes

**`src/components/RecipeForm.tsx`**
- Add a new state `originalImageSrc` that persists the original uploaded image
- In `handleImage`: store the raw data URL in both `rawImageSrc` (for cropper) and `originalImageSrc` (permanent)
- In `handleCropComplete`: clear `rawImageSrc` but **keep** `originalImageSrc`
- In `handleRecrop`: use `originalImageSrc` instead of `form.imageUrl` as the cropper source
- In `handleCropCancel`: clear `rawImageSrc` but keep `originalImageSrc`
- When the user removes the image entirely: clear both `originalImageSrc` and `imageUrl`

This is a state-management-only change — no new components or UI changes needed.

