import { useState } from 'react';
import { Recipe, RecipeNote } from '@/types/recipe';

import { Badge } from '@/components/ui/badge';
import { RatingScale } from '@/components/RatingScale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Pencil, Trash2, UtensilsCrossed, Plus, Send, X, MessageSquare, BookOpen, ExternalLink, Clock, Flame } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddNote: (text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onRatingChange: (rating: number) => void;
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete, onAddNote, onDeleteNote }: RecipeDetailProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const submitNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    onAddNote(trimmed);
    setNoteText('');
    setNoteOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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

      <div className="flex items-center gap-4 flex-wrap">
        <RatingScale rating={recipe.rating} />
        {recipe.cookTime && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {recipe.cookTime}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="h-4 w-4" />
          {recipe.difficulty}
        </span>
        {recipe.source && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {recipe.source.type === 'book' ? (
              <>
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>{recipe.source.name}</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 shrink-0" />
                {recipe.source.url ? (
                  <a
                    href={recipe.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors underline underline-offset-2"
                  >
                    {recipe.source.name}
                  </a>
                ) : (
                  <span>{recipe.source.name}</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

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

      {/* Notes as comment thread */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display">Notes</h2>
            <span className="text-sm text-muted-foreground">({recipe.notes.length})</span>
          </div>
          {!noteOpen && (
            <Button variant="ghost" size="sm" onClick={() => setNoteOpen(true)} className="text-accent hover:text-accent">
              <Plus className="h-4 w-4 mr-1" />
              Add note
            </Button>
          )}
        </div>

        {/* Add note input */}
        {noteOpen && (
          <div className="mb-4 bg-card border rounded-lg p-3">
            <Textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="What did you learn? What would you change?"
              rows={3}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNote(); } }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button size="sm" variant="ghost" onClick={() => { setNoteOpen(false); setNoteText(''); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitNote} disabled={!noteText.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" />
                Post
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {recipe.notes.length > 0 ? (
          <div className="space-y-3">
            {recipe.notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                formatDate={formatDate}
                formatTime={formatTime}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
          </div>
        ) : (
          !noteOpen && (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notes yet. Add your first one!</p>
            </div>
          )
        )}
      </section>

      <p className="text-xs text-muted-foreground mt-8">
        Added {new Date(recipe.createdAt).toLocaleDateString()}
        {recipe.updatedAt !== recipe.createdAt && ` · Updated ${new Date(recipe.updatedAt).toLocaleDateString()}`}
      </p>
    </div>
  );
}

function NoteCard({
  note,
  formatDate,
  formatTime,
  onDelete,
}: {
  note: RecipeNote;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  onDelete: () => void;
}) {
  return (
    <div className="group relative bg-card border rounded-lg p-4 transition-shadow hover:shadow-sm">
      <p className="text-sm leading-relaxed pr-6">{note.text}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {formatDate(note.createdAt)} at {formatTime(note.createdAt)}
      </p>
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        title="Delete note"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
