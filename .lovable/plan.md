

## Plan: Improve Recipe Save Performance

### Problem
Every mutation (save, rating change, photo add, etc.) calls `fetchRecipes()` which makes **3 sequential API calls** — fetching all recipes, all photos, and all cook log entries. The response payloads are very large because images are stored as base64 data URLs directly in the database. This causes noticeable lag after every save.

### Solution: Optimistic Local State Updates
Instead of re-fetching all data after each mutation, update the local `recipes` state directly with the known changes, avoiding the round-trip entirely.

### Changes

**`src/context/RecipeContext.tsx`**

1. **`updateRecipe`**: After the successful `supabase.update()`, merge the updated fields into the existing recipe in local state via `setRecipes()` instead of calling `fetchRecipes()`.

2. **`addPhoto` / `deletePhoto`**: Update the specific recipe's `photos` array locally after the DB call succeeds.

3. **`addCookLog` / `deleteCookLog`**: Update the specific recipe's `cookLog` array and `lastCookedAt` locally.

4. **`deleteRecipe`**: Filter the recipe out of local state instead of re-fetching.

5. **`addRecipe`**: This one still needs a fetch (to get the generated `id`), but only fetches the single new row via `.select().single()` — which it already does — then appends it to local state.

6. Keep `fetchRecipes()` for the initial load only.

This eliminates the 3-query re-fetch cycle after every user action, making saves feel instant.

