import { useState, useRef } from 'react';
import { RecipeFormData, DIFFICULTY_LEVELS, COOK_TIME_OPTIONS, SERVING_OPTIONS, SourceType, Ingredient, formatIngredient } from '@/types/recipe';
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
import { useDynamicTags } from '@/hooks/useDynamicTags';
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
  const { tags: mealOptions, addTag: addMealTag, removeTag: removeMealTag } = useDynamicTags('meal_category_options');
  const { tags: proteinTagOptions, addTag: addProteinTag, removeTag: removeProteinTag } = useDynamicTags('protein_tag_options');
  const { tags: occasionOptions, addTag: addOccasionTag, removeTag: removeOccasionTag } = useDynamicTags('occasion_tag_options');
  const [newProteinInput, setNewProteinInput] = useState('');
  const [showNewProteinInput, setShowNewProteinInput] = useState(false);
  const [newMealInput, setNewMealInput] = useState('');
  const [showNewMealInput, setShowNewMealInput] = useState(false);
  const [newOccasionInput, setNewOccasionInput] = useState('');
  const [showNewOccasionInput, setShowNewOccasionInput] = useState(false);
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editName, setEditName] = useState('');
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(initial?.imageUrl || null);
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
        const dataUrl = reader.result as string;
        setRawImageSrc(dataUrl);
        setOriginalImageSrc(dataUrl);
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
    if (originalImageSrc) {
      setRawImageSrc(originalImageSrc);
      setShowCropper(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  // Reusable tag section with add/remove
  const renderDynamicTagSection = (
    label: string,
    options: string[],
    selected: string[],
    onToggle: (tag: string) => void,
    onRemoveOption: (tag: string) => Promise<boolean>,
    onAddOption: (name: string) => Promise<boolean>,
    newInput: string,
    setNewInput: (v: string) => void,
    showInput: boolean,
    setShowInput: (v: boolean) => void,
  ) => (
    <div>
      <Label className="font-body font-medium text-sm mb-1.5 block">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(tag => {
          const isSelected = selected.includes(tag);
          return (
            <div key={tag} className="relative group">
              <button
                type="button"
                onClick={() => onToggle(tag)}
              >
                <Badge
                  variant={isSelected ? 'default' : 'secondary'}
                  className="font-body font-normal cursor-pointer"
                >
                  {tag}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              </button>
              <button
                type="button"
                onClick={async () => {
                  const removed = await onRemoveOption(tag);
                  if (removed) {
                    onToggle(tag);
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
        {!showInput && (
          <button type="button" onClick={() => setShowInput(true)}>
            <Badge variant="outline" className="font-body font-normal cursor-pointer border-dashed">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Badge>
          </button>
        )}
      </div>
      {showInput && (
        <form
          className="flex items-center gap-2 mt-2"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const success = await onAddOption(newInput);
            if (success) {
              setNewInput('');
              setShowInput(false);
            }
          }}
        >
          <Input
            value={newInput}
            onChange={e => setNewInput(e.target.value)}
            placeholder="New tag..."
            className="h-8 flex-1 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setShowInput(false); setNewInput(''); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
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
                  Upload New
                </Button>
              </div>
            )}
            {form.photos.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-muted-foreground block mb-1.5">Or choose from gallery:</span>
                <div className="flex flex-wrap gap-2">
                  {form.photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => {
                        set('imageUrl', photo.url);
                        setOriginalImageSrc(photo.url);
                      }}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                        form.imageUrl === photo.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
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

      {/* Meal Category — dynamic */}
      {renderDynamicTagSection(
        'Meal',
        mealOptions,
        form.mealCategory ? [form.mealCategory] : [],
        (tag) => set('mealCategory', form.mealCategory === tag ? '' : tag),
        removeMealTag,
        addMealTag,
        newMealInput,
        setNewMealInput,
        showNewMealInput,
        setShowNewMealInput,
      )}

      {/* Protein / Type Tags — dynamic */}
      {renderDynamicTagSection(
        'Type',
        proteinTagOptions,
        form.proteinTags,
        (tag) => set('proteinTags', form.proteinTags.includes(tag)
          ? form.proteinTags.filter(t => t !== tag)
          : [...form.proteinTags, tag]
        ),
        async (tag) => {
          const removed = await removeProteinTag(tag);
          if (removed) set('proteinTags', form.proteinTags.filter(t => t !== tag));
          return removed;
        },
        addProteinTag,
        newProteinInput,
        setNewProteinInput,
        showNewProteinInput,
        setShowNewProteinInput,
      )}

      {/* Occasion Tags — dynamic */}
      {renderDynamicTagSection(
        'Occasion',
        occasionOptions,
        form.occasionTags,
        (tag) => set('occasionTags', form.occasionTags.includes(tag)
          ? form.occasionTags.filter(t => t !== tag)
          : [...form.occasionTags, tag]
        ),
        async (tag) => {
          const removed = await removeOccasionTag(tag);
          if (removed) set('occasionTags', form.occasionTags.filter(t => t !== tag));
          return removed;
        },
        addOccasionTag,
        newOccasionInput,
        setNewOccasionInput,
        showNewOccasionInput,
        setShowNewOccasionInput,
      )}

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
                    placeholder="Name"
                    className="h-7 w-28 text-xs"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingIndex(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </form>
              ) : (
                <button
                  key={i}
                  type="button"
                  className="group relative"
                  onClick={() => {
                    setEditingIndex(i);
                    setEditAmount(ing.amount);
                    setEditName(ing.name);
                  }}
                >
                  <Badge variant="secondary" className="font-body font-normal cursor-pointer pr-6">
                    {formatIngredient(ing)}
                  </Badge>
                  <span
                    onClick={(e) => { e.stopPropagation(); removeIngredient(i); }}
                    className="absolute top-1/2 -translate-y-1/2 right-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
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
          onChange={(val) => set('instructions', val)}
          placeholder="How do you make it?"
        />
      </div>

      {/* Notes */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Notes</Label>
        <RichTextEditor
          value={form.notesText}
          onChange={(val) => set('notesText', val)}
          placeholder="Tips, tricks, substitutions..."
        />
      </div>

      {/* Rating */}
      <div>
        <Label className="font-body font-medium text-sm mb-1.5 block">Rating</Label>
        <RatingScale rating={form.rating} onChange={(v) => set('rating', v)} />
      </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-background border-t pt-4 mt-4 flex gap-2">
        <Button type="submit" className="flex-1">Save Recipe</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
