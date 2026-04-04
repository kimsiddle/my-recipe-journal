## Migration: Lovable Cloud → Your Own Supabase + Vercel

### Overview

Switch the app from Lovable Cloud's managed auth and backend to your own Supabase project, and prepare for Vercel deployment. The database schema, RLS policies, and edge functions all stay the same — they just move to your Supabase instance.

### Changes

**1. `src/pages/AuthPage.tsx**`

- Remove import of `lovable` from `@/integrations/lovable/index`
- Replace `lovable.auth.signInWithOAuth("google", ...)` with `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
- Import `supabase` from `@/integrations/supabase/client`

**2. `src/integrations/supabase/client.ts**`

- This file auto-reads from `.env` — once you update your env vars to point at your own Supabase project, it just works. No code change needed.

**3. Environment variables**  < This has already been done yesterday

- You'll need to update `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your own Supabase project values. For Vercel, set these in the Vercel dashboard under Settings → Environment Variables. < This has already been done yesterday

**4. Delete `src/integrations/lovable/index.ts**`

- No longer needed since auth goes through the Supabase client directly.

**5. Remove `@lovable.dev/cloud-auth-js` dependency from `package.json**`

**6. Vercel config — add `vercel.json**`

- Add SPA rewrite so all routes serve `index.html` (required for client-side routing):

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Database Setup Guide (for your Supabase dashboard)

You don't need migration files — just run the SQL from the Supabase SQL Editor. Here's what to recreate:

1. **Tables**: `recipes`, `recipe_photos`, `recipe_notes`, `recipe_comments`, `cook_log_entries`, `meal_plan`, `shopping_list_checked`, `meal_category_options`, `protein_tag_options`, `occasion_tag_options` — all with the same columns, defaults, and RLS policies as currently defined.
2. **Function**: `is_recipe_owner(_recipe_id uuid)` — the security definer function used by RLS.
3. **Google Auth**: In your Supabase dashboard, go to Authentication → Providers → Google, enable it, and paste your Google OAuth client ID and secret (from Google Cloud Console). Set the redirect URL shown in Supabase as your authorized redirect URI in Google Cloud.

I can provide the full SQL script for all tables + RLS + functions if you want it.

### Edge Functions

Your two edge functions (`extract-recipe` and `extract-recipe-url`) currently use the Lovable AI gateway (`ai.gateway.lovable.dev`). These will NOT work outside Lovable Cloud since they require the `LOVABLE_API_KEY`. You'll need to either:

- Replace the AI gateway calls with direct Google Gemini API calls (requires your own API key)
- Or use another AI provider

### Files Changed


| File                                | Change                                                        |
| ----------------------------------- | ------------------------------------------------------------- |
| `src/pages/AuthPage.tsx`            | Switch from `lovable.auth` to `supabase.auth.signInWithOAuth` |
| `src/integrations/lovable/index.ts` | Delete                                                        |
| `package.json`                      | Remove `@lovable.dev/cloud-auth-js`                           |
| `vercel.json`                       | Create — SPA rewrite rule                                     |
