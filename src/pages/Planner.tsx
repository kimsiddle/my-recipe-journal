import { useState, useMemo } from 'react';
import { formatIngredient } from '@/types/recipe';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { usePlanner } from '@/context/PlannerContext';
import { useRecipes } from '@/context/RecipeContext';
import { MEAL_CATEGORIES, MealCategory } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ShoppingCart, Trash2, CalendarDays, UtensilsCrossed, Check, Copy, Type } from 'lucide-react';
import { toast } from 'sonner';

const PLAN_MEALS: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner'];

export default function Planner() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [pickerOpen, setPickerOpen] = useState<{ date: string; meal: MealCategory } | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [quickText, setQuickText] = useState('');

  const { assignRecipe, assignCustomMeal, removeRecipe, getEntry, clearWeek, getPlannedRecipeIds, checkedIngredients, toggleIngredient, clearCheckedIngredients } = usePlanner();
  const { recipes, getRecipe } = useRecipes();

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), dayNum: format(d, 'd'), fullLabel: format(d, 'MMM d') };
    });
  }, [weekStart]);

  const weekDates = weekDays.map(d => d.date);

  // Shopping list — only includes saved recipes, not custom text entries
  const shoppingList = useMemo(() => {
    const plannedIds = getPlannedRecipeIds(weekDates);
    const ingredientMap = new Map<string, Set<string>>();

    plannedIds.forEach(id => {
      const recipe = getRecipe(id);
      if (!recipe) return;
      recipe.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
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

  const handleQuickAdd = () => {
    const trimmed = quickText.trim();
    if (!trimmed || !pickerOpen) return;
    assignCustomMeal(pickerOpen.date, pickerOpen.meal, trimmed);
    setQuickText('');
    setPickerOpen(null);
    toast.success(`"${trimmed}" added`);
  };

  // Helper to render a meal cell's content
  const renderMealContent = (date: string, meal: MealCategory, compact = false) => {
    const entry = getEntry(date, meal);
    if (!entry) return null;

    if (entry.recipeId) {
      const recipe = getRecipe(entry.recipeId);
      if (!recipe) return null;
      return {
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        isCustom: false,
      };
    }

    if (entry.customName) {
      return {
        title: entry.customName,
        imageUrl: null,
        isCustom: true,
      };
    }

    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Week nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base sm:text-lg font-display">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
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
        </div>
      </div>

      {/* Desktop: Week grid */}
      <div className="hidden md:grid grid-cols-[auto_repeat(7,1fr)] gap-2">
        {/* Header row */}
        <div />
        {weekDays.map(day => (
          <div key={day.date} className="text-center pb-2">
            <p className="text-xs text-muted-foreground uppercase">{day.label}</p>
            <p className="font-display text-lg">{day.dayNum}</p>
          </div>
        ))}

        {/* Meal rows */}
        {PLAN_MEALS.map(meal => (
          <>
            <div key={`${meal}-label`} className="flex items-center pr-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium whitespace-nowrap">{meal}</p>
            </div>
            {weekDays.map(day => {
              const content = renderMealContent(day.date, meal);

              return (
                <div
                  key={`${day.date}-${meal}`}
                  className="min-h-[80px] rounded-lg border bg-card p-2 flex flex-col"
                >
                  {content ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1">
                        {content.imageUrl && (
                          <img src={content.imageUrl} alt="" className="w-full h-10 object-cover rounded mb-1" />
                        )}
                        <p className="text-xs font-medium leading-tight line-clamp-2">
                          {content.isCustom && <Type className="inline h-3 w-3 mr-0.5 text-muted-foreground" />}
                          {content.title}
                        </p>
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
                      onClick={() => { setPickerOpen({ date: day.date, meal }); setQuickText(''); }}
                      className="flex-1 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 rounded transition-colors"
                    >
                      <UtensilsCrossed className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Mobile: Stacked day view */}
      <div className="md:hidden space-y-4">
        {weekDays.map(day => (
          <div key={day.date} className="rounded-xl border bg-card overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b">
              <p className="text-sm font-medium">
                <span className="text-muted-foreground">{day.label}</span>{' '}
                <span className="font-display">{day.fullLabel}</span>
              </p>
            </div>
            <div className="divide-y">
              {PLAN_MEALS.map(meal => {
                const content = renderMealContent(day.date, meal);

                return (
                  <div key={meal} className="flex items-center gap-3 px-3 py-2.5 min-h-[52px]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium w-16 shrink-0">
                      {meal}
                    </span>
                    {content ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {content.imageUrl && (
                          <img src={content.imageUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                        )}
                        <p className="text-sm font-medium truncate flex-1">
                          {content.isCustom && <Type className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                          {content.title}
                        </p>
                        <button
                          onClick={() => removeRecipe(day.date, meal)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setPickerOpen({ date: day.date, meal }); setQuickText(''); }}
                        className="flex-1 flex items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors py-1"
                      >
                        <UtensilsCrossed className="h-3.5 w-3.5" />
                        <span className="text-xs">Add meal</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Meal picker dialog — quick text + recipe list */}
      <Dialog open={!!pickerOpen} onOpenChange={() => setPickerOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add {pickerOpen?.meal}
            </DialogTitle>
            <DialogDescription>
              {pickerOpen && format(new Date(pickerOpen.date + 'T12:00:00'), 'EEEE, MMM d')}
            </DialogDescription>
          </DialogHeader>

          {/* Quick text entry */}
          <div className="mt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quick entry</p>
            <form
              onSubmit={e => { e.preventDefault(); handleQuickAdd(); }}
              className="flex gap-2"
            >
              <Input
                value={quickText}
                onChange={e => setQuickText(e.target.value)}
                placeholder="Type a dish name (e.g. Tacos)"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={!quickText.trim()}>
                Add
              </Button>
            </form>
          </div>

          {/* Saved recipes */}
          {recipes.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">From your recipes</p>
              <div className="space-y-2">
                {recipes.map(recipe => (
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
                ))}
              </div>
            </div>
          )}
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyShoppingList}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy List
                </Button>
                {checkedIngredients.size > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCheckedIngredients}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Clear Checked
                  </Button>
                )}
              </div>
              <ShoppingListItems items={shoppingList} checked={checkedIngredients} onToggle={toggleIngredient} />
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
