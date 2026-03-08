

## Updated Plan: Authentication + Owner/Guest Access Control

### Overview
Add authentication so only you (the owner) can access the full app. Friends who receive a shared recipe link can view the recipe and leave comments — nothing else.

### Route Access Rules

| Route | Logged-in Owner | Guest (no login) |
|---|---|---|
| `/auth` | Login/signup page | Login/signup page |
| `/` | Full recipe list | **Redirect to `/auth`** |
| `/recipe/new` | Create recipe | **Redirect to `/auth`** |
| `/recipe/:id/edit` | Edit recipe | **Redirect to `/auth`** |
| `/planner` | Full planner | **Redirect to `/auth`** |
| `/recipe/:id` | Full controls | **Read-only + comments** |

### Implementation

**1. Auth page (`/auth`)**
- Email/password login and signup forms
- Redirect to `/` on success

**2. Auth guard component**
- Wraps protected routes (`/`, `/planner`, `/recipe/new`, `/recipe/:id/edit`)
- Checks session via `onAuthStateChange`; redirects to `/auth` if not logged in
- `/recipe/:id` is **not** wrapped — it's public

**3. Database changes**
- Add `user_id uuid` column to `recipes` (nullable for existing data)
- Create `recipe_comments` table (public insert, no login needed)
- Update RLS on `recipes`, `recipe_notes`, `recipe_photos`, `cook_log_entries`: owner-only for INSERT/UPDATE/DELETE, public SELECT
- Comments: public SELECT + INSERT, owner-only DELETE

**4. RecipeDetail owner vs guest mode**
- If logged in as recipe owner: show all controls (edit, delete, rate, cook log, notes)
- Otherwise: hide all mutation controls, show read-only view + guest comments section (name + message input)

**5. RecipeContext updates**
- Set `user_id` on recipe insert
- Fetch session to determine ownership

