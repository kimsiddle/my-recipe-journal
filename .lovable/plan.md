

## Plan: Remove Dead Tag Constants from `types/recipe.ts`

Delete the unused `MEAL_CATEGORIES`, `PROTEIN_TAGS`, and `OCCASION_TAGS` constants from `src/types/recipe.ts`. Keep the `MealCategory`, `ProteinTag`, and `OccasionTag` type aliases (they're `string` types used elsewhere). No other files need changes since nothing imports these constants.

### Changes

**`src/types/recipe.ts`** — Remove these three lines:
- `export const MEAL_CATEGORIES = ['Appetizer', 'Beverage', ...] as const;`
- `export const PROTEIN_TAGS = ['Poultry', 'Fish', ...] as const;`
- `export const OCCASION_TAGS = ['Weekday', 'Weekend', ...] as const;`

One file, three deleted lines.

