import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeImageImport, ExtractedRecipe } from '@/components/RecipeImageImport';
import { RecipeUrlImport } from '@/components/RecipeUrlImport';
import { RecipeFormData } from '@/types/recipe';
import { toast } from 'sonner';
import { Camera, Link2, PenLine } from 'lucide-react';

type ImportMode = 'choose' | 'photo' | 'url';

const RecipeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe, addRecipe, updateRecipe } = useRecipes();

  const editing = id ? getRecipe(id) : undefined;
  const [importData, setImportData] = useState<RecipeFormData | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('choose');
  const [showForm, setShowForm] = useState(!!editing);

  const initialData: RecipeFormData | undefined = editing
    ? {
        title: editing.title, description: editing.description, imageUrl: editing.imageUrl,
        ingredients: editing.ingredients, instructions: editing.instructions, rating: editing.rating,
        difficulty: editing.difficulty, cookTime: editing.cookTime, notesText: editing.notesText,
        photos: editing.photos, source: editing.source, mealCategory: editing.mealCategory,
        proteinTags: editing.proteinTags, occasionTags: editing.occasionTags, cookLog: editing.cookLog, lastCookedAt: editing.lastCookedAt, servings: editing.servings,
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

  const handleExtracted = (data: ExtractedRecipe, url?: string) => {
    const source = url
      ? { type: 'website' as const, name: new URL(url).hostname.replace('www.', ''), url }
      : null;

    setImportData({
      title: data.title,
      description: '',
      imageUrl: data.imageUrl,
      ingredients: data.ingredients,
      instructions: data.instructions,
      rating: 0,
      difficulty: 'Medium',
      cookTime: data.cookTime || '',
      servings: data.servings || null,
      notesText: data.notes || '',
      photos: [],
      source,
      mealCategory: 'Dinner',
      proteinTags: [],
      occasionTags: [],
      cookLog: [],
      lastCookedAt: null,
    });
    setShowForm(true);
    toast.success('Recipe extracted! Review and edit below.');
  };

  // For editing, go straight to form
  if (showForm || editing) {
    return (
    <div className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-display mb-3">{editing ? 'Edit Recipe' : 'New Recipe'}</h1>
          <RecipeForm initial={initialData} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      </div>
    );
  }

  // Import mode screens
  if (importMode === 'photo') {
    return (
      <div className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <RecipeImageImport
            onExtracted={(data) => handleExtracted(data)}
            onSkip={() => { setShowForm(true); }}
          />
        </div>
      </div>
    );
  }

  if (importMode === 'url') {
    return (
      <div className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <RecipeUrlImport
            onExtracted={(data, url) => handleExtracted(data, url)}
            onBack={() => setImportMode('choose')}
          />
        </div>
      </div>
    );
  }

  // Chooser screen
  return (
    <div className="px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display">New Recipe</h1>
          <p className="text-sm text-muted-foreground">How would you like to add your recipe?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setImportMode('photo')}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Import from Photo</p>
              <p className="text-xs text-muted-foreground">Upload a photo of a recipe to extract details</p>
            </div>
          </button>

          <button
            onClick={() => setImportMode('url')}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Import from URL</p>
              <p className="text-xs text-muted-foreground">Paste a link to a recipe page</p>
            </div>
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Start from Scratch</p>
              <p className="text-xs text-muted-foreground">Manually enter your recipe details</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeFormPage;
