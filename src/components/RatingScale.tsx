import { cn } from '@/lib/utils';

interface RatingScaleProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}

export function RatingScale({ rating, onChange, size = 'md' }: RatingScaleProps) {
  const getColor = (val: number) => {
    if (val <= 3) return 'bg-destructive';
    if (val <= 5) return 'bg-accent';
    if (val <= 7) return 'bg-primary/70';
    return 'bg-primary';
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
          <button
            key={val}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(val)}
            className={cn(
              'rounded-sm transition-all',
              size === 'sm' ? 'h-3 w-2' : 'h-5 w-3',
              val <= rating ? getColor(rating) : 'bg-border',
              onChange && 'cursor-pointer hover:scale-y-125'
            )}
          />
        ))}
      </div>
      <span className={cn(
        'font-body font-semibold tabular-nums',
        size === 'sm' ? 'text-xs' : 'text-sm',
        'text-muted-foreground'
      )}>
        {rating}/10
      </span>
    </div>
  );
}
