import { LayoutGrid, List, Map as MapIcon, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';

const VIEWS = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
  { value: 'map', label: 'Map', icon: MapIcon },
  { value: 'split', label: 'Split', icon: Columns, desktopOnly: true },
];

export default function MarketplaceViewToggle({ view, onChange }) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-white p-0.5"
      role="group"
      aria-label="Results view"
    >
      {VIEWS.map((v) => {
        const Icon = v.icon;
        const active = view === v.value;
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onChange(v.value)}
            aria-pressed={active}
            aria-label={`${v.label} view`}
            title={`${v.label} view`}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              v.desktopOnly && 'hidden lg:flex',
              active
                ? 'bg-brand-900 text-white'
                : 'text-muted-foreground hover:bg-brand-50 hover:text-brand-900'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}