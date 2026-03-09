

## Problem

The outer `<form onSubmit={handleSubmit}>` wrapping the entire RecipeForm catches Enter key presses from **any** input field inside it. When the user presses Enter while typing in any field (e.g. title, cook time), and the title is already filled, the form immediately submits — calling `addRecipe` and navigating to `/` (home page). The user sees this as being "reverted back to the upload option."

## Fix

**`src/components/RecipeForm.tsx`**

1. Change the outer `<form onSubmit={handleSubmit}>` to a `<div>` — this prevents Enter keypresses from triggering submission.
2. Change the submit button from `type="submit"` to `type="button"` with an explicit `onClick={handleSubmit}` (adjusted to not need an event parameter, just call the submit logic directly).
3. Keep the nested `<form>` elements for ingredients and tags as-is — they already have `e.stopPropagation()` and their own submit handlers.

This is a one-file, surgical fix.

