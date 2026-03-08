

## Plan: Persist Shopping List Checked Items

The shopping list checked items are currently stored in local component state (`useState`), which resets every time the dialog closes. The meal plan itself is already persisted to localStorage.

### Approach

1. **Add checked items state to `PlannerContext`** with localStorage persistence, similar to how `plan` is already stored.

2. **Update `ShoppingListItems`** to use the context instead of local state.

### Changes

**`src/context/PlannerContext.tsx`**:
- Add `checkedIngredients: Set<string>` to state (persisted to localStorage as `shopping_list_checked`)
- Add `toggleIngredient(ingredient: string)` and `clearCheckedIngredients()` functions
- Export these in the context

**`src/pages/Planner.tsx`**:
- Remove local `checked` state from `ShoppingListItems`
- Use `usePlanner().checkedIngredients` and `toggleIngredient` instead
- Optionally add a "Clear checked" button

### Technical Notes
- Using a separate localStorage key (`shopping_list_checked`) keeps it independent from meal plan data
- Week changes won't auto-clear checked items (user can manually clear if desired)

