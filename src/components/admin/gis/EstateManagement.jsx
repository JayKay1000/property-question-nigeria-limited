import { useEffect, useState } from 'react';
import { Building2, MapPin, Layers, Grid3x3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLOT_STATUS_COLORS = { available: 'default', reserved: 'secondary', sold: 'destructive', under_construction: 'default', unavailable: 'secondary' };

export default function EstateManagement() {
  const [estates, setEstates] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstate, setSelectedEstate] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Estate.list().catch(() => []),
      base44.entities.EstateLayout.list().catch(() => []),
      base44.entities.EstatePlot.list().catch(() => []),
    ]).then(([e, l, p]) => { setEstates(e); setLayouts(l); setPlots(p); }).finally(() => setLoading(false));
  }, []);

  const estatePlots = selectedEstate ? plots.filter((p) => p.estate_id === selectedEstate.id) : [];
  const estateLayouts = selectedEstate ? layouts.filter((l) => l.estate_id === selectedEstate.id) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Building2 className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{estates.length}</p><p className="text-xs text-muted-foreground">Total Estates</p></CardContent></Card>
        <Card><CardContent className="p-4"><Layers className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{layouts.length}</p><p className="text-xs text-muted-foreground">Estate Layouts</p></CardContent></Card>
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{plots.length}</p><p className="text-xs text-muted-foreground">Total Plots</p></CardContent></Card>
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{plots.filter((p) => p.status === 'available').length}</p><p className="text-xs text-muted-foreground">Available Plots</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-brand-700" /> Estates</CardTitle></CardHeader>
          <CardContent className="max-h-[500px] space-y-1 overflow-y-auto">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : estates.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No estates registered yet.</p>
            ) : estates.map((e) => (
              <button key={e.id} onClick={() => setSelectedEstate(selectedEstate?.id === e.id ? null : e)} className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted ${selectedEstate?.id === e.id ? 'bg-muted' : ''}`}>
                <div><p className="text-sm font-medium">{e.estate_name}</p><p className="text-xs text-muted-foreground">{e.city_name || e.state_name || ''} · {e.estate_type.replace(/_/g, ' ')}</p></div>
                <Badge variant="outline" className="text-xs">{plots.filter((p) => p.estate_id === e.id).length}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Grid3x3 className="h-4 w-4 text-flame-600" /> {selectedEstate ? `${selectedEstate.estate_name} — Plots` : 'Estate Plots'}</CardTitle></CardHeader>
          <CardContent>
            {!selectedEstate ? (
              <div className="flex flex-col items-center py-16 text-center"><Building2 className="h-12 w-12 text-muted-foreground/40" /><p className="mt-4 text-sm text-muted-foreground">Select an estate to view its plots.</p></div>
            ) : (
              <div>
                {estateLayouts.length > 0 && (
                  <div className="mb-4 rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">{estateLayouts.length} layout(s) · {selectedEstate.number_of_plots || 0} total plots · {selectedEstate.security_status} security</p>
                  </div>
                )}
                {estatePlots.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No plots defined for this estate.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {estatePlots.map((p) => (
                      <div key={p.id} className="rounded-lg border p-2.5">
                        <div className="flex items-center justify-between"><span className="text-xs font-medium">{p.plot_number}</span><Badge variant={PLOT_STATUS_COLORS[p.status] || 'secondary'} className="text-xs capitalize">{p.status}</Badge></div>
                        {p.block_name && <p className="mt-0.5 text-xs text-muted-foreground">{p.block_name}</p>}
                        {p.plot_size_sqm && <p className="text-xs text-muted-foreground">{p.plot_size_sqm} sqm</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}