

## Problem

When clicking "Add" to create a new tag (Meal, Type, or Occasion), the inline input is only `w-28` (7rem / 112px) wide, squeezed into the flex-wrap row of pills. On mobile especially, this makes it hard to see and edit what you're typing.

## Solution

Replace the tiny inline input with a full-width input row that appears **below** the tag pills instead of inline. This gives plenty of room to type and clearly separates the "add new" action from the existing tags.

### Changes

**File: `src/components/RecipeForm.tsx`** — update `renderDynamicTagSection`:

- Move the "Add" button to stay inline with the pills (as it is now)
- When `showInput` is true, render the input form as a **separate full-width row below** the pills div instead of inline within the flex-wrap
- Increase input width from `w-28` to `w-full` (or `flex-1`) so text is never clipped
- Structure becomes:

```text
[Tag1] [Tag2] [Tag3] [+ Add]     ← pills row (flex-wrap)
[__New tag name...____] [+] [×]  ← full-width input row (only when adding)
```

This is a single-file change to the `renderDynamicTagSection` function (lines 117-200 of RecipeForm.tsx).

