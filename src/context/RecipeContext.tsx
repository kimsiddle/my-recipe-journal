import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Recipe, RecipeFormData, RecipeNote, RecipePhoto, CookLogEntry, RecipeSource, Ingredient, parseIngredient, serializeIngredient } from '@/types/recipe';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface RecipeContextType {
  recipes: Recipe[];
  allIngredients: string[];
  loading: boolean;
  addRecipe: (data: RecipeFormData) => Promise<void>;
  updateRecipe: (id: string, data: RecipeFormData) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  addPhoto: (recipeId: string, url: string) => Promise<void>;
  deletePhoto: (recipeId: string, photoId: string) => Promise<void>;
  addCookLog: (recipeId: string, entry: Omit<CookLogEntry, 'id'>) => Promise<void>;
  deleteCookLog: (recipeId: string, logId: string) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// Helper to map DB row to Recipe
function mapDbToRecipe(
  row: any,
  photos: any[],
  cookLog: any[]
): Recipe {
  const source: RecipeSource | null = row.source_type
    ? { type: row.source_type, name: row.source_name || '', url: row.source_url || undefined }
    : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    imageUrl: row.image_url,
    ingredients: (row.ingredients || []).map((s: string) => parseIngredient(s)),
    instructions: row.instructions || '',
    rating: row.rating || 0,
    difficulty: row.difficulty || 'Medium',
    cookTime: row.cook_time || '',
    source,
    mealCategory: row.meal_category || 'Dinner',
    proteinTags: row.protein_tags || [],
    occasionTags: row.occasion_tags || [],
    servings: row.servings ?? null,
    notesText: row.notes_text || '',
    photos: photos.map(p => ({ id: p.id, url: p.url, createdAt: p.created_at })),
    cookLog: cookLog.map(c => ({
      id: c.id,
      cookedAt: c.cooked_at,
      rating: c.rating ?? undefined,
      comment: c.comment ?? undefined,
      photoUrls: c.photo_urls?.length ? c.photo_urls : undefined,
    })),
    lastCookedAt: row.last_cooked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id || null,
  };
}

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecipes = useCallback(async () => {
    const { data: rows, error } = await supabase.from('recipes').select('*').order('updated_at', { ascending: false });
    if (error) { console.error('Error fetching recipes:', error); setLoading(false); return; }

    const { data: allPhotos } = await supabase.from('recipe_photos').select('*').order('created_at');
    const { data: allLogs } = await supabase.from('cook_log_entries').select('*').order('cooked_at');

    const mapped = (rows || []).map(row => mapDbToRecipe(
      row,
      (allPhotos || []).filter(p => p.recipe_id === row.id),
      (allLogs || []).filter(l => l.recipe_id === row.id),
    ));

    setRecipes(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const allIngredients = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of recipes) {
      for (const ing of r.ingredients) {
        const key = ing.name.toLowerCase();
        if (!seen.has(key)) seen.set(key, ing.name);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [recipes]);

  const addRecipe = useCallback(async (data: RecipeFormData) => {
    if (!user) return;
    const { data: row, error } = await supabase.from('recipes').insert({
      title: data.title,
      description: data.description,
      image_url: data.imageUrl,
      ingredients: data.ingredients.map(serializeIngredient),
      instructions: data.instructions,
      rating: data.rating,
      difficulty: data.difficulty,
      cook_time: data.cookTime,
      source_type: data.source?.type || null,
      source_name: data.source?.name || null,
      source_url: data.source?.url || null,
      meal_category: data.mealCategory,
      protein_tags: data.proteinTags,
      last_cooked_at: data.lastCookedAt,
      user_id: user.id,
      servings: data.servings,
      notes_text: data.notesText || '',
    } as any).select().single();

    if (error) { console.error('Error adding recipe:', error); return; }
    await fetchRecipes();
  }, [fetchRecipes, user]);

  const updateRecipe = useCallback(async (id: string, data: RecipeFormData) => {
    const { error } = await supabase.from('recipes').update({
      title: data.title,
      description: data.description,
      image_url: data.imageUrl,
      ingredients: data.ingredients.map(serializeIngredient),
      instructions: data.instructions,
      rating: data.rating,
      difficulty: data.difficulty,
      cook_time: data.cookTime,
      source_type: data.source?.type || null,
      source_name: data.source?.name || null,
      source_url: data.source?.url || null,
      meal_category: data.mealCategory,
      protein_tags: data.proteinTags,
      last_cooked_at: data.lastCookedAt,
      updated_at: new Date().toISOString(),
      servings: data.servings,
      notes_text: data.notesText || '',
    } as any).eq('id', id);

    if (error) { console.error('Error updating recipe:', error); return; }
    await fetchRecipes();
  }, [fetchRecipes]);

  const deleteRecipe = useCallback(async (id: string) => {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) { console.error('Error deleting recipe:', error); return; }
    await fetchRecipes();
  }, [fetchRecipes]);

  const getRecipe = useCallback((id: string) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);


  const addPhoto = useCallback(async (recipeId: string, url: string) => {
    const { error } = await supabase.from('recipe_photos').insert({ recipe_id: recipeId, url });
    if (error) { console.error('Error adding photo:', error); return; }
    await supabase.from('recipes').update({ updated_at: new Date().toISOString() }).eq('id', recipeId);
    await fetchRecipes();
  }, [fetchRecipes]);

  const deletePhoto = useCallback(async (recipeId: string, photoId: string) => {
    const { error } = await supabase.from('recipe_photos').delete().eq('id', photoId);
    if (error) { console.error('Error deleting photo:', error); return; }
    await fetchRecipes();
  }, [fetchRecipes]);

  const addCookLog = useCallback(async (recipeId: string, entry: Omit<CookLogEntry, 'id'>) => {
    const { error } = await supabase.from('cook_log_entries').insert({
      recipe_id: recipeId,
      cooked_at: entry.cookedAt,
      rating: entry.rating ?? null,
      comment: entry.comment ?? null,
      photo_urls: entry.photoUrls || [],
    });
    if (error) { console.error('Error adding cook log:', error); return; }

    // Add photos to gallery
    if (entry.photoUrls?.length) {
      const photoInserts = entry.photoUrls.map(url => ({ recipe_id: recipeId, url }));
      await supabase.from('recipe_photos').insert(photoInserts);
    }

    // Update last_cooked_at and rating on recipe
    const recipe = recipes.find(r => r.id === recipeId);
    const updateData: any = { updated_at: new Date().toISOString() };
    if (entry.rating != null) updateData.rating = entry.rating;

    // Recalculate last_cooked_at
    const allDates = [...(recipe?.cookLog.map(c => c.cookedAt) || []), entry.cookedAt];
    updateData.last_cooked_at = allDates.reduce((latest, d) =>
      !latest || new Date(d) > new Date(latest) ? d : latest, null as string | null
    );

    await supabase.from('recipes').update(updateData).eq('id', recipeId);
    await fetchRecipes();
  }, [fetchRecipes, recipes]);

  const deleteCookLog = useCallback(async (recipeId: string, logId: string) => {
    const { error } = await supabase.from('cook_log_entries').delete().eq('id', logId);
    if (error) { console.error('Error deleting cook log:', error); return; }

    // Recalculate last_cooked_at
    const { data: remaining } = await supabase.from('cook_log_entries').select('cooked_at').eq('recipe_id', recipeId).order('cooked_at', { ascending: false }).limit(1);
    const lastCooked = remaining?.[0]?.cooked_at || null;
    await supabase.from('recipes').update({ last_cooked_at: lastCooked, updated_at: new Date().toISOString() }).eq('id', recipeId);
    await fetchRecipes();
  }, [fetchRecipes]);

  return (
    <RecipeContext.Provider value={{ recipes, allIngredients, loading, addRecipe, updateRecipe, deleteRecipe, getRecipe, addPhoto, deletePhoto, addCookLog, deleteCookLog }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipeProvider');
  return ctx;
}
