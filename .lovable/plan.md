

## Ingredient Split Tool

When an ingredient has no amount (everything in the name field), give users a quick way to mark the split point between quantity and name — no retyping needed.

### UX Concept

When a user taps an ingredient row that has an empty amount, instead of jumping straight to two separate edit inputs, show the full text as a single string with a **tap-to-split** interaction:

```text
"2 cups all-purpose flour"
      ↑ tap between "cups" and "all-purpose" to split here
```

**Implementation:** Render the full ingredient text as a series of clickable word chips. Tapping between two words sets the split point — everything left becomes `amount`, everything right becomes `name`. A visual divider appears at the split point. User confirms with a checkmark.

### Flow

1. User taps an ingredient row where `amount` is empty
2. Instead of two inputs, show a **split mode**: the full text broken into clickable word segments
3. User taps the gap between words to place a divider — left side highlights as "qty", right side as "name"
4. Tapping a different gap moves the divider
5. Confirm button saves the split; cancel returns to read mode
6. If user prefers manual edit, a small "edit manually" link switches to the standard two-input mode

### Visual

```text
┌─────────────────────────────────────────────┐
│  [2 cups] | [all-purpose flour]    [✓] [×]  │
│   ← qty →   ← ingredient name →             │
│                          [edit manually]      │
└─────────────────────────────────────────────┘

Words shown as tappable segments:
  [ 2 ]  [ cups ]  │  [ all-purpose ]  [ flour ]
                    ↑ split point (tap between words to move)
```

### Technical Changes

**`src/components/IngredientSplitter.tsx`** (new component)
- Props: `text: string`, `onSplit: (amount: string, name: string) => void`, `onCancel: () => void`, `onEditManually: () => void`
- Splits text into words, renders as inline segments
- Tracks `splitIndex` state — words before index = amount, after = name
- Default `splitIndex` heuristic: auto-detect likely split using the existing `parseIngredientString` regex from `ingredientParser.ts`
- Tapping a gap between words updates `splitIndex`

**`src/components/RecipeForm.tsx`**
- When user taps an ingredient with empty `amount`: show `<IngredientSplitter>` instead of the two-input edit form
- When `amount` is already populated: go straight to the standard two-input edit mode
- Wire `onSplit` to update the ingredient's `amount` and `name`; `onEditManually` switches to the existing input mode

**`src/lib/ingredientParser.ts`**
- Export `suggestSplitIndex(words: string[]): number` — uses the existing regex logic to suggest where to split, giving the splitter a smart default position

