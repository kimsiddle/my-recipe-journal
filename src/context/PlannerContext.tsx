import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { MealCategory } from '@/types/recipe';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PlannerEntry {
  id: string;
  recipeId?: string;
  customName?: string;
}

// key = "YYYY-MM-DD|MealCategory", value = array of entries (supports multiple items per slot)
type PlannerState = Record<string, PlannerEntry[]>;

interface PlannerContextType {
  plan: PlannerState;
  loading: boolean;
  assignRecipe: (date: string, meal: MealCategory, recipeId: string) => Promise<void>;
  assignCustomMeal: (date: string, meal: MealCategory, name: string) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
  clearWeek: (dates: string[]) => Promise<void>;
  getEntries: (date: string, meal: MealCategory) => PlannerEntry[];
  getPlannedRecipeIds: (dates: string[]) => string[];
  checkedIngredients: Set<string>;
  toggleIngredient: (ingredient: string) => Promise<void>;
  clearCheckedIngredients: () => Promise<void>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const makeKey = (date: string, meal: MealCategory) => `${date}|${meal}`;

const ALL_MEALS: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export function PlannerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlannerState>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch meal plan and checked ingredients on mount / user change
  useEffect(() => {
    if (!user) {
      setPlan({});
      setCheckedIngredients(new Set());
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch meal plan
      const { data: mealPlanData } = await supabase
        .from('meal_plan')
        .select('*')
        .eq('user_id', user.id);

      if (mealPlanData) {
        const grouped: PlannerState = {};
        mealPlanData.forEach(row => {
          const key = makeKey(row.date, row.meal_category as MealCategory);
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            id: row.id,
            recipeId: row.recipe_id ?? undefined,
            customName: row.custom_name ?? undefined,
          });
        });
        setPlan(grouped);
      }

      // Fetch checked ingredients
      const { data: checkedData } = await supabase
        .from('shopping_list_checked')
        .select('ingredient')
        .eq('user_id', user.id);

      if (checkedData) {
        setCheckedIngredients(new Set(checkedData.map(r => r.ingredient)));
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const assignRecipe = useCallback(async (date: string, meal: MealCategory, recipeId: string) => {
    if (!user) return;
    
    const tempId = crypto.randomUUID();
    const key = makeKey(date, meal);
    
    // Optimistic update
    setPlan(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: tempId, recipeId }],
    }));

    const { data, error } = await supabase
      .from('meal_plan')
      .insert({ user_id: user.id, date, meal_category: meal, recipe_id: recipeId })
      .select()
      .single();

    if (error) {
      // Rollback
      setPlan(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(e => e.id !== tempId),
      }));
      return;
    }

    // Replace temp id with real id
    setPlan(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(e => e.id === tempId ? { ...e, id: data.id } : e),
    }));
  }, [user]);

  const assignCustomMeal = useCallback(async (date: string, meal: MealCategory, name: string) => {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const key = makeKey(date, meal);

    // Optimistic update
    setPlan(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: tempId, customName: name }],
    }));

    const { data, error } = await supabase
      .from('meal_plan')
      .insert({ user_id: user.id, date, meal_category: meal, custom_name: name })
      .select()
      .single();

    if (error) {
      // Rollback
      setPlan(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(e => e.id !== tempId),
      }));
      return;
    }

    // Replace temp id with real id
    setPlan(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(e => e.id === tempId ? { ...e, id: data.id } : e),
    }));
  }, [user]);

  const removeEntry = useCallback(async (entryId: string) => {
    if (!user) return;

    // Find and remove optimistically
    let removedEntry: PlannerEntry | null = null;
    let removedKey: string | null = null;

    setPlan(prev => {
      const updated = { ...prev };
      for (const key of Object.keys(updated)) {
        const idx = updated[key].findIndex(e => e.id === entryId);
        if (idx !== -1) {
          removedEntry = updated[key][idx];
          removedKey = key;
          updated[key] = updated[key].filter(e => e.id !== entryId);
          if (updated[key].length === 0) delete updated[key];
          break;
        }
      }
      return updated;
    });

    const { error } = await supabase.from('meal_plan').delete().eq('id', entryId);

    if (error && removedEntry && removedKey) {
      // Rollback
      setPlan(prev => ({
        ...prev,
        [removedKey!]: [...(prev[removedKey!] || []), removedEntry!],
      }));
    }
  }, [user]);

  const clearWeek = useCallback(async (dates: string[]) => {
    if (!user) return;

    // Store current state for rollback
    const previousPlan = { ...plan };

    // Optimistic clear
    setPlan(prev => {
      const updated = { ...prev };
      dates.forEach(d => {
        ALL_MEALS.forEach(m => {
          delete updated[makeKey(d, m)];
        });
      });
      return updated;
    });

    const { error } = await supabase
      .from('meal_plan')
      .delete()
      .eq('user_id', user.id)
      .in('date', dates);

    if (error) {
      setPlan(previousPlan);
    }
  }, [user, plan]);

  const getEntries = useCallback((date: string, meal: MealCategory): PlannerEntry[] => {
    return plan[makeKey(date, meal)] || [];
  }, [plan]);

  const getPlannedRecipeIds = useCallback((dates: string[]) => {
    const ids = new Set<string>();
    dates.forEach(d => {
      ALL_MEALS.forEach(m => {
        const entries = plan[makeKey(d, m)] || [];
        entries.forEach(e => {
          if (e.recipeId) ids.add(e.recipeId);
        });
      });
    });
    return Array.from(ids);
  }, [plan]);

  const toggleIngredient = useCallback(async (ingredient: string) => {
    if (!user) return;

    const wasChecked = checkedIngredients.has(ingredient);

    // Optimistic update
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (wasChecked) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });

    if (wasChecked) {
      const { error } = await supabase
        .from('shopping_list_checked')
        .delete()
        .eq('user_id', user.id)
        .eq('ingredient', ingredient);

      if (error) {
        setCheckedIngredients(prev => new Set(prev).add(ingredient));
      }
    } else {
      const { error } = await supabase
        .from('shopping_list_checked')
        .insert({ user_id: user.id, ingredient });

      if (error) {
        setCheckedIngredients(prev => {
          const next = new Set(prev);
          next.delete(ingredient);
          return next;
        });
      }
    }
  }, [user, checkedIngredients]);

  const clearCheckedIngredients = useCallback(async () => {
    if (!user) return;

    const previous = new Set(checkedIngredients);

    // Optimistic clear
    setCheckedIngredients(new Set());

    const { error } = await supabase
      .from('shopping_list_checked')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      setCheckedIngredients(previous);
    }
  }, [user, checkedIngredients]);

  return (
    <PlannerContext.Provider value={{ 
      plan, 
      loading,
      assignRecipe, 
      assignCustomMeal, 
      removeEntry, 
      clearWeek, 
      getEntries, 
      getPlannedRecipeIds, 
      checkedIngredients, 
      toggleIngredient, 
      clearCheckedIngredients 
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}
