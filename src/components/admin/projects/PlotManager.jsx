import { useEffect, useState } from 'react';
import { Grid3x3, Building2, Layers, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLOT_STATUS = {
  available: { variant: 'default', color: 'bg-success' },
  reserved: { variant: 'secondary', color: 'bg-warning' },
  pending_payment: { variant: 'secondary', color: 'bg-warning' },
  allocated: { variant: 'default', color: 'bg-brand-500' },
  sold: { variant: 'destructive', color: 'bg-destructive' },
  under_documentation: { variant: 'secondary', color: 'bg-info' },
  under_construction: { variant: 'default', color: 'bg-info' },
  completed: { variant: 'default', color: 'bg-success' },
  not_available: { variant: 'secondary', color: 'bg-muted' },
};

export default function PlotManager() {
  const [plots, setPlots] = useState([]);
  const [estates, setEstates] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstate, setFilterEstate] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.EstatePlot.list('-created_date', 200).catch(() => []),
      base44.entities.Estate.list().catch(() => []),
      base44.entities.ProjectBlock.list().catch(() => []),
    ]).then(([p, e, b]) => { setPlots(p); setEstates(e); setBlocks(b); }).finally(() => setLoading(false));
  }, []);

  const filtered = plots.filter((p) =>
    (!filterEstate || p.estate_id === filterEstate) &&
    (!filterStatus || p.status === filterStatus)
  );

  const byStatus = {};
  plots.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{plots.length}</p><p className="text-xs text-muted-foreground">Total Plots</p></CardContent></Card>
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{byStatus.available || 0}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{(byStatus.reserved || 0) + (byStatus.pending_payment || 0)}</p><p className="text-xs text-muted-foreground">Reserved/Pending</p></CardContent></Card>
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{byStatus.sold || 0}</p><p className="text-xs text-muted-foreground">Sold</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setFilterEstate(null); setFilterStatus(null); }} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${!filterEstate && !filterStatus ? 'bg-brand-700 text-white' : 'hover:bg-muted'}`}>All</button>
        {estates.slice(0, 5).map((e) => (
          <button key={e.id} onClick={() => setFilterEstate(filterEstate === e.id ? null : e.id)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${filterEstate === e.id ? 'bg-brand-700 text-white' : 'hover:bg-muted'}`}>{e.estate_name}</button>
        ))}
        <span className="mx-1 self-center text-muted-foreground">|</span>
        {Object.keys(byStatus).map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? null : s)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-flame-500 text-white' : 'hover:bg-muted'}`}>{s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Grid3x3 className="h-4 w-4 text-flame-600" /> Plot Inventory {filterEstate && `· ${estates.find((e) => e.id === filterEstate)?.estate_name || ''}`}</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center"><Filter className="h-10 w-10 text-muted-foreground/40" /><p className="mt-2 text-sm text-muted-foreground">No plots match the current filter.</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.slice(0, 100).map((p) => {
                const sc = PLOT_STATUS[p.status] || PLOT_STATUS.available;
                return (
                  <div key={p.id} className="rounded-lg border p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{p.plot_number}</span>
                      <span className={`h-3 w-3 rounded-full ${sc.color}`} />
                    </div>
                    {p.block_name && <p className="mt-0.5 text-xs text-muted-foreground">{p.block_name}</p>}
                    {p.phase_name && <p className="text-xs text-muted-foreground">Phase: {p.phase_name}</p>}
                    <div className="mt-1.5 flex items-center justify-between">
                      {p.plot_size && <span className="text-xs text-muted-foreground">{p.plot_size} {p.measurement_unit || 'sqm'}</span>}
                      {p.corner_piece && <Badge variant="outline" className="text-xs">Corner</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {filtered.length > 100 && <p className="mt-3 text-center text-xs text-muted-foreground">Showing 100 of {filtered.length} plots</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Layers className="h-4 w-4 text-brand-700" /> Blocks</CardTitle></CardHeader>
        <CardContent>
          {blocks.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No blocks defined yet.</p> : (
            <div className="flex flex-wrap gap-2">
              {blocks.map((b) => <Badge key={b.id} variant="outline" className="text-xs">{b.block_name} · {b.number_of_plots || 0} plots</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}