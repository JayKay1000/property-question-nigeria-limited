import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { entityDomains, entityMetadata } from '@/lib/db-governance/entityRegistry';
import { cn } from '@/lib/utils';

export default function SchemaExplorer() {
  const [selected, setSelected] = useState('Property');
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setSchema(null);
    try {
      const result = base44.entities[selected]?.schema();
      if (result instanceof Promise) {
        result.then((s) => { setSchema(s); setLoading(false); }).catch(() => setLoading(false));
      } else {
        setSchema(result);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [selected]);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* Entity list */}
      <div className="space-y-4">
        {entityDomains.map((domain) => (
          <div key={domain.name}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {domain.name}
            </p>
            <div className="space-y-0.5">
              {domain.entities.map((entity) => (
                <button
                  key={entity}
                  onClick={() => setSelected(entity)}
                  className={cn(
                    'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                    selected === entity
                      ? 'bg-brand-900 font-medium text-white'
                      : 'text-brand-900 hover:bg-muted',
                  )}
                >
                  {entity}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Schema detail */}
      <div className="rounded-xl border border-border bg-white p-6">
        {!selected ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Select an entity to inspect its schema.
          </p>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-flame-500" />
          </div>
        ) : schema ? (
          <div>
            <div className="mb-4 border-b border-border pb-4">
              <h3 className="text-xl font-heading font-bold text-brand-900">{selected}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {entityMetadata[selected]?.description || 'No description available.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-brand-700">
                  Sensitivity: {entityMetadata[selected]?.sensitivity || 'internal'}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-brand-700">
                  Owner: {entityMetadata[selected]?.owner || '—'}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-brand-700">
                  Soft Delete: {entityMetadata[selected]?.softDelete ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fields ({Object.keys(schema.properties || {}).length})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Field</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Req</th>
                    <th className="pb-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(schema.properties || {}).map(([field, def]) => (
                    <tr key={field} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs font-medium text-brand-900">{field}</td>
                      <td className="py-2 pr-4 text-xs text-flame-600">
                        {def.type}
                        {def.format ? ` (${def.format})` : ''}
                        {def.enum ? ` [${def.enum.length} opts]` : ''}
                      </td>
                      <td className="py-2 pr-4">
                        {(schema.required || []).includes(field) && (
                          <span className="text-xs font-bold text-error">✓</span>
                        )}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">{def.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Built-in fields (managed by platform): <span className="font-mono">id, created_date, updated_date, created_by_id</span>
            </p>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Unable to load schema for {selected}.
          </p>
        )}
      </div>
    </div>
  );
}