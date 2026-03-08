

## Fix: Instructions not rendering rich text formatting in view mode

### Root Cause
The `@tailwindcss/typography` package is installed as a dev dependency, but it is **not included in the `plugins` array** in `tailwind.config.ts`. This means the `prose prose-sm` classes on the instructions `div` in `RecipeDetail.tsx` are completely inert — bullets, bold, numbered lists, etc. all get stripped to plain unstyled text.

### Changes

**`tailwind.config.ts`** (single line change)
- Add `require("@tailwindcss/typography")` to the `plugins` array alongside the existing `tailwindcss-animate` plugin.

```
plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
```

That is the only change needed. The HTML is already being rendered correctly via `dangerouslySetInnerHTML`, and the CSS in `index.css` already has supporting styles for lists and formatting. The missing plugin is the sole issue.

