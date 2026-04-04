# My Recipe Journal

A personal recipe tracking app to save, organize, and revisit your favorite recipes.

## Features

- **Import from URL** — Paste any recipe link and the app automatically extracts the title, ingredients (with sections), instructions, cook time, servings, and photo
- **Import from Photo** — Upload a photo of a recipe card or cookbook page to extract details
- **Manual Entry** — Add recipes from scratch with a full editing form
- **Ingredient Sections** — Ingredients are grouped by section (e.g. Dry Rub, Sauce, For the dough) when the recipe calls for it
- **Cook Log** — Log each time you make a recipe with a date, rating, and notes
- **Photo Gallery** — Attach multiple photos to a recipe
- **Meal Planner** — Plan your meals by day of the week
- **Filtering & Search** — Filter recipes by meal category, protein type, occasion, and more
- **Share Recipes** — Share a recipe via link, email, or text message
- **Google Sign-In** — Secure authentication via Google OAuth

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **AI:** Anthropic Claude Haiku for recipe extraction from URLs and photos
- **Deployment:** Vercel (frontend), Supabase (backend)

## How It Works

### URL Import
When you paste a recipe URL, a Supabase Edge Function fetches the page, extracts metadata from structured data (JSON-LD) where available, and uses Claude Haiku to extract ingredients with section groupings and properly formatted instructions.

### Data Storage
Recipes are stored in Supabase with row-level security so each user only sees their own recipes. Ingredients are stored in a pipe-delimited format (`amount|name|section`) that supports both simple and grouped ingredient lists.

## Development

```bash
npm install
npm run dev
```

Requires the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

The Supabase Edge Function (`extract-recipe-url`) requires an `ANTHROPIC_API_KEY` secret set in Supabase.

## Deployment

- Frontend auto-deploys to Vercel on push to `main`
- Edge Functions are deployed manually via the Supabase dashboard
