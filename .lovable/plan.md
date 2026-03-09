

## Plan: Migrate Meal Planner & Shopping List to Database

The `meal_plan` and `shopping_list_checked` tables already exist in the database with proper RLS. No schema changes needed. The work is purely code-side.

### 1. Rewrite `src/context/PlannerContext.tsx`

- Add `id` field to `PlannerEntry`, change state to `Record<string, PlannerEntry[]>` (array per slot)
- On mount: fetch from `meal_plan` and `shopping_list_checked` tables (filtered by `auth.uid()`), group meal_plan rows by `date|meal_category` key
- `assignRecipe(date, meal, recipeId)`: optimistically add entry to state, INSERT row into `meal_plan` with `user_id = auth.uid()`
- `assignCustomMeal(date, meal, name)`: same but with `custom_name`
- `removeEntry(entryId)`: DELETE by `id` from `meal_plan`, remove from state
- `clearWeek(dates)`: DELETE from `meal_plan` WHERE `date IN (...)` and `user_id = auth.uid()`
- `toggleIngredient`: INSERT or DELETE from `shopping_list_checked`
- `clearCheckedIngredients`: DELETE all user's rows from `shopping_list_checked`
- Remove all `localStorage` usage
- Import `useAuth` for `user.id`

### 2. Update `src/pages/Planner.tsx`

- `getEntries(date, meal)` returns `PlannerEntry[]` instead of single entry
- Desktop grid cells: map over entries array, show all items + always show "Add" button
- Mobile cells: same — list all entries with individual X buttons, keep Add button visible
- `removeRecipe` calls become `removeEntry(entry.id)` 
- Shopping list: `getPlannedRecipeIds` still works (collects all recipeIds from arrays)

### 3. Update `src/types/planner.ts`

- Update interfaces to match new multi-entry structure

