

## Plan: Structured Ingredients with Measurements

### Problem
Ingredients are currently stored as flat strings (`string[]`). You want to capture quantity/measurement per ingredient while keeping the ability to quickly search and filter by ingredient name.

### Data Model Change

Replace `ingredients: string[]` with a structured format. To avoid a full DB migration of the column type, store ingredients as a JSON array of objects within the existing `text[]` column — or better, add a proper approach:

**New ingredient structure:**
```typescript
interface Ingredient {
  name: string;       // "chicken breast" — used for search/sort/autocomplete
  amount: string;     // "2 lbs" or "1 cup" — freeform for flexibility
}
```

**Database**: The `recipes.ingredients` column is `text[]`. We'll encode each ingredient as `"amount|name"` (pipe-delimited) so the DB column stays the same. Parsing/formatting happens in the app layer. Existing plain-text ingredients (no pipe) are treated as name-only with empty amount — fully backward compatible.

### Changes

1. **`src/types/recipe.ts`** — Add `Ingredient` interface. Update `Recipe.ingredients` from `string[]` to `Ingredient[]`. Keep a helper to extract just names for search/filter.

2. **`src/context/RecipeContext.tsx`** — Update `mapDbToRecipe` to parse `"amount|name"` strings into `Ingredient` objects. Update insert/update to serialize back. `allIngredients` continues to return unique ingredient *names* for autocomplete and search.

3. **`src/components/RecipeForm.tsx`** — Replace the current ingredient input with a two-field row: a small "amount" input (e.g. "2 cups") and the existing autocomplete for the ingredient name. Display ingredients as badges showing `"2 cups chicken breast"`. 

4. **`src/components/IngredientAutocomplete.tsx`** — Keep as-is (it autocompletes by name). The parent now passes ingredient names only.

5. **`src/components/RecipeDetail.tsx`** — Display ingredients with amounts: `"2 cups — Flour"` or just the name if no amount.

6. **`src/pages/Index.tsx`** — Search filter already checks `r.ingredients`; update to check `ingredient.name` instead.

7. **Planner shopping list** — Update to show amounts alongside ingredient names when aggregating.

### No DB Migration Needed
The `text[]` column stores the pipe-delimited format. Old data without a pipe is parsed as name-only, so existing recipes work without any migration.

