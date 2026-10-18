import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Reusable chip input — type and press Enter to add, click X to remove.
 * Shows clickable suggestion chips below the input.
 */
export default function ChipInput({ values, onChange, placeholder, suggestions = [] }) {
  const [input, setInput] = useState('');

  const add = (val) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  };

  const remove = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  const availableSuggestions = suggestions
    .filter((s) => !values.includes(s))
    .slice(0, 10);

  return (
    <div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="ml-0.5 rounded-full hover:bg-black/10"
                aria-label={`Remove ${v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            add(input);
          }
        }}
        placeholder={placeholder}
      />
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn(
                'text-xs px-2 py-1 rounded-full border border-border',
                'hover:bg-accent hover:text-accent-foreground transition-colors'
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}