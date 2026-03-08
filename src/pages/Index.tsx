import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeCard } from '@/components/RecipeCard';
import { MEAL_CATEGORIES, PROTEIN_TAGS, OCCASION_TAGS, MealCategory, ProteinTag, OccasionTag } from '@/types/recipe';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, CookingPot, X } from 'lucide-react';

type SortMode = 'recent' | 'rating' | 'rediscover';

const Index = () => {
  const { recipes, loading } = useRecipes();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealCategory | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<ProteinTag | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionTag | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const filtered = useMemo(() => {
    const list = recipes.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q));
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
        sorted.sort((a, b) => {
          const ratingDiff = b.rating - a.rating;
          if (Math.abs(ratingDiff) >= 2) return ratingDiff;
          const aTime = a.lastCookedAt ? new Date(a.lastCookedAt).getTime() : 0;
          const bTime = b.lastCookedAt ? new Date(b.lastCookedAt).getTime() : 0;
          if (aTime !== bTime) return aTime - bTime;
          return ratingDiff;
        });
        break;
      default:
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return sorted;
  }, [recipes, search, selectedMeal, selectedProtein, sortMode]);

  return (
    <div className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <h2 className="text-xl font-display">My Recipes</h2>
        <Button size="sm" onClick={() => navigate('/recipe/new')}>
          <Plus className="h-4 w-4 mr-1" />
          Add Recipe
        </Button>
      </div>
      <main className="max-w-5xl mx-auto px-4 pb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="rediscover">Rediscover</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Meal</p>
            <div className="flex flex-wrap gap-1.5">
              {MEAL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedMeal(selectedMeal === cat ? null : cat)}>
                  <Badge variant={selectedMeal === cat ? 'default' : 'secondary'} className="font-body font-normal cursor-pointer">
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
                  <Badge variant={selectedProtein === tag ? 'default' : 'secondary'} className="font-body font-normal cursor-pointer">
                    {tag}
                    {selectedProtein === tag && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CookingPot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {recipes.length === 0 ? "No recipes yet. Add your first one!" : "No recipes match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
