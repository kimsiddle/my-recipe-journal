

## Plan: Ingredient Autocomplete with Master List

### Approach

Build a **master ingredient list** derived from all ingredients across all recipes. When typing in the ingredient input, show a dropdown of matching suggestions (filtered, case-insensitive). Selecting a suggestion fills the input. This prevents duplicates and speeds up entry.

### Changes

**1. `src/context/RecipeContext.tsx`**
- Add a computed `allIngredients` value: a deduplicated, sorted list of all ingredient strings across all recipes (case-insensitive dedup, preserving original casing of first occurrence).
- Expose it via context: `allIngredients: string[]`.

**2. New component: `src/components/IngredientAutocomplete.tsx`**
- A controlled input with a popover/dropdown showing filtered matches from `allIngredients`.
- Uses the existing `Popover`, `Command` (cmdk) components for the autocomplete list.
- Props: `allIngredients: string[]`, `currentIngredients: string[]` (to exclude already-added ones), `onAdd: (ingredient: string) => void`.
- On Enter or selecting a suggestion, calls `onAdd`. Allows free-text entry for new ingredients not yet in the master list.

**3. `src/components/RecipeForm.tsx`**
- Replace the plain `Input` + `Plus` button for ingredients with the new `IngredientAutocomplete` component.
- Pass `allIngredients` from context and `form.ingredients` as current list.

### UX Details
- Suggestions appear as you type (minimum 1 character).
- Already-added ingredients are excluded from suggestions.
- Pressing Enter with no match adds the typed text as a new ingredient.
- Matching is case-insensitive.

