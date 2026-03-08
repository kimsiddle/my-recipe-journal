import { useState, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface Props {
  allIngredients: string[];
  currentIngredients: string[];
  onAdd: (ingredient: string) => void;
}

export function IngredientAutocomplete({ allIngredients, currentIngredients, onAdd }: Props) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLower = new Set(currentIngredients.map(i => i.toLowerCase()));
  const filtered = value.trim().length > 0
    ? allIngredients.filter(i =>
        i.toLowerCase().includes(value.toLowerCase()) && !currentLower.has(i.toLowerCase())
      )
    : [];

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !currentLower.has(trimmed.toLowerCase())) {
      onAdd(trimmed);
    }
    setValue('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Popover open={open && filtered.length > 0} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); }}
          onFocus={() => value.trim() && setOpen(true)}
          placeholder="Add an ingredient"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit(value);
            }
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <Command>
          <CommandList>
            <CommandEmpty className="hidden" />
            <CommandGroup>
              {filtered.slice(0, 8).map(ingredient => (
                <CommandItem
                  key={ingredient}
                  value={ingredient}
                  onSelect={() => submit(ingredient)}
                  className="cursor-pointer"
                >
                  {ingredient}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
