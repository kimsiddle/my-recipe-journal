import { useState, useRef } from 'react';
import { RecipeFormData, MEAL_CATEGORIES, PROTEIN_TAGS, MealCategory, ProteinTag } from '@/types/recipe';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/StarRating';
import { X, Plus, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  notes: [],
  source: null,
  mealCategory: 'Dinner',
  proteinTags: [],
};

export function RecipeForm({ initial, onSubmit, onCancel }: RecipeFormProps) {
  const [form, setForm] = useState<RecipeFormData>(initial || emptyForm);
  const [ingredientInput, setIngredientInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof RecipeFormData>(key: K, val: RecipeFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !form.ingredients.includes(trimmed)) {
      set('ingredients', [...form.ingredients, trimmed]);
      setIngredientInput('');
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
        <div className="flex gap-2">
          <Input
            value={ingredientInput}
            onChange={e => setIngredientInput(e.target.value)}
            placeholder="Add an ingredient"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
          />
          <Button type="button" size="icon" variant="secondary" onClick={addIngredient}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
        <Label className="font-body font-medium text-sm mb-1.5 block">Rating</Label>
        <StarRating rating={form.rating} onChange={val => set('rating', val)} />
      </div>

      {/* Source */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Source</Label>
        <Input
          value={form.source?.name || ''}
          onChange={e => set('source', e.target.value ? { ...form.source, name: e.target.value, url: form.source?.url } : null)}
          placeholder="Cookbook name or website (e.g. Bon Appétit)"
          className="mb-2"
        />
        {form.source?.name && (
          <Input
            value={form.source?.url || ''}
            onChange={e => set('source', { name: form.source!.name, url: e.target.value || undefined })}
            placeholder="Website URL (optional, e.g. https://...)"
            type="url"
          />
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
