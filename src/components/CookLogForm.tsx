import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Camera, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CookLogEntry } from '@/types/recipe';
import { RatingScale } from '@/components/RatingScale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CookLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRating: number;
  onSubmit: (entry: Omit<CookLogEntry, 'id'>) => void;
}

export function CookLogForm({ open, onOpenChange, currentRating, onSubmit }: CookLogFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [rating, setRating] = useState<number>(currentRating);
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setDate(new Date());
    setRating(currentRating);
    setComment('');
    setPhotoUrls([]);
  };

  const handleSubmit = () => {
    onSubmit({
      cookedAt: date.toISOString(),
      rating: rating !== currentRating ? rating : undefined,
      comment: comment.trim() || undefined,
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
    });
    reset();
    onOpenChange(false);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrls(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">I Made This!</DialogTitle>
          <DialogDescription>Log when you cooked this recipe. Optionally update the rating, add a comment, or upload photos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Date picker */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Date cooked</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Rating</label>
            <RatingScale rating={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Comment <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="How did it turn out? Any tweaks?"
              rows={3}
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Photos <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            {photoUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotoUrls(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl text-xs px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Camera className="h-4 w-4 mr-1" />
              Add photos
            </Button>
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Log it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
