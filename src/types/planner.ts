import { MealCategory } from './recipe';

export interface PlannedMeal {
  id: string;
  recipeId: string;
  day: string; // ISO date string (YYYY-MM-DD)
  meal: MealCategory;
}

export interface WeekPlan {
  [dateKey: string]: {
    [meal in MealCategory]?: string; // recipeId
  };
}
