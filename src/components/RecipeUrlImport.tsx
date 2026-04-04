import { useState, useCallback } from 'react';

function plainTextToHtml(text: string): string {
  if (!text) return '';
  if (text.trim().startsWith('<')) return text; // already HTML
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const isNumbered = lines.every(l => /^\d+[\.\)]/.test(l));
  if (isNumbered) {
    return '<ol>' + lines.map(l => `<li>${l.replace(/^\d+[\.\)]\s*/, '')}</li>`).join('') + '</ol>';
  }
  return '<p>' + lines.join('</p><p>') + '</p>';
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedRecipe } from '@/components/RecipeImageImport';

interface RecipeUrlImportProps {
  onExtracted: (data: ExtractedRecipe, url: string) => void;
  onBack: () => void;
}

export function RecipeUrlImport({ onExtracted, onBack }: RecipeUrlImportProps) {
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = useCallback(async () => {
    if (!url.trim()) return;
    setExtracting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('extract-recipe-url', {
        body: { url: url.trim() },
      });

      if (fnError) throw fnError;

      if (data?.error || data?.confidence === 'low') {
        setError(
          "We couldn't fully read this page. You can still review and complete the recipe manually."
        );
        if (data?.title || data?.ingredients?.length) {
          onExtracted({
            title: data.title || '',
            description: data.description || '',
            ingredients: (data.ingredients || []).map((i: any) => ({
              name: i.name || '',
              amount: i.amount || '',
              section: i.section || '',
            })),
            instructions: plainTextToHtml(data.instructions || ''),
            notes: plainTextToHtml(data.notes || ''),
            cookTime: data.cook_time || '',
            servings: data.servings ? Number(data.servings) : null,
            imageUrl: data.image_url || '',
          }, url.trim());
          return;
        }
        return;
      }

      onExtracted({
        title: data.title || '',
        description: data.description || '',
        ingredients: (data.ingredients || []).map((i: any) => ({
          name: i.name || '',
          amount: i.amount || '',
          section: i.section || '',
        })),
        instructions: plainTextToHtml(data.instructions || ''),
        notes: plainTextToHtml(data.notes || ''),
        cookTime: data.cook_time || '',
        servings: data.servings ? Number(data.servings) : null,
        imageUrl: data.image_url || '',
      }, url.trim());
    } catch (err: any) {
      console.error('URL extract error:', err);
      setError('Something went wrong. Please check the URL and try again.');
    } finally {
      setExtracting(false);
    }
  }, [url, onExtracted]);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display">Import from URL</h2>
        <p className="text-sm text-muted-foreground">
          Paste a link to a recipe page and we'll extract the details
        </p>
      </div>

      <div className="space-y-3">
        <Input
          type="url"
          placeholder="https://example.com/recipe/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
        />

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent text-sm">
            <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-foreground">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleExtract}
          disabled={extracting || !url.trim()}
          className="flex-1"
        >
          {extracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting recipe…
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Extract Recipe
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
