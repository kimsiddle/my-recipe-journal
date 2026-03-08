

## Plan: Sticky Save/Cancel Buttons on Recipe Form

### Problem
The Save and Cancel buttons are at the bottom of a scrollable form, forcing users to scroll all the way down to save or exit.

### Solution
Make the button bar sticky at the bottom of the form viewport. Move the buttons outside the scrollable area and pin them with a background and top border so they're always visible.

### Changes

**`src/components/RecipeForm.tsx`**
- Wrap the form in a flex column container with constrained height
- Keep the scrollable `space-y-5` content area inside a `flex-1 overflow-y-auto` div
- Move the Save/Cancel buttons outside the scroll area into a sticky bottom bar with `border-t bg-background pt-3`

This is a layout-only change — no logic changes needed.

