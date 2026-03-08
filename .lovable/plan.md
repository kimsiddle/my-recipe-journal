

## Plan: Migrate Meal Plan & Shopping List to Database

The meal planner and shopping list are currently stored in `localStorage` only. Here's the plan to move them to the database.

### 1. Create Database Tables

**`meal_plan` table:**
- `id` (UUID, PK)
- `user_id` (UUID, not null, references auth.users)
- `date` (text, not null) — e.g. "2026-03-08"
- `meal_category` (text, not null) — e.g. "Dinner"
- `recipe_id` (UUID, nullable, references recipes)
- `custom_name` (text, nullable)
- `created_at` (timestamptz, default now())
- No unique constraint on (date, meal_category) — allows multiple entries per slot

**`shopping_list_checked` table:**
- `id` (UUID, PK)
- `user_id` (UUID, not null, references auth.users)
- `ingredient` (text, not null)
- Unique constraint on (user_id, ingredient)

**RLS policies** on both tables: users can only SELECT/INSERT/DELETE their own rows (`user_id = auth.uid()`).

### 2. Rewrite `PlannerContext.tsx`

- Change state from `Record<string, PlannerEntry>` to `Record<string, PlannerEntry[]>` (array per slot for multiple entries)
- On mount, fetch from `meal_plan` and `shopping_list_checked` tables, grouped by date+meal
- `assignRecipe` / `assignCustomMeal`: INSERT a new row (not overwrite)
- `removeEntry(id)`: DELETE by row `id` instead of by slot key
- `toggleIngredient`: upsert/delete from `shopping_list_checked`
- `clearWeek`: DELETE all `meal_plan` rows for the given date range
- Use optimistic updates for instant UI

### 3. Update `Planner.tsx` UI

- Render an array of entries per cell (loop through all meals in a slot)
- Each entry gets its own X button (calls `removeEntry(id)`)
- The "Add meal" button stays visible even when entries already exist
- Shopping list dialog works the same, but reads checked state from DB

### 4. Fix Unrelated Build Error

- The `@tiptap/react` import in `RichTextEditor.tsx` is causing a build error. Will install the missing dependency or adjust the import.

