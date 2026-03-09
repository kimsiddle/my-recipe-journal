import { useState } from 'react';
import { suggestSplitIndex } from '@/lib/ingredientParser';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil } from 'lucide-react';

interface IngredientSplitterProps {
  text: string;
  onSplit: (amount: string, name: string) => void;
  onCancel: () => void;
  onEditManually: () => void;
}

export function IngredientSplitter({ text, onSplit, onCancel, onEditManually }: IngredientSplitterProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const [splitIndex, setSplitIndex] = useState(() => suggestSplitIndex(words));

  const amount = words.slice(0, splitIndex).join(' ');
  const name = words.slice(splitIndex).join(' ');

  return (
    <div className="rounded-md bg-muted/50 px-2 py-2 space-y-2">
      <div className="text-xs text-muted-foreground mb-1">Tap between words to split qty & name</div>
      <div className="flex flex-wrap items-center gap-0">
        {words.map((word, i) => (
          <div key={i} className="flex items-center">
            {/* Clickable gap before each word (except first if splitIndex can be 0) */}
            <button
              type="button"
              onClick={() => setSplitIndex(i)}
              className={`w-2 h-8 flex-shrink-0 rounded-sm transition-colors ${
                i === splitIndex
                  ? 'bg-primary w-1'
                  : 'hover:bg-primary/30'
              }`}
              aria-label={`Split before "${word}"`}
            />
            <span
              className={`px-1 py-0.5 rounded text-sm font-body select-none ${
                i < splitIndex
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-foreground'
              }`}
            >
              {word}
            </span>
          </div>
        ))}
        {/* Gap after last word to allow splitting everything as amount */}
        <button
          type="button"
          onClick={() => setSplitIndex(words.length)}
          className={`w-2 h-8 flex-shrink-0 rounded-sm transition-colors ${
            splitIndex === words.length
              ? 'bg-primary w-1'
              : 'hover:bg-primary/30'
          }`}
          aria-label="Split after all words"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-muted-foreground">
          {amount && <span>Qty: <span className="text-primary font-medium">{amount}</span></span>}
          {name && <span>Name: <span className="text-foreground font-medium">{name}</span></span>}
          {!name && <span className="text-destructive">All text is quantity — tap to adjust</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onEditManually}
            title="Edit manually"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onSplit(amount, name)}
            disabled={!name}
            title="Confirm split"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onCancel}
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
