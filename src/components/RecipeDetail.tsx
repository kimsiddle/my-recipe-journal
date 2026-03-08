import { useState, useRef } from 'react';
import { Recipe, CookLogEntry, formatIngredient } from '@/types/recipe';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { RatingScale } from '@/components/RatingScale';
import { RecipePhotoGallery } from '@/components/RecipePhotoGallery';
import { CookLogForm } from '@/components/CookLogForm';
import { CookLogTimeline } from '@/components/CookLogTimeline';
import { RecipeComments } from '@/components/RecipeComments';
import { ImageCropper } from '@/components/ImageCropper';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Pencil, Trash2, UtensilsCrossed, BookOpen, ExternalLink, Clock, Flame, ChefHat, Share2, Copy, Mail, MessageCircle, Users, Camera, Crop } from 'lucide-react';
import { toast } from 'sonner';

interface RecipeDetailProps {
  recipe: Recipe;
  isOwner: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRatingChange: (rating: number) => void;
  onAddPhoto: (dataUrl: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onSetPhotoAsMain: (photoUrl: string, photoId: string) => void;
  onUpdateMainPhoto: (dataUrl: string) => void;
  onAddCookLog: (entry: Omit<CookLogEntry, 'id'>) => void;
  onDeleteCookLog: (logId: string) => void;
}

export function RecipeDetail({ recipe, isOwner, onBack, onEdit, onDelete, onRatingChange, onAddPhoto, onDeletePhoto, onSetPhotoAsMain, onUpdateMainPhoto, onAddCookLog, onDeleteCookLog }: RecipeDetailProps) {
  const [cookLogOpen, setCookLogOpen] = useState(false);
  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

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

      <input
        ref={mainPhotoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setRawImageSrc(reader.result as string);
              setShowCropper(true);
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />

      {showCropper && rawImageSrc ? (
        <div className="mb-6">
          <ImageCropper
            imageSrc={rawImageSrc}
            onCropComplete={(croppedUrl) => {
              onUpdateMainPhoto(croppedUrl);
              setShowCropper(false);
              setRawImageSrc(null);
            }}
            onCancel={() => {
              setShowCropper(false);
              setRawImageSrc(null);
            }}
          />
        </div>
      ) : (
        <div className="relative group aspect-video rounded-xl overflow-hidden bg-muted mb-6">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {isOwner && (
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/95"
                onClick={() => mainPhotoRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5" />
                {recipe.imageUrl ? 'Change Photo' : 'Add Photo'}
              </Button>
            </div>
          )}
        </div>
      )}

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
        {recipe.servings && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </span>
        )}
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

      {/* Occasion Tags */}
      {recipe.occasionTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.occasionTags.map(tag => (
            <Badge key={tag} variant="outline" className="font-body font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

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
        <div
          className="bg-card rounded-lg p-4 border prose prose-sm max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: recipe.instructions }}
        />
      </section>

      {/* Notes */}
      {recipe.notesText ? (
        <section className="mt-8">
          <h2 className="text-xl font-display mb-3">Notes</h2>
          <div
            className="bg-card rounded-lg p-4 border prose prose-sm max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: recipe.notesText }}
          />
        </section>
      ) : null}

      {/* Photo gallery */}
      {isOwner ? (
        <RecipePhotoGallery photos={recipe.photos} onAddPhoto={onAddPhoto} onDeletePhoto={onDeletePhoto} onSetAsMain={onSetPhotoAsMain} />
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
