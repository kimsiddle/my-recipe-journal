

## Plan: Improve Image Cropper UX

### Problem
The "Adjust Crop" button opens the cropper, but the experience is cramped — the crop area is small (inline `aspect-video` div), the zoom slider is subtle, and there's no clear guidance that the user can drag to reposition. On mobile especially, the small inline area makes precision dragging difficult.

### Changes

**`src/components/ImageCropper.tsx`**

1. **Open cropper in a full-screen dialog** — Replace the inline crop area with a `Dialog` that takes up most of the viewport. This gives the user much more room to drag/reposition and pinch-zoom.

2. **Larger crop area** — Use `h-[60vh]` inside the dialog so the image fills most of the screen.

3. **Better zoom controls** — Show min/max labels on the zoom slider and widen the range to `1–4x`. Add a zoom percentage indicator.

4. **Helper text** — Add a short instruction line: "Drag to reposition, pinch or slide to zoom" so it's obvious the image is interactive.

5. **Keep rotate button** and existing Apply/Cancel actions in the dialog footer.

**`src/components/RecipeForm.tsx`**

6. No structural changes needed — it already conditionally renders `<ImageCropper>`. The cropper itself will now render as a dialog overlay instead of inline.

### Result
The cropper opens as a large overlay with clear drag-to-reposition affordance, a prominent zoom slider, and helper text — making it intuitive to adjust framing on both desktop and mobile.

