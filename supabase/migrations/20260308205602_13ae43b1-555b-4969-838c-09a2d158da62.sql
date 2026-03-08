-- Add user_id to recipes (nullable for existing data)
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
CREATE POLICY "Owner can delete cook_log" ON public.cook_log_entries FOR DELETE USING (public.is_recipe_owner(recipe_id));