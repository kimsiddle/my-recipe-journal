

## What Happened

When your GitHub changes synced to Lovable, the build broke due to a **missing dependency**. The file `src/components/RichTextEditor.tsx` imports `@tiptap/react`, but that package is not listed in your `package.json`. Previously it may have been installed implicitly, but the sync triggered a fresh dependency resolution that exposed the gap.

The build error is:
```
Cannot find module '@tiptap/react' or its corresponding type declarations
```

Your meal category change itself (in `src/types/recipe.ts`) is fine — it's this unrelated missing dependency that's blocking the preview.

## Fix

**Add `@tiptap/react` to `package.json`** as a dependency. This is the only change needed to restore the preview.

