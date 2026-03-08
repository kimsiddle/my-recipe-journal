import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { usePlanner } from '@/context/PlannerContext';
import { useRecipes } from '@/context/RecipeContext';
import { MEAL_CATEGORIES, MealCategory } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ShoppingCart, Trash2, CalendarDays, UtensilsCrossed, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

const PLAN_MEALS: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner'];

export default function Planner() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [pickerOpen, setPickerOpen] = useState<{ date: string; meal: MealCategory } | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const { assignRecipe, removeRecipe, getRecipeId, clearWeek, getPlannedRecipeIds } = usePlanner();
  const { recipes, getRecipe } = useRecipes();

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), dayNum: format(d, 'd'), fullLabel: format(d, 'MMM d') };
    });
  }, [weekStart]);

  const weekDates = weekDays.map(d => d.date);

  // Shopping list
  const shoppingList = useMemo(() => {
    const plannedIds = getPlannedRecipeIds(weekDates);
    const ingredientMap = new Map<string, Set<string>>();

    plannedIds.forEach(id => {
      const recipe = getRecipe(id);
      if (!recipe) return;
      recipe.ingredients.forEach(ing => {
        const key = ing.toLowerCase();
        if (!ingredientMap.has(key)) ingredientMap.set(key, new Set());
        ingredientMap.get(key)!.add(recipe.title);
      });
    });

    return Array.from(ingredientMap.entries())
      .map(([ingredient, recipeNames]) => ({ ingredient, recipes: Array.from(recipeNames) }))
      .sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  }, [weekDates, getPlannedRecipeIds, getRecipe]);

  const copyShoppingList = () => {
    const text = shoppingList.map(item => `☐ ${item.ingredient}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Shopping list copied!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Week nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-display">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowShoppingList(true)}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Shopping List
            {shoppingList.length > 0 && (
              <Badge variant="default" className="ml-1.5 text-xs h-5 min-w-5 justify-center">
                {shoppingList.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { clearWeek(weekDates); toast.success('Week cleared'); }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {weekDays.map(day => (
          <div key={day.date} className="text-center pb-2">
            <p className="text-xs text-muted-foreground uppercase">{day.label}</p>
            <p className="font-display text-lg">{day.dayNum}</p>
          </div>
        ))}

        {/* Meal rows */}
        {PLAN_MEALS.map(meal => (
          weekDays.map(day => {
            const recipeId = getRecipeId(day.date, meal);
            const recipe = recipeId ? getRecipe(recipeId) : null;

            return (
              <div
                key={`${day.date}-${meal}`}
                className="min-h-[80px] rounded-lg border bg-card p-2 flex flex-col"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{meal}</p>
                {recipe ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      {recipe.imageUrl && (
                        <img src={recipe.imageUrl} alt="" className="w-full h-10 object-cover rounded mb-1" />
                      )}
                      <p className="text-xs font-medium leading-tight line-clamp-2">{recipe.title}</p>
                    </div>
                    <button
                      onClick={() => removeRecipe(day.date, meal)}
                      className="self-end mt-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickerOpen({ date: day.date, meal })}
                    className="flex-1 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 rounded transition-colors"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* Recipe picker dialog */}
      <Dialog open={!!pickerOpen} onOpenChange={() => setPickerOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Pick a recipe for {pickerOpen?.meal}
            </DialogTitle>
            <DialogDescription>
              {pickerOpen && format(new Date(pickerOpen.date + 'T12:00:00'), 'EEEE, MMM d')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {recipes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recipes yet. Add some first!</p>
            ) : (
              recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    if (pickerOpen) {
                      assignRecipe(pickerOpen.date, pickerOpen.meal, recipe.id);
                      setPickerOpen(null);
                      toast.success(`${recipe.title} added`);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UtensilsCrossed className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{recipe.title}</p>
                    <p className="text-xs text-muted-foreground">{recipe.cookTime} · {recipe.difficulty}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{recipe.rating}/10</Badge>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping list dialog */}
      <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List
            </DialogTitle>
            <DialogDescription>
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
            </DialogDescription>
          </DialogHeader>

          {shoppingList.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Plan some meals to generate your shopping list.</p>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={copyShoppingList} className="self-start">
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy List
              </Button>
              <ShoppingListItems items={shoppingList} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShoppingListItems({ items }: { items: { ingredient: string; recipes: string[] }[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (ing: string) => {
    const next = new Set(checked);
    next.has(ing) ? next.delete(ing) : next.add(ing);
    setChecked(next);
  };

  return (
    <div className="space-y-1">
      {items.map(item => (
        <button
          key={item.ingredient}
          onClick={() => toggle(item.ingredient)}
          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
        >
          <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
            checked.has(item.ingredient) ? 'bg-primary border-primary' : 'border-border'
          }`}>
            {checked.has(item.ingredient) && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm capitalize ${checked.has(item.ingredient) ? 'line-through text-muted-foreground' : ''}`}>
              {item.ingredient}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {item.recipes.join(', ')}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
