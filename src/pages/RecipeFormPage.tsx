import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeFormData } from '@/types/recipe';
import { toast } from 'sonner';

const RecipeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe, addRecipe, updateRecipe } = useRecipes();

  const editing = id ? getRecipe(id) : undefined;
  const initialData: RecipeFormData | undefined = editing
    ? {
        title: editing.title, description: editing.description, imageUrl: editing.imageUrl,
        ingredients: editing.ingredients, instructions: editing.instructions, rating: editing.rating,
        difficulty: editing.difficulty, cookTime: editing.cookTime, notes: editing.notes,
        photos: editing.photos, source: editing.source, mealCategory: editing.mealCategory,
        proteinTags: editing.proteinTags, cookLog: editing.cookLog, lastCookedAt: editing.lastCookedAt,
      }
    : undefined;

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
