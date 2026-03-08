import { useState, useRef } from 'react';
import { RecipeFormData, MEAL_CATEGORIES, PROTEIN_TAGS, DIFFICULTY_LEVELS, MealCategory, ProteinTag, SourceType } from '@/types/recipe';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RatingScale } from '@/components/RatingScale';
import { X, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import { useRecipes } from '@/context/RecipeContext';

interface RecipeFormProps {
  initial?: RecipeFormData;
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
}

const emptyForm: RecipeFormData = {
  title: '',
  description: '',
  imageUrl: null,
  ingredients: [],
  instructions: '',
  rating: 0,
  difficulty: 'Medium',
  cookTime: '',
  notes: [],
  photos: [],
  source: null,
  mealCategory: 'Dinner',
  proteinTags: [],
  cookLog: [],
  lastCookedAt: null,
};

export function RecipeForm({ initial, onSubmit, onCancel }: RecipeFormProps) {
  const [form, setForm] = useState<RecipeFormData>(initial || emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const { allIngredients } = useRecipes();

  const set = <K extends keyof RecipeFormData>(key: K, val: RecipeFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const addIngredient = (ingredient: string) => {
    if (!form.ingredients.some(i => i.toLowerCase() === ingredient.toLowerCase())) {
      set('ingredients', [...form.ingredients, ingredient]);
    }
  };

  const removeIngredient = (i: number) => {
    set('ingredients', form.ingredients.filter((_, idx) => idx !== i));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => set('imageUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Photo */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Photo</Label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 overflow-hidden hover:bg-muted transition-colors"
        >
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <Camera className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to add a photo</span>
            </>
          )}
        </button>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="font-body font-medium text-sm mb-1.5 block">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="What did you make?"
          required
        />
      </div>

      {/* Meal Category */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Meal</Label>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => set('mealCategory', cat)}>
              <Badge
                variant={form.mealCategory === cat ? 'default' : 'secondary'}
                className="font-body font-normal cursor-pointer"
              >
                {cat}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Protein / Type Tags */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {PROTEIN_TAGS.map(tag => {
            const selected = form.proteinTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => set('proteinTags', selected
                  ? form.proteinTags.filter(t => t !== tag)
                  : [...form.proteinTags, tag]
                )}
              >
                <Badge
                  variant={selected ? 'default' : 'secondary'}
                  className="font-body font-normal cursor-pointer"
                >
                  {tag}
                  {selected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="desc" className="font-body font-medium text-sm mb-1.5 block">Description</Label>
        <Textarea
          id="desc"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="A short description of this dish..."
          rows={2}
        />
      </div>

      {/* Ingredients */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Ingredients</Label>
        <IngredientAutocomplete
          allIngredients={allIngredients}
          currentIngredients={form.ingredients}
          onAdd={addIngredient}
        />
        {form.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.ingredients.map((ing, i) => (
              <Badge key={i} variant="secondary" className="gap-1 font-body font-normal">
                {ing}
                <button type="button" onClick={() => removeIngredient(i)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div>
        <Label htmlFor="instructions" className="font-body font-medium text-sm mb-1.5 block">Instructions</Label>
        <Textarea
          id="instructions"
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
          placeholder="Step-by-step instructions..."
          rows={4}
        />
      </div>

      {/* Rating */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Rating (1-10)</Label>
        <RatingScale rating={form.rating} onChange={val => set('rating', val)} />
      </div>

      {/* Difficulty */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Difficulty</Label>
        <div className="flex gap-1.5">
          {DIFFICULTY_LEVELS.map(level => (
            <button key={level} type="button" onClick={() => set('difficulty', level)}>
              <Badge
                variant={form.difficulty === level ? 'default' : 'secondary'}
                className="font-body font-normal cursor-pointer"
              >
                {level}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Cook Time */}
      <div>
        <Label htmlFor="cookTime" className="font-body font-medium text-sm mb-1.5 block">Cook Time</Label>
        <Input
          id="cookTime"
          value={form.cookTime}
          onChange={e => set('cookTime', e.target.value)}
          placeholder="e.g. 30 min, 1 hour"
        />
      </div>

      {/* Source */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Source</Label>
        <div className="flex gap-1.5 mb-2">
          {(['book', 'website', 'social'] as SourceType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => {
                if (form.source?.type === type) {
                  set('source', null);
                } else {
                  set('source', { type, name: form.source?.name || '', url: type !== 'book' ? (form.source?.url || '') : undefined });
                }
              }}
            >
              <Badge
                variant={form.source?.type === type ? 'default' : 'secondary'}
                className="font-body font-normal cursor-pointer capitalize"
              >
                {type === 'book' ? '📖 Book' : type === 'website' ? '🌐 Website' : '📱 Social'}
              </Badge>
            </button>
          ))}
        </div>
        {form.source && (
          <div className="space-y-2">
            <Input
              value={form.source.name}
              onChange={e => set('source', { ...form.source!, name: e.target.value })}
              placeholder={form.source.type === 'book' ? 'Cookbook name (e.g. Salt Fat Acid Heat)' : form.source.type === 'social' ? 'Account or creator name' : 'Website name (e.g. Bon Appétit)'}
            />
            {(form.source.type === 'website' || form.source.type === 'social') && (
              <Input
                value={form.source.url || ''}
                onChange={e => set('source', { ...form.source!, url: e.target.value || undefined })}
                placeholder={form.source.type === 'social' ? 'Paste social media URL (Instagram, TikTok, etc.)' : 'https://...'}
                type="url"
              />
            )}
          </div>
        )}
      </div>

      {/* Notes are managed separately via the detail view */}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">{initial ? 'Save Changes' : 'Add Recipe'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
