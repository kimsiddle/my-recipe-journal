

## Plan: Cook Log + "Rediscover" Feature

### Concept

Add a **Cook Log** to each recipe — a timestamped record of each time you make it. Each log entry can optionally include a rating update, a comment, and photos. This replaces the need to manually track "when did I last make this?"

Then add a **"Rediscover"** sort/filter on the recipe list to surface highly-rated recipes you haven't cooked recently.

### Data Model Changes (`src/types/recipe.ts`)

Add a new `CookLogEntry` interface:

```typescript
export interface CookLogEntry {
  id: string;
  cookedAt: string;       // ISO timestamp
  rating?: number;        // optional rating update (1-10)
  comment?: string;       // optional note
  photoUrls?: string[];   // optional photos
}
```

Add to `Recipe`: `cookLog: CookLogEntry[]` and a computed-friendly `lastCookedAt: string | null`.

### Context Changes (`src/context/RecipeContext.tsx`)

- Add `addCookLog(recipeId, entry)` and `deleteCookLog(recipeId, logId)` methods.
- When a cook log includes a rating, auto-update the recipe's `rating` field.
- When a cook log includes photos, also add them to the recipe's `photos` array.
- Increment localStorage version to `9`.

### New Component: Quick Cook Log (`src/components/CookLogForm.tsx`)

A compact dialog/sheet triggered by a prominent **"I Made This"** button on the recipe detail page. Contains:
- Date picker (defaults to today)
- Optional rating scale (reuse `RatingScale`)
- Optional comment textarea
- Optional photo upload
- Submit button

### Recipe Detail Updates (`src/components/RecipeDetail.tsx`)

- Add an **"I Made This"** button near the top actions.
- Add a **Cook Log** section below notes showing a timeline of past cooks with dates, ratings, comments, and photos.
- Show "Last cooked: X days ago" in the recipe metadata.

### Recipe List: Rediscover Sort (`src/pages/Index.tsx`)

- Add a sort dropdown or toggle: **Recent**, **Rating**, **Rediscover** (high rating + oldest `lastCookedAt` or never cooked).
- "Rediscover" sorts by: `rating DESC, lastCookedAt ASC NULLS FIRST` — surfaces top-rated recipes you haven't made recently.

### Recipe Card Updates (`src/components/RecipeCard.tsx`)

- Show "Last cooked: 3 weeks ago" or "Never cooked" as subtle metadata below the existing badges.

### Summary of Files to Change

| File | Change |
|------|--------|
| `src/types/recipe.ts` | Add `CookLogEntry`, update `Recipe` |
| `src/context/RecipeContext.tsx` | Add cook log methods, bump version |
| `src/components/CookLogForm.tsx` | New — quick log dialog |
| `src/components/RecipeDetail.tsx` | "I Made This" button + cook log timeline |
| `src/components/RecipeCard.tsx` | Show last cooked date |
| `src/pages/Index.tsx` | Add sort options including "Rediscover" |

