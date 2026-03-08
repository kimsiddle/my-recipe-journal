import { useState } from 'react';
import { Recipe, RecipeNote, CookLogEntry, formatIngredient } from '@/types/recipe';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { RatingScale } from '@/components/RatingScale';
import { RecipePhotoGallery } from '@/components/RecipePhotoGallery';
import { CookLogForm } from '@/components/CookLogForm';
import { CookLogTimeline } from '@/components/CookLogTimeline';
import { RecipeComments } from '@/components/RecipeComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Pencil, Trash2, UtensilsCrossed, Plus, Send, X, MessageSquare, BookOpen, ExternalLink, Clock, Flame, ChefHat, Share2, Copy, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RecipeDetailProps {
  recipe: Recipe;
  isOwner: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddNote: (text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onRatingChange: (rating: number) => void;
  onAddPhoto: (dataUrl: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onAddCookLog: (entry: Omit<CookLogEntry, 'id'>) => void;
  onDeleteCookLog: (logId: string) => void;
}

export function RecipeDetail({ recipe, isOwner, onBack, onEdit, onDelete, onAddNote, onDeleteNote, onRatingChange, onAddPhoto, onDeletePhoto, onAddCookLog, onDeleteCookLog }: RecipeDetailProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [cookLogOpen, setCookLogOpen] = useState(false);

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

  const lastCookedLabel = recipe.lastCookedAt
    ? `Last cooked ${formatDistanceToNow(new Date(recipe.lastCookedAt), { addSuffix: true })}`
    : 'Never cooked';

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

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display mb-2">{recipe.title}</h1>
          <p className="text-muted-foreground">{recipe.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {isOwner && (
            <Button onClick={() => setCookLogOpen(true)} size="sm" className="gap-1.5">
              <ChefHat className="h-4 w-4" />
              I Made This
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                const url = `${window.location.origin}/recipe/${recipe.id}`;
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const url = `${window.location.origin}/recipe/${recipe.id}`;
                window.open(`mailto:?subject=${encodeURIComponent(`Check out: ${recipe.title}`)}&body=${encodeURIComponent(`${recipe.title}\n\n${url}`)}`);
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const url = `${window.location.origin}/recipe/${recipe.id}`;
                window.open(`sms:?body=${encodeURIComponent(`${recipe.title} — ${url}`)}`);
              }}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Text Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isOwner && (
            <>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onDelete} className="h-9 w-9 hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {isOwner ? (
          <RatingScale rating={recipe.rating} onChange={onRatingChange} />
        ) : (
          <RatingScale rating={recipe.rating} size="sm" />
        )}
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
        <span className="text-sm text-muted-foreground">
          {lastCookedLabel}
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
        <ul className="space-y-1.5">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline gap-2 text-sm">
              {ing.amount && <span className="text-muted-foreground font-medium shrink-0">{ing.amount}</span>}
              <span>{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-display mb-3">Instructions</h2>
        <div className="bg-card rounded-lg p-4 border whitespace-pre-line text-sm leading-relaxed">
          {recipe.instructions}
        </div>
      </section>

      {/* Photo gallery */}
      {isOwner ? (
        <RecipePhotoGallery photos={recipe.photos} onAddPhoto={onAddPhoto} onDeletePhoto={onDeletePhoto} />
      ) : recipe.photos.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-display mb-3">Photos</h2>
          <div className="flex gap-2 flex-wrap">
            {recipe.photos.map(p => (
              <img key={p.id} src={p.url} alt="" className="h-24 w-24 rounded-lg object-cover" />
            ))}
          </div>
        </section>
      ) : null}

      {/* Cook Log Timeline - owner only */}
      {isOwner && <CookLogTimeline cookLog={recipe.cookLog} onDelete={onDeleteCookLog} />}

      {/* Notes - owner only */}
      {isOwner && (
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
      )}

      {/* Guest comments */}
      <RecipeComments recipeId={recipe.id} isOwner={isOwner} />

      <p className="text-xs text-muted-foreground mt-8">
        Added {new Date(recipe.createdAt).toLocaleDateString()}
        {recipe.updatedAt !== recipe.createdAt && ` · Updated ${new Date(recipe.updatedAt).toLocaleDateString()}`}
      </p>

      {isOwner && (
        <CookLogForm
          open={cookLogOpen}
          onOpenChange={setCookLogOpen}
          currentRating={recipe.rating}
          onSubmit={onAddCookLog}
        />
      )}
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
