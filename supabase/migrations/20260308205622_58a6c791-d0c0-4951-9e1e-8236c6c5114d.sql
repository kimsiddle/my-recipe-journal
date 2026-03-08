-- Fix protein_tag_options: only authenticated users can insert/delete
DROP POLICY IF EXISTS "Public insert protein_tags" ON public.protein_tag_options;
DROP POLICY IF EXISTS "Public delete protein_tags" ON public.protein_tag_options;

CREATE POLICY "Auth users can insert protein_tags" ON public.protein_tag_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete protein_tags" ON public.protein_tag_options FOR DELETE USING (auth.uid() IS NOT NULL);