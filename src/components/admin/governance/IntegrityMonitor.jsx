import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { entityDomains } from '@/lib/db-governance/entityRegistry';
import { cn } from '@/lib/utils';

export default function IntegrityMonitor() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allEntities = entityDomains.flatMap((d) => d.entities);
    Promise.allSettled(
      allEntities.map((e) =>
        base44.entities[e]
          ?.list('-created_date', 100)
          .then((records) => ({ entity: e, count: records.length, error: false }))
          .catch(() => ({ entity: e, count: 0, error: true })),
      ),
    ).then((results) => {
      const map = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') map[r.value.entity] = r.value;
      });
      setCounts(map);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-flame-500" />
      </div>
    );
  }

  const allEntities = entityDomains.flatMap((d) =>
    d.entities.map((e) => ({ entity: e, domain: d.name })),
  );
  const totalRecords = Object.values(counts).reduce((sum, c) => sum + (c.count || 0), 0);
  const entitiesWithData = Object.values(counts).filter((c) => c.count > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-2xl font-bold text-brand-900">{allEntities.length}</p>
          <p className="text-xs text-muted-foreground">Total Entities</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-2xl font-bold text-brand-900">{entitiesWithData}</p>
          <p className="text-xs text-muted-foreground">Entities with Data</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-2xl font-bold text-brand-900">{totalRecords}+</p>
          <p className="text-xs text-muted-foreground">Total Records (capped at 100/entity)</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <th className="p-3 font-medium">Entity</th>
              <th className="p-3 font-medium">Domain</th>
              <th className="p-3 font-medium">Records</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {allEntities.map(({ entity, domain }) => {
              const info = counts[entity] || { count: 0, error: true };
              return (
                <tr key={entity} className="border-b border-border/50">
                  <td className="p-3 font-mono text-xs font-semibold text-brand-900">{entity}</td>
                  <td className="p-3 text-xs text-muted-foreground">{domain}</td>
                  <td className="p-3 text-sm font-medium text-brand-900">
                    {info.error ? '—' : `${info.count}${info.count >= 100 ? '+' : ''}`}
                  </td>
                  <td className="p-3">
                    {info.error ? (
                      <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                        No Access
                      </span>
                    ) : info.count === 0 ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Empty
                      </span>
                    ) : (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}