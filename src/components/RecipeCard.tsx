import { Recipe } from '@/types/recipe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/StarRating';
import { UtensilsCrossed } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
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
        <div className="flex items-center justify-between">
          <StarRating rating={recipe.rating} size="sm" />
          <Badge variant="secondary" className="text-xs font-body">
            {recipe.mealCategory}
          </Badge>
        </div>
        {recipe.proteinTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.proteinTags.map(tag => (
              <span key={tag} className="text-xs text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
