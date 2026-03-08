import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MealCategory } from '@/types/recipe';

interface PlannerEntry {
  recipeId: string;
}

// key = "YYYY-MM-DD|MealCategory"
type PlannerState = Record<string, PlannerEntry>;

interface PlannerContextType {
  plan: PlannerState;
  assignRecipe: (date: string, meal: MealCategory, recipeId: string) => void;
  removeRecipe: (date: string, meal: MealCategory) => void;
  clearWeek: (dates: string[]) => void;
  getRecipeId: (date: string, meal: MealCategory) => string | undefined;
  getPlannedRecipeIds: (dates: string[]) => string[];
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const makeKey = (date: string, meal: MealCategory) => `${date}|${meal}`;

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlannerState>(() => {
    const stored = localStorage.getItem('meal_plan');
    return stored ? JSON.parse(stored) : {};
  });

  const save = (updated: PlannerState) => {
    setPlan(updated);
    localStorage.setItem('meal_plan', JSON.stringify(updated));
  };

  const assignRecipe = useCallback((date: string, meal: MealCategory, recipeId: string) => {
    const key = makeKey(date, meal);
    save({ ...plan, [key]: { recipeId } });
  }, [plan]);

  const removeRecipe = useCallback((date: string, meal: MealCategory) => {
    const key = makeKey(date, meal);
    const updated = { ...plan };
    delete updated[key];
    save(updated);
  }, [plan]);

  const clearWeek = useCallback((dates: string[]) => {
    const updated = { ...plan };
    dates.forEach(d => {
      (['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'] as MealCategory[]).forEach(m => {
        delete updated[makeKey(d, m)];
      });
    });
    save(updated);
  }, [plan]);

  const getRecipeId = useCallback((date: string, meal: MealCategory) => {
    return plan[makeKey(date, meal)]?.recipeId;
  }, [plan]);

  const getPlannedRecipeIds = useCallback((dates: string[]) => {
    const ids = new Set<string>();
    dates.forEach(d => {
      (['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'] as MealCategory[]).forEach(m => {
        const entry = plan[makeKey(d, m)];
        if (entry) ids.add(entry.recipeId);
      });
    });
    return Array.from(ids);
  }, [plan]);

  return (
    <PlannerContext.Provider value={{ plan, assignRecipe, removeRecipe, clearWeek, getRecipeId, getPlannedRecipeIds }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}
