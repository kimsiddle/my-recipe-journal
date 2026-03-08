import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MealCategory } from '@/types/recipe';

interface PlannerEntry {
  recipeId?: string;
  customName?: string;
}

// key = "YYYY-MM-DD|MealCategory"
type PlannerState = Record<string, PlannerEntry>;

interface PlannerContextType {
  plan: PlannerState;
  assignRecipe: (date: string, meal: MealCategory, recipeId: string) => void;
  assignCustomMeal: (date: string, meal: MealCategory, name: string) => void;
  removeRecipe: (date: string, meal: MealCategory) => void;
  clearWeek: (dates: string[]) => void;
  getEntry: (date: string, meal: MealCategory) => PlannerEntry | undefined;
  getRecipeId: (date: string, meal: MealCategory) => string | undefined;
  getPlannedRecipeIds: (dates: string[]) => string[];
  checkedIngredients: Set<string>;
  toggleIngredient: (ingredient: string) => void;
  clearCheckedIngredients: () => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const makeKey = (date: string, meal: MealCategory) => `${date}|${meal}`;

const ALL_MEALS: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

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

  const assignCustomMeal = useCallback((date: string, meal: MealCategory, name: string) => {
    const key = makeKey(date, meal);
    save({ ...plan, [key]: { customName: name } });
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
      ALL_MEALS.forEach(m => {
        delete updated[makeKey(d, m)];
      });
    });
    save(updated);
  }, [plan]);

  const getEntry = useCallback((date: string, meal: MealCategory) => {
    return plan[makeKey(date, meal)];
  }, [plan]);

  const getRecipeId = useCallback((date: string, meal: MealCategory) => {
    return plan[makeKey(date, meal)]?.recipeId;
  }, [plan]);

  const getPlannedRecipeIds = useCallback((dates: string[]) => {
    const ids = new Set<string>();
    dates.forEach(d => {
      ALL_MEALS.forEach(m => {
        const entry = plan[makeKey(d, m)];
        if (entry?.recipeId) ids.add(entry.recipeId);
      });
    });
    return Array.from(ids);
  }, [plan]);

  return (
    <PlannerContext.Provider value={{ plan, assignRecipe, assignCustomMeal, removeRecipe, clearWeek, getEntry, getRecipeId, getPlannedRecipeIds }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}
