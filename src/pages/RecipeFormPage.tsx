import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeImageImport, ExtractedRecipe } from '@/components/RecipeImageImport';
import { RecipeFormData } from '@/types/recipe';
import { toast } from 'sonner';

const RecipeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe, addRecipe, updateRecipe } = useRecipes();

  const editing = id ? getRecipe(id) : undefined;
  const [importData, setImportData] = useState<RecipeFormData | null>(null);
  const [showImport, setShowImport] = useState(!editing);

  const initialData: RecipeFormData | undefined = editing
    ? {
        title: editing.title, description: editing.description, imageUrl: editing.imageUrl,
        ingredients: editing.ingredients, instructions: editing.instructions, rating: editing.rating,
        difficulty: editing.difficulty, cookTime: editing.cookTime, notes: editing.notes,
        photos: editing.photos, source: editing.source, mealCategory: editing.mealCategory,
        proteinTags: editing.proteinTags, cookLog: editing.cookLog, lastCookedAt: editing.lastCookedAt,
      }
    : importData || undefined;

  const handleSubmit = async (data: RecipeFormData) => {
    if (editing) {
      await updateRecipe(editing.id, data);
      navigate(`/recipe/${editing.id}`);
      toast.success('Recipe updated!');
    } else {
      await addRecipe(data);
      navigate('/');
      toast.success('Recipe added!');
    }
  };

  const handleCancel = () => {
    if (editing) {
      navigate(`/recipe/${editing.id}`);
    } else {
      navigate('/');
    }
  };

  const handleExtracted = (data: ExtractedRecipe) => {
    setImportData({
      title: data.title,
      description: '',
      imageUrl: data.imageUrl,
      ingredients: data.ingredients,
      instructions: data.instructions,
      rating: 0,
      difficulty: 'Medium',
      cookTime: '',
      notes: data.notes
        ? [{ id: crypto.randomUUID(), text: data.notes, createdAt: new Date().toISOString() }]
        : [],
      photos: [],
      source: null,
      mealCategory: 'Dinner',
      proteinTags: [],
      cookLog: [],
      lastCookedAt: null,
    });
    setShowImport(false);
    toast.success('Recipe extracted! Review and edit below.');
  };

  // For new recipes, show import step first
  if (!editing && showImport) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <RecipeImageImport
            onExtracted={handleExtracted}
            onSkip={() => setShowImport(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-display mb-6">{editing ? 'Edit Recipe' : 'New Recipe'}</h1>
        <RecipeForm initial={initialData} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default RecipeFormPage;
