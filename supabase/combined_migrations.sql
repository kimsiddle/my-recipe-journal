
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
CREATE TABLE public.protein_tag_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.protein_tag_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read protein_tags" ON public.protein_tag_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert protein_tags" ON public.protein_tag_options FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public delete protein_tags" ON public.protein_tag_options FOR DELETE TO anon, authenticated USING (true);

-- Seed with default values
INSERT INTO public.protein_tag_options (name) VALUES
  ('Poultry'), ('Fish'), ('Beef'), ('Pork'), ('Seafood'), ('Vegetables'), ('Pasta'), ('Lamb'), ('Tofu');-- Add user_id to recipes (nullable for existing data)
ALTER TABLE public.recipes ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create recipe_comments table
CREATE TABLE public.recipe_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;

-- Comments: anyone can read and insert, only recipe owner can delete
CREATE POLICY "Anyone can read comments" ON public.recipe_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.recipe_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can delete comments" ON public.recipe_comments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.recipes WHERE recipes.id = recipe_comments.recipe_id AND recipes.user_id = auth.uid()
  )
);

-- Helper function to check recipe ownership
CREATE OR REPLACE FUNCTION public.is_recipe_owner(_recipe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipes WHERE id = _recipe_id AND user_id = auth.uid()
  );
$$;

-- Drop old permissive policies on recipes
DROP POLICY IF EXISTS "Public read recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public delete recipes" ON public.recipes;

-- New recipes policies
CREATE POLICY "Anyone can read recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Auth users can insert recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Owner can update recipes" ON public.recipes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can delete recipes" ON public.recipes FOR DELETE USING (user_id = auth.uid());

-- Drop old policies on recipe_notes
DROP POLICY IF EXISTS "Public read notes" ON public.recipe_notes;
DROP POLICY IF EXISTS "Public insert notes" ON public.recipe_notes;
DROP POLICY IF EXISTS "Public delete notes" ON public.recipe_notes;

-- New recipe_notes policies
CREATE POLICY "Anyone can read notes" ON public.recipe_notes FOR SELECT USING (true);
CREATE POLICY "Owner can insert notes" ON public.recipe_notes FOR INSERT WITH CHECK (public.is_recipe_owner(recipe_id));
CREATE POLICY "Owner can delete notes" ON public.recipe_notes FOR DELETE USING (public.is_recipe_owner(recipe_id));

-- Drop old policies on recipe_photos
DROP POLICY IF EXISTS "Public read photos" ON public.recipe_photos;
DROP POLICY IF EXISTS "Public insert photos" ON public.recipe_photos;
DROP POLICY IF EXISTS "Public delete photos" ON public.recipe_photos;

-- New recipe_photos policies
CREATE POLICY "Anyone can read photos" ON public.recipe_photos FOR SELECT USING (true);
CREATE POLICY "Owner can insert photos" ON public.recipe_photos FOR INSERT WITH CHECK (public.is_recipe_owner(recipe_id));
CREATE POLICY "Owner can delete photos" ON public.recipe_photos FOR DELETE USING (public.is_recipe_owner(recipe_id));

-- Drop old policies on cook_log_entries
DROP POLICY IF EXISTS "Public read cook_log" ON public.cook_log_entries;
DROP POLICY IF EXISTS "Public insert cook_log" ON public.cook_log_entries;
DROP POLICY IF EXISTS "Public delete cook_log" ON public.cook_log_entries;

-- New cook_log_entries policies
CREATE POLICY "Anyone can read cook_log" ON public.cook_log_entries FOR SELECT USING (true);
CREATE POLICY "Owner can insert cook_log" ON public.cook_log_entries FOR INSERT WITH CHECK (public.is_recipe_owner(recipe_id));
CREATE POLICY "Owner can delete cook_log" ON public.cook_log_entries FOR DELETE USING (public.is_recipe_owner(recipe_id));-- Fix protein_tag_options: only authenticated users can insert/delete
DROP POLICY IF EXISTS "Public insert protein_tags" ON public.protein_tag_options;
DROP POLICY IF EXISTS "Public delete protein_tags" ON public.protein_tag_options;

CREATE POLICY "Auth users can insert protein_tags" ON public.protein_tag_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete protein_tags" ON public.protein_tag_options FOR DELETE USING (auth.uid() IS NOT NULL);ALTER TABLE public.recipes ADD COLUMN servings integer DEFAULT null;ALTER TABLE public.recipes ADD COLUMN notes_text text NOT NULL DEFAULT '';ALTER TABLE public.recipe_comments ADD COLUMN photo_url text;CREATE POLICY "Owner can update comments"
ON public.recipe_comments
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM recipes WHERE recipes.id = recipe_comments.recipe_id AND recipes.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM recipes WHERE recipes.id = recipe_comments.recipe_id AND recipes.user_id = auth.uid()
));ALTER TABLE public.recipes ADD COLUMN occasion_tags text[] NOT NULL DEFAULT '{}';DELETE FROM public.recipe_photos WHERE recipe_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
DELETE FROM public.cook_log_entries WHERE recipe_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
DELETE FROM public.recipe_notes WHERE recipe_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
DELETE FROM public.recipe_comments WHERE recipe_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
DELETE FROM public.recipes WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');-- Create meal_category_options table
CREATE TABLE public.meal_category_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE
);
ALTER TABLE public.meal_category_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read meal_categories" ON public.meal_category_options FOR SELECT USING (true);
CREATE POLICY "Auth users can insert meal_categories" ON public.meal_category_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete meal_categories" ON public.meal_category_options FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create occasion_tag_options table
CREATE TABLE public.occasion_tag_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE
);
ALTER TABLE public.occasion_tag_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read occasion_tags" ON public.occasion_tag_options FOR SELECT USING (true);
CREATE POLICY "Auth users can insert occasion_tags" ON public.occasion_tag_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete occasion_tags" ON public.occasion_tag_options FOR DELETE USING (auth.uid() IS NOT NULL);

-- Seed meal categories
INSERT INTO public.meal_category_options (name) VALUES ('Breakfast'), ('Lunch'), ('Dinner'), ('Snack'), ('Dessert');

-- Seed occasion tags
INSERT INTO public.occasion_tag_options (name) VALUES ('Weekday'), ('Weekend'), ('Crock Pot'), ('Freezer Meal'), ('Large Group'), ('Quick & Easy'), ('Meal Prep'), ('Hosting'), ('Air Fryer'), ('InstaPot');