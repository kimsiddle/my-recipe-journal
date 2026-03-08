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
  ('Poultry'), ('Fish'), ('Beef'), ('Pork'), ('Seafood'), ('Vegetables'), ('Pasta'), ('Lamb'), ('Tofu');