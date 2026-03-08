

## Plan: Subtle Food Pattern Background

### Approach

Use Lovable AI's image generation (Gemini flash-image) to create a seamless, tileable food pattern illustration — line-art style herbs, utensils, and ingredients in a muted warm tone that works as a watermark-style repeating background. The pattern will be subtle enough not to compete with recipe cards.

### Changes

**1. Create a backend function to generate the pattern**
- New edge function `generate-background` that calls the Gemini image model with a prompt for a seamless tileable food pattern in muted warm tones (matching the app's orange/cream palette).
- Save the generated image as a static asset.

**Actually — simpler approach:** Generate the image once via edge function, then store the base64 result and apply it as a CSS background. Since it only needs to be created once, we can:

**1. `supabase/functions/generate-background/index.ts`**
- Edge function that generates a seamless food pattern using `google/gemini-2.5-flash-image`.
- Returns the base64 image data.

**2. `src/components/AppLayout.tsx`**
- Add a one-time call to generate or load the background pattern.
- Apply it as a repeating `background-image` on the main container with low opacity.
- Cache the result in localStorage so it's not regenerated on every load.

**3. `src/index.css`**
- Add a CSS class for the pattern overlay with `opacity: 0.04-0.06`, `background-repeat: repeat`, and `background-size` for tiling.

### Image Prompt
> "Seamless tileable pattern of hand-drawn line art food illustrations: herbs, garlic, tomatoes, wooden spoons, olive oil bottles, pasta, lemons. Warm cream/ivory background with soft burnt-orange line work. Minimal, elegant, watermark-style density. 512x512 pixels."

### Result
A warm, subtle food pattern that gives the app personality without distracting from recipe content.

