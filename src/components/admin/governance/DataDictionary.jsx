import { entityDomains, entityMetadata } from '@/lib/db-governance/entityRegistry';
import { cn } from '@/lib/utils';

const sensitivityColors = {
  public: 'bg-info/10 text-info',
  internal: 'bg-muted text-muted-foreground',
  confidential: 'bg-warning/10 text-warning',
  restricted: 'bg-error/10 text-error',
};

export default function DataDictionary() {
  const allEntities = entityDomains.flatMap((d) =>
    d.entities.map((e) => ({ entity: e, domain: d.name })),
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <th className="p-3 font-medium">Entity</th>
            <th className="p-3 font-medium">Domain</th>
            <th className="p-3 font-medium">Description</th>
            <th className="p-3 font-medium">Sensitivity</th>
            <th className="p-3 font-medium">Owner</th>
            <th className="p-3 font-medium">Soft Delete</th>
            <th className="p-3 font-medium">RLS Policy</th>
          </tr>
        </thead>
        <tbody>
          {allEntities.map(({ entity, domain }) => {
            const meta = entityMetadata[entity] || {};
            return (
              <tr key={entity} className="border-b border-border/50 align-top">
                <td className="p-3 font-mono text-xs font-semibold text-brand-900">{entity}</td>
                <td className="p-3 text-xs text-muted-foreground">{domain}</td>
                <td className="p-3 text-xs text-muted-foreground">{meta.description || '—'}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      sensitivityColors[meta.sensitivity] || sensitivityColors.internal,
                    )}
                  >
                    {meta.sensitivity || 'internal'}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{meta.owner || '—'}</td>
                <td className="p-3 text-xs">
                  {meta.softDelete ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3 text-xs text-muted-foreground">{meta.rls || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}