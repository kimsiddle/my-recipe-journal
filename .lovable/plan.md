
## Plan: Database Migration with Multiple Entries per Meal Slot

We will move the meal planner to the database so it syncs across your devices, and simultaneously update the structure to allow you to add multiple recipes or custom entries to a single meal slot (e.g., having both a main dish and a side dish for Dinner).

### 1. Database Schema Changes
We will create two new tables linked to your user account, using Row Level Security (RLS) to keep your data private.

**Table: `meal_plan`**
- `id` (UUID, Primary Key)
- `user_id` (UUID, linked to authenticated user)
- `date` (Text, e.g., "YYYY-MM-DD")
- `meal_category` (Text, e.g., "Dinner")
- `recipe_id` (UUID, nullable, linked to recipes table)
- `custom_name` (Text, nullable)
*Unlike the previous design, there will be NO unique constraint on `(date, meal_category)` so you can insert multiple rows for the same meal slot.*

**Table: `shopping_list_checked`**
- `id` (UUID, Primary Key)
- `user_id` (UUID, linked to authenticated user)
- `ingredient` (Text)
*Unique constraint on `(user_id, ingredient)`.*

### 2. Update `PlannerContext.tsx`
We will rewrite the context to use Supabase as the source of truth, storing an array of entries for each slot:
- **State Structure**: Update from `Record<string, PlannerEntry>` to `Record<string, PlannerEntry[]>` to hold multiple meals per slot.
- **Initial Load**: Fetch data from both tables on mount and group the `meal_plan` records by `date` and `meal_category`.
- **Mutations**: 
  - `assignRecipe`/`assignCustomMeal`: Insert a new row into the `meal_plan` table instead of overwriting the existing one.
  - `removeEntry`: Delete a specific row by its unique `id` rather than clearing the whole slot.
  - Keep optimistic updates for a snappy, instant UI feel while database requests process in the background.

### 3. Update `Planner.tsx` UI
- Update the grid cells to loop through and display *all* assigned meals for that slot.
- Keep the "Add" (fork and knife) button visible even when there are already meals assigned, allowing you to continually add more entries to the same slot.
- Each entry will have its own individual "X" button to remove it.
