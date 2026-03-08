export interface RecipeNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface RecipeSource {
  name: string;
  url?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string;
  rating: number;
  notes: RecipeNote[];
  source: RecipeSource | null;
  createdAt: string;
  updatedAt: string;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
