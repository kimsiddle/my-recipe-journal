import { Recipe } from '@/types/recipe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingScale } from '@/components/RatingScale';
import { UtensilsCrossed, Clock, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const lastCooked = recipe.lastCookedAt
    ? formatDistanceToNow(new Date(recipe.lastCookedAt), { addSuffix: true })
    : null;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-[var(--shadow-recipe-hover)]"
      style={{ boxShadow: 'var(--shadow-recipe)' }}
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-display text-lg leading-tight mb-1">{recipe.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>
        <RatingScale rating={recipe.rating} size="sm" />
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs font-body">
            {recipe.mealCategory}
          </Badge>
          {recipe.cookTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recipe.cookTime}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {recipe.difficulty}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {lastCooked ? `Cooked ${lastCooked}` : 'Never cooked'}
        </p>
      </CardContent>
    </Card>
  );
}
