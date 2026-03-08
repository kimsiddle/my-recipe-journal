

## Plan: Inline Editable Ingredients

### Problem
Ingredients display as read-only badges. To fix a typo (e.g. "kosher salt" → "salt"), you must delete and re-add the whole ingredient.

### Solution
Make each ingredient badge clickable to enter inline edit mode. Clicking a badge replaces it with two small inputs (amount + name) pre-filled with current values. User edits in place and confirms with Enter or clicks away.

### Changes

**`src/components/RecipeForm.tsx`**
- Add state `editingIndex: number | null` to track which ingredient is being edited
- Add `editAmount` and `editName` state strings
- When user clicks an ingredient badge, set `editingIndex` to that index and populate edit states
- Replace that badge with two inline inputs (amount + name) and a confirm/cancel button pair
- On confirm (Enter key or check button): update the ingredient at that index in `form.ingredients`
- On cancel (Escape or X button): revert to badge view
- Keep the X delete button on non-editing badges

This is a single-file change to `RecipeForm.tsx` — no other files affected.

