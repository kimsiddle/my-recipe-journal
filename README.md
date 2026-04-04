# 🍳 My Recipe Journal

> *A clean, personal recipe book — built because I couldn't find exactly what I needed, so I decided to build it myself.*

---

## Why I Built This

MY escape after work is holding a glass of red wine and cooking a meal at home. I have a mix of cookbooks, recipe card, printouts and a phone full of saved links, and a habit of discovering great recipes buried under layers of ads and blog distractions. I wanted a clean, distraction-free digital recipe book — one I actually *owned* — where I could save recipes, log when I made them, leave notes for adjustments, and keep track of favorites I return to again and again.

Yes, other apps exist. But none of them checked all my boxes the way I wanted. So I built one.

---

## The Origin Story

This app started on **International Women's Day**, when [Lovable](https://lovable.dev) offered a full day of free usage. I used it to do the heavy lifting of the initial prototype — and what started as a quick test quickly evolved into something I genuinely wanted to keep building.

From the start, I wanted to challenge myself beyond just "make an app that works":

- **User authentication** — so I could add/edit recipes securely, while letting friends and family comment without needing an account
- **AI-powered import** — OCR from photos and URL extraction so I could quickly capture recipes from anywhere
- **A real architecture** — not just a prototype locked inside a platform

Once the prototype proved the concept, I made a deliberate decision: **get it off Lovable entirely and own the stack**. I moved the code to GitHub, researched hosting options, and landed on **Vercel + Supabase** for long-term deployment. I used **Claude Code** to guide me through the migration — which involved swapping the backend, configuring edge functions, and revisiting the AI layer entirely.

The original prototype used **Gemini** for recipe extraction and OCR. As part of the migration, I took the opportunity to evaluate alternatives and landed on **Claude Haiku** — a deliberate upgrade that matched the overall shift to a more intentional, owned stack.  Other models explored included Perplexity Sonar, Open AI and Mistral but in the end Haiku performed the best and would be a cost effective option for token management.

The quick prototype became a series of real architectural decisions, made with the same product instincts I bring to my day job. That was the point.

---

## Features

### 📥 Recipe Import
- **Import from URL** — Paste any recipe link; the app extracts the title, ingredients (with sections), instructions, cook time, servings, and photo automatically
- **Import from Photo** — Upload a photo of a recipe card or cookbook page; AI extracts the details via OCR
- **Manual Entry** — Add recipes from scratch with a full editing form

### 🗂️ Recipe Management
- **Ingredient Sections** — Ingredients are grouped by section (e.g. Dry Rub, Sauce, For the Dough) when the recipe calls for it
- **Photo Gallery** — Attach multiple photos to any recipe
- **Filtering & Search** — Filter by meal category, protein type, occasion, and more
- **Share Recipes** — Share via link, email, or text message

### 📓 Cooking Log & Planning
- **Cook Log** — Log each time you make a recipe with a date, rating, and notes for future adjustments
- **Meal Planner** — Plan your meals by day of the week

### 📓 Meal Planner & Shopping List 
- **Planner** — Map out your meals for the week — either free-form or linked to saved recipes
- **Shopping List** — Generate a consolidated shopping list from your plan automatically

### 🔐 Access & Auth
- **Google Sign-In** — Secure authentication via Google OAuth for adding and editing recipes
- **Public Commenting** — Friends and family can leave comments without needing an account

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| AI / OCR | Anthropic Claude Haiku |
| Deployment | Vercel (frontend) + Supabase (backend) |
| Auth | Google OAuth via Supabase Auth |

---

## How It Works

### URL Import
When you paste a recipe URL, a Supabase Edge Function fetches the page, extracts metadata from structured data (JSON-LD) where available, and uses Claude Haiku to extract ingredients with section groupings and properly formatted instructions — stripping away the ads and blog filler in the process.

### Photo Import
Upload a photo of a recipe card or printed page and Claude Haiku uses OCR to extract and structure the content into the app's recipe format.

### Data Storage
Recipes are stored in Supabase with row-level security so each user only sees their own data. Ingredients use a pipe-delimited format (`amount|name|section`) that elegantly supports both simple lists and grouped sections.

---

## Recent Updates

- ✅ Migrated off Lovable Cloud — full codebase now owned and version-controlled in GitHub
- ✅ Backend moved to Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- ✅ Frontend deployed to Vercel with auto-deploy on push to `main`
- ✅ Swapped Gemini for Claude Haiku for recipe extraction and OCR as part of the migration
- ✅ Edge Functions configured with Anthropic API for URL and photo import
- ✅ Public commenting enabled without requiring authentication

---

## What's Next

*Coming soon*

---

## Technical Setup

<details>
<summary>Local development & environment variables</summary>
```bash
npm install
npm run dev
```

Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

The Supabase Edge Function (`extract-recipe-url`) requires an `ANTHROPIC_API_KEY` secret configured in the Supabase dashboard.

**Deployment:**
- Frontend auto-deploys to Vercel on push to `main`
- Edge Functions are deployed manually via the Supabase dashboard

</details>

---

*Built by Kim Hankinson — product leader, home cook, and occasional vibe coder.*
