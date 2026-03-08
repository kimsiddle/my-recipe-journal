

## Plan: Add "Occasion Tags" Multi-Select Field to Recipes

### Approach
Follow the same pattern as `proteinTags` — a text array column on `recipes` with a predefined set of options and toggle badges in the form. This keeps it simple, consistent, and filterable.

### Default Options
`Weekday`, `Weekend`, `Crock Pot`, `Freezer Meal`, `Large Group`, `Quick & Easy`, `Meal Prep`

### Changes

**1. Database Migration**
- Add `occasion_tags text[] NOT NULL DEFAULT '{}'` column to `recipes` table.

**2. Types (`src/types/recipe.ts`)**
- Add `OCCASION_TAGS` constant array and `OccasionTag` type.
- Add `occasionTags: OccasionTag[]` to `Recipe` interface (included in `RecipeFormData` automatically).

**3. Recipe Context (`src/context/RecipeContext.tsx`)**
- Map `occasion_tags` column in `mapDbToRecipe`, `addRecipe`, and `updateRecipe`.

**4. Recipe Form (`src/components/RecipeForm.tsx`)**
- Add `occasionTags: []` to `emptyForm`.
- Add a toggle badge section (identical pattern to protein tags) below the existing tags area.

**5. Recipe Detail (`src/components/RecipeDetail.tsx`)**
- Display occasion tags as badges in the metadata area.

**6. Recipe Card (`src/components/RecipeCard.tsx`)**
- Optionally show occasion tags as small badges on the card.

**7. Index Page Filtering (`src/pages/Index.tsx`)**
- Add an occasion tag filter row (same pattern as meal category / protein tag filters).

