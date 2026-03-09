

## Plan: Make All Three Tag Types Dynamic (Database-Backed)

Currently only protein tags are dynamic (backed by `protein_tag_options` table). Meal categories and occasion tags are hardcoded constants. We'll unify all three to follow the same pattern.

### 1. Create Two New Database Tables

Create `meal_category_options` and `occasion_tag_options` tables, mirroring `protein_tag_options`:

```sql
CREATE TABLE public.meal_category_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE
);
ALTER TABLE public.meal_category_options ENABLE ROW LEVEL SECURITY;
-- Same RLS as protein_tag_options: public read, auth insert/delete

CREATE TABLE public.occasion_tag_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE
);
ALTER TABLE public.occasion_tag_options ENABLE ROW LEVEL SECURITY;
-- Same RLS as protein_tag_options: public read, auth insert/delete
```

Seed both tables with current hardcoded values.

### 2. Create Generic `useDynamicTags` Hook

Replace `useProteinTags` with a generic `useDynamicTags(tableName)` hook that works for any of the three tables. Same logic — fetch, add, remove — but parameterized by table name.

### 3. Update `src/types/recipe.ts`

- Keep `MEAL_CATEGORIES`, `PROTEIN_TAGS`, `OCCASION_TAGS` as fallback defaults only (used if DB is empty or for seeding)
- Change `MealCategory`, `ProteinTag`, `OccasionTag` types from narrow literal unions to `string` so dynamic values work

### 4. Update `RecipeForm.tsx`

- Use `useDynamicTags('meal_category_options')` for meal categories — add the same add/remove UI that protein tags already have
- Use `useDynamicTags('occasion_tag_options')` for occasion tags — same add/remove UI
- Replace `useProteinTags()` with `useDynamicTags('protein_tag_options')`

### 5. Update `Index.tsx` (Filter Bar)

- Use all three `useDynamicTags` hooks to populate filter badges dynamically instead of hardcoded arrays

### 6. Update `Planner.tsx`

- Use `useDynamicTags('meal_category_options')` instead of importing `MEAL_CATEGORIES`

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | Create 2 new tables + seed data + RLS |
| `src/hooks/useDynamicTags.ts` | New generic hook (replaces `useProteinTags`) |
| `src/hooks/useProteinTags.ts` | Delete (replaced by generic hook) |
| `src/types/recipe.ts` | Widen tag types to `string`, keep constants as defaults |
| `src/components/RecipeForm.tsx` | Use dynamic hooks for all 3 tag sections, add add/remove UI to meal & occasion |
| `src/pages/Index.tsx` | Use dynamic hooks for filter badges |
| `src/pages/Planner.tsx` | Use dynamic hook for meal categories |

