export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string;
  rating: number;
  adjustments: string;
  createdAt: string;
  updatedAt: string;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
