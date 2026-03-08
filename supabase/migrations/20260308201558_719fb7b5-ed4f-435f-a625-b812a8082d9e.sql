
-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  cook_time TEXT NOT NULL DEFAULT '',
  source_type TEXT,
  source_name TEXT,
  source_url TEXT,
  meal_category TEXT NOT NULL DEFAULT 'Dinner',
  protein_tags TEXT[] NOT NULL DEFAULT '{}',
  last_cooked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipe_notes table
CREATE TABLE public.recipe_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipe_photos table
CREATE TABLE public.recipe_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cook_log_entries table
CREATE TABLE public.cook_log_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  cooked_at TIMESTAMPTZ NOT NULL,
  rating INTEGER,
  comment TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cook_log_entries ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Public read recipes" ON public.recipes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert recipes" ON public.recipes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update recipes" ON public.recipes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete recipes" ON public.recipes FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public read notes" ON public.recipe_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert notes" ON public.recipe_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public delete notes" ON public.recipe_notes FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public read photos" ON public.recipe_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert photos" ON public.recipe_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public delete photos" ON public.recipe_photos FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public read cook_log" ON public.cook_log_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert cook_log" ON public.cook_log_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public delete cook_log" ON public.cook_log_entries FOR DELETE TO anon, authenticated USING (true);
