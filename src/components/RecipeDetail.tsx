import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { StarRating } from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Pencil, Trash2, UtensilsCrossed, Plus, Send } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onQuickNote: (note: string) => void;
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete, onQuickNote }: RecipeDetailProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const submitNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    onQuickNote(trimmed);
    setNoteText('');
    setNoteOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </button>

      <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-6">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display mb-2">{recipe.title}</h1>
          <p className="text-muted-foreground">{recipe.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onDelete} className="hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <StarRating rating={recipe.rating} />

      <section className="mt-8">
        <h2 className="text-xl font-display mb-3">Ingredients</h2>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.map((ing, i) => (
            <Badge key={i} variant="secondary" className="font-body font-normal text-sm py-1 px-3">
              {ing}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-display mb-3">Instructions</h2>
        <div className="bg-card rounded-lg p-4 border whitespace-pre-line text-sm leading-relaxed">
          {recipe.instructions}
        </div>
      </section>

      {/* Notes & Adjustments with Quick Add */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-display">Notes & Adjustments</h2>
          {!noteOpen && (
            <Button variant="ghost" size="sm" onClick={() => setNoteOpen(true)} className="text-accent hover:text-accent">
              <Plus className="h-4 w-4 mr-1" />
              Quick note
            </Button>
          )}
        </div>

        {noteOpen && (
          <div className="mb-3 flex gap-2">
            <Textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Jot down a quick note..."
              rows={2}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNote(); } }}
              className="flex-1"
            />
            <div className="flex flex-col gap-1">
              <Button size="icon" onClick={submitNote} disabled={!noteText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => { setNoteOpen(false); setNoteText(''); }}>
                ✕
              </Button>
            </div>
          </div>
        )}

        {recipe.adjustments ? (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">
            {recipe.adjustments}
          </div>
        ) : (
          !noteOpen && <p className="text-sm text-muted-foreground italic">No notes yet. Add one!</p>
        )}
      </section>

      <p className="text-xs text-muted-foreground mt-8">
        Added {new Date(recipe.createdAt).toLocaleDateString()}
        {recipe.updatedAt !== recipe.createdAt && ` · Updated ${new Date(recipe.updatedAt).toLocaleDateString()}`}
      </p>
    </div>
  );
}
