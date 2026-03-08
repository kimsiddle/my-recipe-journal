import { useState, useMemo } from 'react';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeFormData, MEAL_CATEGORIES, PROTEIN_TAGS, MealCategory, ProteinTag } from '@/types/recipe';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, CookingPot, X } from 'lucide-react';
import { toast } from 'sonner';

type View = { type: 'list' } | { type: 'detail'; id: string } | { type: 'form'; editId?: string };
type SortMode = 'recent' | 'rating' | 'rediscover';

const Index = () => {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, addNote, deleteNote, addPhoto, deletePhoto, addCookLog, deleteCookLog } = useRecipes();
  const [view, setView] = useState<View>({ type: 'list' });
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealCategory | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<ProteinTag | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  // Filter & sort recipes
  const filtered = useMemo(() => {
    const list = recipes.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.toLowerCase().includes(q));
      const matchesMeal = !selectedMeal || r.mealCategory === selectedMeal;
      const matchesProtein = !selectedProtein || r.proteinTags.includes(selectedProtein);
      return matchesSearch && matchesMeal && matchesProtein;
    });

    const sorted = [...list];
    switch (sortMode) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'rediscover':
        // High rating first, then oldest lastCookedAt (never cooked = top priority)
        sorted.sort((a, b) => {
          const ratingDiff = b.rating - a.rating;
          if (Math.abs(ratingDiff) >= 2) return ratingDiff;
          const aTime = a.lastCookedAt ? new Date(a.lastCookedAt).getTime() : 0;
          const bTime = b.lastCookedAt ? new Date(b.lastCookedAt).getTime() : 0;
          if (aTime !== bTime) return aTime - bTime;
          return ratingDiff;
        });
        break;
      default: // recent
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return sorted;
  }, [recipes, search, selectedMeal, selectedProtein, sortMode]);

  const handleAdd = (data: RecipeFormData) => {
    addRecipe(data);
    setView({ type: 'list' });
    toast.success('Recipe added!');
  };

  const handleEdit = (data: RecipeFormData) => {
    if (view.type === 'form' && view.editId) {
      updateRecipe(view.editId, data);
      setView({ type: 'detail', id: view.editId });
      toast.success('Recipe updated!');
    }
  };

  const handleDelete = (id: string) => {
    deleteRecipe(id);
    setDeleteConfirm(null);
    setView({ type: 'list' });
    toast.success('Recipe deleted');
  };

  // Detail view
  if (view.type === 'detail') {
    const recipe = getRecipe(view.id);
    if (!recipe) { setView({ type: 'list' }); return null; }
    return (
      <div className="px-4 py-8">
        <RecipeDetail
          recipe={recipe}
          onBack={() => setView({ type: 'list' })}
          onEdit={() => setView({ type: 'form', editId: recipe.id })}
          onDelete={() => setDeleteConfirm(recipe.id)}
          onAddNote={(text) => {
            addNote(recipe.id, text);
            toast.success('Note added!');
          }}
          onDeleteNote={(noteId) => {
            deleteNote(recipe.id, noteId);
            toast.success('Note removed');
          }}
          onRatingChange={(rating) => {
            updateRecipe(recipe.id, { ...recipe, rating });
            toast.success('Rating updated!');
          }}
          onAddPhoto={(dataUrl) => {
            addPhoto(recipe.id, dataUrl);
            toast.success('Photo added!');
          }}
          onDeletePhoto={(photoId) => {
            deletePhoto(recipe.id, photoId);
            toast.success('Photo removed');
          }}
          onAddCookLog={(entry) => {
            addCookLog(recipe.id, entry);
            toast.success('Cook log added!');
          }}
          onDeleteCookLog={(logId) => {
            deleteCookLog(recipe.id, logId);
            toast.success('Cook log removed');
          }}
        />
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete recipe?</DialogTitle>
              <DialogDescription>This can't be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Form view
  if (view.type === 'form') {
    const editing = view.editId ? getRecipe(view.editId) : undefined;
    const initialData = editing
      ? { title: editing.title, description: editing.description, imageUrl: editing.imageUrl, ingredients: editing.ingredients, instructions: editing.instructions, rating: editing.rating, difficulty: editing.difficulty, cookTime: editing.cookTime, notes: editing.notes, photos: editing.photos, source: editing.source, mealCategory: editing.mealCategory, proteinTags: editing.proteinTags, cookLog: editing.cookLog, lastCookedAt: editing.lastCookedAt }
      : undefined;
    return (
      <div className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-display mb-6">{editing ? 'Edit Recipe' : 'New Recipe'}</h1>
          <RecipeForm
            initial={initialData}
            onSubmit={editing ? handleEdit : handleAdd}
            onCancel={() => setView(editing ? { type: 'detail', id: editing.id } : { type: 'list' })}
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex-1">
      {/* Sub-header */}
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <h2 className="text-xl font-display">My Recipes</h2>
        <Button size="sm" onClick={() => setView({ type: 'form' })}>
          <Plus className="h-4 w-4 mr-1" />
          Add Recipe
        </Button>
      </div>
        <main className="max-w-5xl mx-auto px-4 pb-6">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipes or ingredients..."
              className="pl-9"
            />
          </div>
          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="rediscover">Rediscover</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category filters */}
        <div className="mb-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Meal</p>
            <div className="flex flex-wrap gap-1.5">
              {MEAL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedMeal(selectedMeal === cat ? null : cat)}>
                  <Badge
                    variant={selectedMeal === cat ? 'default' : 'secondary'}
                    className="font-body font-normal cursor-pointer"
                  >
                    {cat}
                    {selectedMeal === cat && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {PROTEIN_TAGS.map(tag => (
                <button key={tag} onClick={() => setSelectedProtein(selectedProtein === tag ? null : tag)}>
                  <Badge
                    variant={selectedProtein === tag ? 'default' : 'secondary'}
                    className="font-body font-normal cursor-pointer"
                  >
                    {tag}
                    {selectedProtein === tag && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <CookingPot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {recipes.length === 0
                ? "No recipes yet. Add your first one!"
                : "No recipes match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setView({ type: 'detail', id: recipe.id })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
