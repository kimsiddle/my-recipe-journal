-- Create meal_category_options table
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