import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeCard } from '@/components/RecipeCard';
import { useDynamicTags } from '@/hooks/useDynamicTags';
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
  const { tags: mealCategories } = useDynamicTags('meal_category_options');
  const { tags: proteinTags } = useDynamicTags('protein_tag_options');
  const { tags: occasionTags } = useDynamicTags('occasion_tag_options');
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const filtered = useMemo(() => {
    const list = recipes.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q));
      const matchesMeal = !selectedMeal || r.mealCategory === selectedMeal;
      const matchesProtein = !selectedProtein || r.proteinTags.includes(selectedProtein);
      const matchesOccasion = !selectedOccasion || r.occasionTags.includes(selectedOccasion);
      return matchesSearch && matchesMeal && matchesProtein && matchesOccasion;
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
  }, [recipes, search, selectedMeal, selectedProtein, selectedOccasion, sortMode]);

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

        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={selectedMeal ?? '__all__'} onValueChange={(v) => setSelectedMeal(v === '__all__' ? null : v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Meal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Meals</SelectItem>
              {[...mealCategories].sort((a, b) => a.localeCompare(b)).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedProtein ?? '__all__'} onValueChange={(v) => setSelectedProtein(v === '__all__' ? null : v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {[...proteinTags].sort((a, b) => a.localeCompare(b)).map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedOccasion ?? '__all__'} onValueChange={(v) => setSelectedOccasion(v === '__all__' ? null : v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Occasions</SelectItem>
              {[...occasionTags].sort((a, b) => a.localeCompare(b)).map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
