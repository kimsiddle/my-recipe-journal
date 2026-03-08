

## Plan: Replace Notes Feed with Single Rich-Text Notes Box

### Overview
Replace the timestamped notes feed with a single always-visible rich-text editor (reusing the existing `RichTextEditor` component) stored directly on the recipe.

### Database Changes
- Add a `notes_text` column (type `text`, default `''`) to the `recipes` table via migration
- The existing `recipe_notes` table stays untouched (no data loss), but will no longer be used in code

### Code Changes

**`src/types/recipe.ts`**
- Add `notesText: string` to the `Recipe` interface
- Remove `notes: RecipeNote[]` from `Recipe` and `RecipeFormData` (or leave it but stop using it)

**`src/context/RecipeContext.tsx`**
- Map `notes_text` from DB row into `recipe.notesText`
- Remove `addNote` / `deleteNote` methods
- Stop fetching from `recipe_notes` table
- Add `notesText` to `addRecipe` and `updateRecipe` DB calls

**`src/components/RecipeDetail.tsx`**
- Remove the entire notes feed section (NoteCard, Add Note button, feed list)
- Replace with an inline `RichTextEditor` for owners (auto-saves on blur or after a short debounce)
- For non-owners / guest mode: render `notesText` as HTML with `prose` classes (read-only)
- Add a `saveNotes` callback prop or handle it internally via `updateRecipe`

**`src/pages/RecipePage.tsx`**
- Remove `addNote` / `deleteNote` prop wiring
- Add an `onNotesChange` handler that calls `updateRecipe` with the new notes text

**`src/components/RecipeDetail.tsx` (NoteCard function)**
- Delete the `NoteCard` sub-component entirely

### UX Behavior
- Owner sees a rich-text editor under "Notes" heading, always visible (no toggle)
- Content saves automatically on blur with a subtle "Saved" toast
- Non-owners see the rendered notes as formatted read-only text

