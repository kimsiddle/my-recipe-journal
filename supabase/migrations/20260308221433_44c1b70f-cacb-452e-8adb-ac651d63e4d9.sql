CREATE POLICY "Owner can update comments"
ON public.recipe_comments
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM recipes WHERE recipes.id = recipe_comments.recipe_id AND recipes.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM recipes WHERE recipes.id = recipe_comments.recipe_id AND recipes.user_id = auth.uid()
));