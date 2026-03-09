

## Problem

Two issues causing ingredients to not properly split into quantity/name fields:

1. **JSON-LD path (URL import)**: `normalizeIngredients` receives strings like `"2 cups all-purpose flour"` from JSON-LD `recipeIngredient` and puts the entire string into `name` with an empty `amount`. No parsing is attempted.

2. **AI prompt (both image and URL)**: The tool schema descriptions for `amount` and `name` could be stronger about separating quantity+UOM from the ingredient name. The AI sometimes lumps everything together.

## Solution

### 1. Fix `normalizeIngredients` in `supabase/functions/extract-recipe-url/index.ts`

Add a parsing function that splits ingredient strings like `"2 cups all-purpose flour"` into `{amount: "2 cups", name: "all-purpose flour"}`. Use a regex to match leading quantity + unit patterns (numbers, fractions, units like cups/tbsp/tsp/oz/lb/g/ml/etc.).

```text
"2 cups flour"           → { amount: "2 cups",    name: "flour" }
"1/2 tsp salt"           → { amount: "1/2 tsp",   name: "salt" }
"3 large eggs"           → { amount: "3 large",    name: "eggs" }  // or "3", "large eggs"
"salt to taste"          → { amount: "",           name: "salt to taste" }
```

### 2. Strengthen AI tool schema descriptions in both edge functions

Update the `amount` and `name` field descriptions in the tool call schema for both `extract-recipe/index.ts` and `extract-recipe-url/index.ts`:

- **amount**: `"The quantity and unit of measurement ONLY, e.g. '2 cups', '1 tbsp', '½ tsp', '3 cloves'. Do NOT include the ingredient name here. Empty string if no quantity specified."`
- **name**: `"The ingredient name ONLY, without any quantity or unit. e.g. 'all-purpose flour', 'olive oil', 'garlic'. Do NOT include amounts here."`

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/extract-recipe-url/index.ts` | Add `parseIngredientString()` helper; update `normalizeIngredients` to parse strings; update AI tool schema descriptions |
| `supabase/functions/extract-recipe/index.ts` | Update AI tool schema descriptions for amount/name fields |

