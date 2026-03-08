

## Plan: Per-Recipe URLs + Share Feature

### Overview
Replace the current `useState`-based view management with proper React Router routes, giving each recipe its own URL (`/recipe/:id`). Then add a share dropdown with copy link, email, and text message options.

### Changes

**1. New page: `src/pages/RecipePage.tsx`**
- Route param `:id` via `useParams()`
- Fetches recipe via `getRecipe(id)` from context
- Renders `RecipeDetail` (moved from Index.tsx) with all existing handlers
- Shows 404-style message if recipe not found
- Delete confirmation dialog lives here too

**2. New page: `src/pages/RecipeFormPage.tsx`**
- Handles both `/recipe/new` and `/recipe/:id/edit`
- Uses `useParams` + `useNavigate` for routing after save/cancel

**3. Update `src/App.tsx`** — Add routes:
- `/recipe/new` → `RecipeFormPage`
- `/recipe/:id` → `RecipePage`
- `/recipe/:id/edit` → `RecipeFormPage`

**4. Simplify `src/pages/Index.tsx`**
- Remove all `view` state management, detail/form rendering
- Keep only the list view with filters
- Recipe cards use `<Link to={/recipe/${id}}>` or `navigate()` instead of `onClick`
- "Add Recipe" button navigates to `/recipe/new`

**5. Add share dropdown to `src/components/RecipeDetail.tsx`**
- New `Share` button with `DropdownMenu` containing:
  - **Copy Link** — copies `window.location.origin + /recipe/${id}` to clipboard, shows toast
  - **Email** — opens `mailto:?subject=Check out: ${title}&body=...` with recipe link
  - **Text Message** — opens `sms:?body=...` with title + link
- Uses existing `DropdownMenu` component and `Share2`, `Copy`, `Mail`, `MessageSquare` icons from lucide

**6. Update `src/components/RecipeCard.tsx`**
- Accept optional `href` prop or wrap with router `Link` for proper anchor behavior (right-click → open in new tab works)

### No backend changes needed
All routing is client-side. Database and RLS policies remain unchanged.

