import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Recipe, RecipeFormData } from '@/types/recipe';
import margheritaImg from '@/assets/margherita-pizza.jpg';
import curryImg from '@/assets/thai-green-curry.jpg';
import salmonImg from '@/assets/lemon-herb-salmon.jpg';

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'Simple, fresh, and bursting with flavor. San Marzano tomatoes, fresh mozzarella, and basil.',
    imageUrl: null,
    ingredients: ['pizza dough', 'San Marzano tomatoes', 'fresh mozzarella', 'fresh basil', 'olive oil', 'salt'],
    instructions: '1. Preheat oven to 500°F.\n2. Stretch dough into a round.\n3. Spread crushed tomatoes.\n4. Tear mozzarella over top.\n5. Bake 10-12 minutes.\n6. Top with fresh basil and olive oil.',
    rating: 5,
    adjustments: 'Added a pinch of red pepper flakes for heat. Next time try with burrata instead.',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
  },
  {
    id: '2',
    title: 'Thai Green Curry',
    description: 'Aromatic coconut curry with chicken and vegetables. Perfect weeknight dinner.',
    imageUrl: null,
    ingredients: ['chicken thighs', 'coconut milk', 'green curry paste', 'bamboo shoots', 'Thai basil', 'fish sauce', 'sugar', 'bell pepper', 'jasmine rice'],
    instructions: '1. Cook curry paste in oil until fragrant.\n2. Add chicken, cook until sealed.\n3. Pour in coconut milk.\n4. Add vegetables and simmer 15 min.\n5. Season with fish sauce and sugar.\n6. Serve over jasmine rice with Thai basil.',
    rating: 4,
    adjustments: 'Use 2 cans coconut milk for a richer sauce. Add eggplant next time.',
    createdAt: '2026-01-20',
    updatedAt: '2026-03-01',
  },
  {
    id: '3',
    title: 'Lemon Herb Salmon',
    description: 'Pan-seared salmon with a bright lemon and herb butter. Ready in 20 minutes.',
    imageUrl: null,
    ingredients: ['salmon fillets', 'butter', 'lemon', 'garlic', 'fresh dill', 'fresh parsley', 'salt', 'pepper', 'olive oil'],
    instructions: '1. Pat salmon dry, season with salt and pepper.\n2. Heat olive oil in a skillet over medium-high.\n3. Sear salmon skin-side down 4 min.\n4. Flip, cook 3 more minutes.\n5. Add butter, garlic, lemon juice, and herbs.\n6. Baste salmon with the herb butter.',
    rating: 5,
    adjustments: 'Works great with trout too. Add capers for extra pop.',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05',
  },
];

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (data: RecipeFormData) => void;
  updateRecipe: (id: string, data: RecipeFormData) => void;
  deleteRecipe: (id: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const stored = localStorage.getItem('recipes');
    return stored ? JSON.parse(stored) : SAMPLE_RECIPES;
  });

  const save = (updated: Recipe[]) => {
    setRecipes(updated);
    localStorage.setItem('recipes', JSON.stringify(updated));
  };

  const addRecipe = useCallback((data: RecipeFormData) => {
    const newRecipe: Recipe = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save([newRecipe, ...recipes]);
  }, [recipes]);

  const updateRecipe = useCallback((id: string, data: RecipeFormData) => {
    save(recipes.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r));
  }, [recipes]);

  const deleteRecipe = useCallback((id: string) => {
    save(recipes.filter(r => r.id !== id));
  }, [recipes]);

  const getRecipe = useCallback((id: string) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipeProvider');
  return ctx;
}
