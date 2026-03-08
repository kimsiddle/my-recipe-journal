import { useRef, useState } from 'react';
import { RecipePhoto } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

interface RecipePhotoGalleryProps {
  photos: RecipePhoto[];
  onAddPhoto: (dataUrl: string) => void;
  onDeletePhoto: (photoId: string) => void;
}

export function RecipePhotoGallery({ photos, onAddPhoto, onDeletePhoto }: RecipePhotoGalleryProps) {


  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') onAddPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const prev = () => setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i));
  const next = () => setLightboxIndex(i => (i !== null && i < photos.length - 1 ? i + 1 : i));

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-display">Photos</h2>
          <span className="text-sm text-muted-foreground">({photos.length})</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="text-primary hover:text-primary/80">
          <Plus className="h-4 w-4 mr-1" />
          Add photo
        </Button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {photos.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="group relative shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-muted cursor-pointer snap-start"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={photo.url} alt={`Cook photo ${i + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              <button
                onClick={e => { e.stopPropagation(); onDeletePhoto(photo.id); }}
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-1 text-muted-foreground hover:text-destructive"
                title="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed rounded-lg py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
        >
          <Camera className="h-8 w-8 opacity-30" />
          <p className="text-sm">Upload your first cook photo</p>
        </button>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
        <DialogContent className="max-w-3xl p-2 bg-background/95 border-none">
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <div className="relative flex items-center justify-center">
              <img
                src={photos[lightboxIndex].url}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-h-[75vh] w-auto rounded-lg object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    disabled={lightboxIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 text-foreground hover:bg-background disabled:opacity-30 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    disabled={lightboxIndex === photos.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 text-foreground hover:bg-background disabled:opacity-30 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 rounded-full px-3 py-1">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
