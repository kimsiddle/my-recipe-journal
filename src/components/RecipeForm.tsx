import { useState, useRef } from 'react';
import { RecipeFormData, MEAL_CATEGORIES, OCCASION_TAGS, DIFFICULTY_LEVELS, COOK_TIME_OPTIONS, SERVING_OPTIONS, MealCategory, ProteinTag, OccasionTag, SourceType, Ingredient, formatIngredient } from '@/types/recipe';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RatingScale } from '@/components/RatingScale';
import { X, Camera, Plus, Trash2, Crop } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import { useRecipes } from '@/context/RecipeContext';
import { useProteinTags } from '@/hooks/useProteinTags';
import { ImageCropper } from '@/components/ImageCropper';
import { RichTextEditor } from '@/components/RichTextEditor';

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
  servings: null,
  notesText: '',
  photos: [],
  source: null,
  mealCategory: 'Dinner',
  proteinTags: [],
  occasionTags: [],
  cookLog: [],
  lastCookedAt: null,
};

export function RecipeForm({ initial, onSubmit, onCancel }: RecipeFormProps) {
  const [form, setForm] = useState<RecipeFormData>(initial || emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const { allIngredients } = useRecipes();
  const { tags: proteinTagOptions, addTag, removeTag } = useProteinTags();
  const [newTagInput, setNewTagInput] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editName, setEditName] = useState('');
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const set = <K extends keyof RecipeFormData>(key: K, val: RecipeFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const addIngredient = (name: string) => {
    if (!form.ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      set('ingredients', [...form.ingredients, { name, amount: ingredientAmount.trim() }]);
      setIngredientAmount('');
    }
  };

  const removeIngredient = (i: number) => {
    set('ingredients', form.ingredients.filter((_, idx) => idx !== i));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    set('imageUrl', croppedUrl);
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleRecrop = () => {
    if (form.imageUrl) {
      setRawImageSrc(form.imageUrl);
      setShowCropper(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
      {/* Photo */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Photo</Label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        {showCropper && rawImageSrc ? (
          <ImageCropper
            imageSrc={rawImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        ) : (
          <>
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
            {form.imageUrl && (
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleRecrop}>
                  <Crop className="h-3.5 w-3.5" />
                  Adjust Crop
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                  <Camera className="h-3.5 w-3.5" />
                  Change Photo
                </Button>
              </div>
            )}
          </>
        )}
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

      {/* Cook Time & Servings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-body font-medium text-sm mb-1.5 block">Cook Time</Label>
          <Select value={form.cookTime || ''} onValueChange={(v) => set('cookTime', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {COOK_TIME_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-body font-medium text-sm mb-1.5 block">Servings</Label>
          <Select value={form.servings?.toString() || ''} onValueChange={(v) => set('servings', v ? parseInt(v) : null)}>
            <SelectTrigger>
              <SelectValue placeholder="How many?" />
            </SelectTrigger>
            <SelectContent>
              {SERVING_OPTIONS.map(n => (
                <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'person' : 'people'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          {proteinTagOptions.map(tag => {
            const selected = form.proteinTags.includes(tag as ProteinTag);
            return (
              <div key={tag} className="relative group">
                <button
                  type="button"
                  onClick={() => set('proteinTags', selected
                    ? form.proteinTags.filter(t => t !== tag)
                    : [...form.proteinTags, tag as ProteinTag]
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
                <button
                  type="button"
                  onClick={async () => {
                    const removed = await removeTag(tag);
                    if (removed) {
                      set('proteinTags', form.proteinTags.filter(t => t !== tag));
                    }
                  }}
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  title={`Remove "${tag}" option`}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
          {showNewTagInput ? (
            <form
              className="flex items-center gap-1"
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const success = await addTag(newTagInput);
                if (success) {
                  setNewTagInput('');
                  setShowNewTagInput(false);
                }
              }}
            >
              <Input
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                placeholder="New tag..."
                className="h-7 w-28 text-xs"
                autoFocus
              />
              <Button type="submit" size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setShowNewTagInput(false); setNewTagInput(''); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <button type="button" onClick={() => setShowNewTagInput(true)}>
              <Badge variant="outline" className="font-body font-normal cursor-pointer border-dashed">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Badge>
            </button>
          )}
      </div>

      {/* Occasion Tags */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Occasion</Label>
        <div className="flex flex-wrap gap-1.5">
          {OCCASION_TAGS.map(tag => {
            const selected = form.occasionTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => set('occasionTags', selected
                  ? form.occasionTags.filter(t => t !== tag)
                  : [...form.occasionTags, tag]
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
            value={ingredientAmount}
            onChange={e => setIngredientAmount(e.target.value)}
            placeholder="Qty (e.g. 2 cups)"
            className="w-28 shrink-0"
          />
          <div className="flex-1">
            <IngredientAutocomplete
              allIngredients={allIngredients}
              currentIngredients={form.ingredients.map(i => i.name)}
              onAdd={addIngredient}
            />
          </div>
        </div>
        {form.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.ingredients.map((ing, i) => (
              editingIndex === i ? (
                <form
                  key={i}
                  className="flex items-center gap-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (editName.trim()) {
                      const updated = [...form.ingredients];
                      updated[i] = { name: editName.trim(), amount: editAmount.trim() };
                      set('ingredients', updated);
                    }
                    setEditingIndex(null);
                  }}
                >
                  <Input
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    placeholder="Qty"
                    className="h-7 w-20 text-xs"
                  />
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Ingredient"
                    className="h-7 w-28 text-xs"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                  />
                  <Button type="submit" size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingIndex(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </form>
              ) : (
                <Badge key={i} variant="secondary" className="gap-1 font-body font-normal cursor-pointer"
                  onClick={() => {
                    setEditingIndex(i);
                    setEditAmount(ing.amount);
                    setEditName(ing.name);
                  }}
                >
                  {formatIngredient(ing)}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeIngredient(i); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Instructions</Label>
        <RichTextEditor
          value={form.instructions}
          onChange={(html) => set('instructions', html)}
          placeholder="Step-by-step instructions..."
        />
      </div>

      {/* Rating */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Rating (1-10)</Label>
        <RatingScale rating={form.rating} onChange={val => set('rating', val)} />
      </div>

      {/* Notes */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Notes</Label>
        <RichTextEditor
          value={form.notesText}
          onChange={val => set('notesText', val)}
          placeholder="What did you learn? What would you change next time?"
        />
      </div>

      </div>

      {/* Sticky Actions */}
      <div className="sticky bottom-0 border-t border-border bg-background pt-3 pb-1 flex gap-3 mt-3">
        <Button type="submit" className="flex-1">{initial ? 'Save Changes' : 'Add Recipe'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
