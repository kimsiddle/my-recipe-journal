import { MealCategory } from './recipe';

export interface PlannerEntry {
  id: string;
  recipeId?: string;
  customName?: string;
}

export interface PlannedMeal {
  id: string;
  recipeId: string;
  day: string; // ISO date string (YYYY-MM-DD)
  meal: MealCategory;
}

export interface WeekPlan {
  [dateKey: string]: {
    [meal in MealCategory]?: PlannerEntry[];
  };
}
