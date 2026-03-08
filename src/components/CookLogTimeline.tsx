import { CookLogEntry } from '@/types/recipe';
import { RatingScale } from '@/components/RatingScale';
import { X, ChefHat } from 'lucide-react';

interface CookLogTimelineProps {
  cookLog: CookLogEntry[];
  onDelete: (logId: string) => void;
}

export function CookLogTimeline({ cookLog, onDelete }: CookLogTimelineProps) {
  const sorted = [...cookLog].sort((a, b) => new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-display">Cook Log</h2>
        <span className="text-sm text-muted-foreground">({cookLog.length})</span>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((entry) => (
            <div key={entry.id} className="group relative bg-card border rounded-lg p-4 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{formatDate(entry.cookedAt)}</span>
                {entry.rating && (
                  <RatingScale rating={entry.rating} size="sm" />
                )}
              </div>
              {entry.comment && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{entry.comment}</p>
              )}
              {entry.photoUrls && entry.photoUrls.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {entry.photoUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-16 w-16 rounded-md object-cover border shrink-0" />
                  ))}
                </div>
              )}
              <button
                onClick={() => onDelete(entry.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                title="Delete log entry"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <ChefHat className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No cook log entries yet. Click "I Made This" to start tracking!</p>
        </div>
      )}
    </section>
  );
}
