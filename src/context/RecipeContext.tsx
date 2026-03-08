import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Recipe, RecipeFormData, RecipeNote } from '@/types/recipe';
import margheritaImg from '@/assets/margherita-pizza.jpg';
import curryImg from '@/assets/thai-green-curry.jpg';
import salmonImg from '@/assets/lemon-herb-salmon.jpg';

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'Simple, fresh, and bursting with flavor. San Marzano tomatoes, fresh mozzarella, and basil.',
    imageUrl: margheritaImg,
    ingredients: ['pizza dough', 'San Marzano tomatoes', 'fresh mozzarella', 'fresh basil', 'olive oil', 'salt'],
    instructions: '1. Preheat oven to 500°F.\n2. Stretch dough into a round.\n3. Spread crushed tomatoes.\n4. Tear mozzarella over top.\n5. Bake 10-12 minutes.\n6. Top with fresh basil and olive oil.',
    rating: 9,
    difficulty: 'Medium',
    cookTime: '25 min',
    source: { type: 'website', name: 'Serious Eats', url: 'https://www.seriouseats.com/basic-neapolitan-pizza-dough-recipe' },
    notes: [
      { id: 'n1', text: 'Added a pinch of red pepper flakes for heat.', createdAt: '2026-02-15T12:00:00Z' },
      { id: 'n2', text: 'Next time try with burrata instead of mozzarella.', createdAt: '2026-02-20T18:30:00Z' },
    ],
    mealCategory: 'Dinner',
    proteinTags: ['Vegetables'],
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
  },
  {
    id: '2',
    title: 'Thai Green Curry',
    description: 'Aromatic coconut curry with chicken and vegetables. Perfect weeknight dinner.',
    imageUrl: curryImg,
    ingredients: ['chicken thighs', 'coconut milk', 'green curry paste', 'bamboo shoots', 'Thai basil', 'fish sauce', 'sugar', 'bell pepper', 'jasmine rice'],
    instructions: '1. Cook curry paste in oil until fragrant.\n2. Add chicken, cook until sealed.\n3. Pour in coconut milk.\n4. Add vegetables and simmer 15 min.\n5. Season with fish sauce and sugar.\n6. Serve over jasmine rice with Thai basil.',
    rating: 4,
    source: { type: 'book', name: 'Hot Thai Kitchen' },
    notes: [
      { id: 'n3', text: 'Use 2 cans coconut milk for a richer sauce.', createdAt: '2026-01-25T20:00:00Z' },
      { id: 'n4', text: 'Add eggplant next time — it soaks up the curry beautifully.', createdAt: '2026-03-01T19:00:00Z' },
    ],
    mealCategory: 'Dinner',
    proteinTags: ['Poultry'],
    createdAt: '2026-01-20',
    updatedAt: '2026-03-01',
  },
  {
    id: '3',
    title: 'Lemon Herb Salmon',
    description: 'Pan-seared salmon with a bright lemon and herb butter. Ready in 20 minutes.',
    imageUrl: salmonImg,
    ingredients: ['salmon fillets', 'butter', 'lemon', 'garlic', 'fresh dill', 'fresh parsley', 'salt', 'pepper', 'olive oil'],
    instructions: '1. Pat salmon dry, season with salt and pepper.\n2. Heat olive oil in a skillet over medium-high.\n3. Sear salmon skin-side down 4 min.\n4. Flip, cook 3 more minutes.\n5. Add butter, garlic, lemon juice, and herbs.\n6. Baste salmon with the herb butter.',
    rating: 5,
    source: null,
    notes: [
      { id: 'n5', text: 'Works great with trout too.', createdAt: '2026-03-05T18:00:00Z' },
      { id: 'n6', text: 'Add capers for extra pop.', createdAt: '2026-03-06T12:00:00Z' },
    ],
    mealCategory: 'Dinner',
    proteinTags: ['Fish'],
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
  addNote: (recipeId: string, text: string) => void;
  deleteNote: (recipeId: string, noteId: string) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const stored = localStorage.getItem('recipes');
    const version = localStorage.getItem('recipes_version');
    if (stored && version === '6') return JSON.parse(stored);
    localStorage.setItem('recipes_version', '6');
    localStorage.setItem('recipes', JSON.stringify(SAMPLE_RECIPES));
    return SAMPLE_RECIPES;
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

  const addNote = useCallback((recipeId: string, text: string) => {
    const note: RecipeNote = { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() };
    save(recipes.map(r => r.id === recipeId
      ? { ...r, notes: [...r.notes, note], updatedAt: new Date().toISOString() }
      : r
    ));
  }, [recipes]);

  const deleteNote = useCallback((recipeId: string, noteId: string) => {
    save(recipes.map(r => r.id === recipeId
      ? { ...r, notes: r.notes.filter(n => n.id !== noteId), updatedAt: new Date().toISOString() }
      : r
    ));
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, addNote, deleteNote }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipeProvider');
  return ctx;
}
