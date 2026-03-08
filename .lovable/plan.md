

## Plan: Friendly Loading State for Recipe Page

### Problem
When recipes are still loading, `getRecipe(id)` returns `undefined`, so the user sees "Recipe not found" with a plain link — even though the recipe exists and data is just loading.

### Changes

**`src/pages/RecipePage.tsx`**

1. Import `loading` from `useRecipes()` and the `Skeleton` component
2. When `!recipe && loading` — show a friendly loading state with:
   - A cooking pot or utensil icon (from lucide)
   - "Cooking up something good..." text with a subtle animation
   - Skeleton placeholders mimicking the recipe layout (image, title, ingredients)
3. When `!recipe && !loading` — keep the "not found" state but make it friendlier with an icon and warmer copy

### UI
```text
Loading state:
  🍳 (CookingPot icon, animated pulse)
  "Cooking up something good..."
  [skeleton blocks for image + content]

Not found state:
  "We couldn't find this recipe"
  [Back to recipes button]
```

