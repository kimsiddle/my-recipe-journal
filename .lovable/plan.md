

## Plan: Reduce Whitespace on Edit Recipe Page

### Problem
The edit page has excessive whitespace below the sticky Save/Cancel buttons — caused by the page wrapper's `py-8` padding and the form's `max-h-[70vh]` constraint not filling the available space efficiently. The footer "View as guest" area also adds dead space.

### Changes

**`src/pages/RecipeFormPage.tsx`** (lines 83-90)
- Reduce vertical padding on the edit form wrapper from `py-8` to `py-4`
- Reduce bottom margin on the heading from `mb-6` to `mb-3`

**`src/components/RecipeForm.tsx`**
- Change `max-h-[70vh]` to `max-h-[80vh]` to use more of the available viewport, reducing the dead space below the buttons

These are small CSS tweaks — no logic changes.

