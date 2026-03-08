export interface Ingredient {
  name: string;
  amount: string;
}

export function parseIngredient(raw: string): Ingredient {
  const pipeIdx = raw.indexOf('|');
  if (pipeIdx === -1) return { name: raw, amount: '' };
  return { amount: raw.substring(0, pipeIdx), name: raw.substring(pipeIdx + 1) };
}

export function serializeIngredient(ing: Ingredient): string {
  return ing.amount ? `${ing.amount}|${ing.name}` : ing.name;
}

export function formatIngredient(ing: Ingredient): string {
  return ing.amount ? `${ing.amount} ${ing.name}` : ing.name;
}

export interface RecipePhoto {
  id: string;
  url: string;
  createdAt: string;
}

export interface RecipeNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface CookLogEntry {
  id: string;
  cookedAt: string;
  rating?: number;
  comment?: string;
  photoUrls?: string[];
}

export type SourceType = 'book' | 'website' | 'social';

export interface RecipeSource {
  type: SourceType;
  name: string;
  url?: string;
}

export const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'] as const;
export type MealCategory = typeof MEAL_CATEGORIES[number];

export const PROTEIN_TAGS = ['Poultry', 'Fish', 'Beef', 'Pork', 'Seafood', 'Vegetables', 'Pasta', 'Lamb', 'Tofu'] as const;
export type ProteinTag = typeof PROTEIN_TAGS[number];

export const OCCASION_TAGS = ['Weekday', 'Weekend', 'Crock Pot', 'Freezer Meal', 'Large Group', 'Quick & Easy', 'Meal Prep', 'Hosting', 'Air Fryer', 'InstaPot'] as const;
export type OccasionTag = typeof OCCASION_TAGS[number];

export const COOK_TIME_OPTIONS = [
  '5 min', '10 min', '15 min', '20 min', '25 min', '30 min',
  '45 min', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours', '4+ hours',
] as const;
export type CookTime = typeof COOK_TIME_OPTIONS[number];

export const SERVING_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12] as const;

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  ingredients: Ingredient[];
  instructions: string;
  rating: number;
  difficulty: DifficultyLevel;
  cookTime: string;
  notesText: string;
  photos: RecipePhoto[];
  source: RecipeSource | null;
  mealCategory: MealCategory;
  proteinTags: ProteinTag[];
  occasionTags: OccasionTag[];
  servings: number | null;
  cookLog: CookLogEntry[];
  lastCookedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
