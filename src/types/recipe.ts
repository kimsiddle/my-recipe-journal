export interface RecipeNote {
  id: string;
  text: string;
  createdAt: string;
}

export type SourceType = 'book' | 'website';

export interface RecipeSource {
  type: SourceType;
  name: string;
  url?: string;
}

export const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'] as const;
export type MealCategory = typeof MEAL_CATEGORIES[number];

export const PROTEIN_TAGS = ['Poultry', 'Fish', 'Beef', 'Pork', 'Seafood', 'Vegetables', 'Pasta', 'Lamb', 'Tofu'] as const;
export type ProteinTag = typeof PROTEIN_TAGS[number];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string;
  rating: number;
  difficulty: DifficultyLevel;
  cookTime: string;
  notes: RecipeNote[];
  source: RecipeSource | null;
  mealCategory: MealCategory;
  proteinTags: ProteinTag[];
  createdAt: string;
  updatedAt: string;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
