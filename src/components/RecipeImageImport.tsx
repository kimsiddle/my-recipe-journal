import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, AlertTriangle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ingredient } from '@/types/recipe';

export interface ExtractedRecipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  notes: string;
  cookTime: string;
  servings: number | null;
  imageUrl: string;
}

interface RecipeImageImportProps {
  onExtracted: (data: ExtractedRecipe) => void;
  onSkip: () => void;
}

import { compressImage } from '@/lib/imageUtils';

export function RecipeImageImport({ onExtracted, onSkip }: RecipeImageImportProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const compressed = await compressImage(reader.result as string);
        setPreview(compressed);
      } catch {
        setPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!preview) return;
    setExtracting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('extract-recipe', {
        body: { image: preview },
      });

      if (fnError) throw fnError;

      if (data?.error || data?.confidence === 'low') {
        setError(
          "We couldn't fully read this image. You can still review and complete the recipe manually."
        );
        // Even with low confidence, pass whatever was extracted
        if (data?.title || data?.ingredients?.length) {
          onExtracted({
            title: data.title || '',
            ingredients: (data.ingredients || []).map((i: any) => ({
              name: i.name || '',
              amount: i.amount || '',
            })),
            instructions: data.instructions || '',
            notes: data.notes || '',
            cookTime: data.cook_time || '',
            servings: data.servings ? Number(data.servings) : null,
            imageUrl: preview,
          });
          return;
        }
        return;
      }

      if (data?.confidence === 'medium') {
        toast.info('Some parts were hard to read. Please review the extracted recipe.');
      }

      onExtracted({
        title: data.title || '',
        ingredients: (data.ingredients || []).map((i: any) => ({
          name: i.name || '',
          amount: i.amount || '',
        })),
        instructions: data.instructions || '',
        notes: data.notes || '',
        cookTime: data.cook_time || '',
        servings: data.servings ? Number(data.servings) : null,
        imageUrl: preview,
      });
    } catch (err: any) {
      console.error('Extract error:', err);
      setError(
        "Something went wrong while processing the image. You can try again or create the recipe manually."
      );
    } finally {
      setExtracting(false);
    }
  }, [preview, onExtracted]);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display">Import from Photo</h2>
        <p className="text-sm text-muted-foreground">
          Upload a photo of a recipe and we'll extract the details for you
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-3 hover:bg-muted transition-colors"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Tap to upload a recipe photo</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, HEIC supported</p>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={preview} alt="Recipe preview" className="w-full max-h-64 object-contain bg-muted/30" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background transition-colors flex items-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5" />
              Change photo
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent text-sm">
              <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {preview && (
          <Button
            onClick={handleExtract}
            disabled={extracting}
            className="flex-1"
          >
            {extracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting recipe…
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Extract Recipe
              </>
            )}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onSkip}>
          {preview ? 'Skip & enter manually' : 'Start from scratch'}
        </Button>
      </div>
    </div>
  );
}
