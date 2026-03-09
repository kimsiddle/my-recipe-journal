

## Problem

The ingredients list uses a pill/badge layout where editing inline is cramped — the edit inputs (`w-20` qty, `w-28` name) clip text, especially for long ingredient descriptions like "½ to 1 teaspoon Kashmiri red chili powder ((use less for low heat...))". The pill format also makes scanning the list harder.

## Solution

Replace the flex-wrap pill grid with a **vertical list** where each ingredient is its own row. Each row shows the full ingredient text and is instantly editable by tapping it — the row transforms into inline inputs spanning the full width.

### Layout

```text
Ingredients
[Qty (e.g. 2 cups)] [Add an ingredient________]

  ½ cup (120 ml)  ·  Greek yogurt ((hung curd))     [×]   ← tap row to edit
  ½ to 1 tsp      ·  Kashmiri red chili powder...   [×]
  1 tsp            ·  garam masala                   [×]
  
  // When tapped, row becomes:
  [_Qty_______] [_Name________________________] [✓] [×]
```

### Changes — single file: `src/components/RecipeForm.tsx`

**Lines 461-523** — Replace the `flex flex-wrap gap-1.5` pill container with a vertical `space-y-1` list:

- **Read mode (default):** Each ingredient is a full-width row with qty on the left, name on the right, and a delete button. Tap anywhere on the row to enter edit mode.
- **Edit mode (when `editingIndex === i`):** Row becomes a full-width form with `flex-1` inputs for qty and name — no more `w-20`/`w-28` constraints. Includes save (checkmark) and cancel buttons.
- Remove `Badge` usage for ingredients entirely — use plain text rows with subtle border-bottom or bg-muted/50 for visual separation.
- Keep all existing state (`editingIndex`, `editAmount`, `editName`) and handlers unchanged.

