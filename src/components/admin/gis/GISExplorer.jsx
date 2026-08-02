import { useEffect, useState } from 'react';
import { Map, ChevronRight, MapPin, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GISExplorer() {
  const [zones, setZones] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.GeoPoliticalZone.list().catch(() => []),
      base44.entities.LookupState.list().catch(() => []),
      base44.entities.NigerianLGA.list().catch(() => []),
      base44.entities.Property.list('-created_date', 200).catch(() => []),
    ]).then(([z, s, l, p]) => {
      setZones(z); setStates(s); setLgas(l); setProperties(p);
    }).finally(() => setLoading(false));
  }, []);

  const statesInZone = selectedZone ? states.filter((s) => s.region === selectedZone.zone_code) : states;
  const propsByState = (stateName) => properties.filter((p) => p.state === stateName || p.state === states.find((s) => s.name === stateName)?.name).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Map className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{zones.length}</p><p className="text-xs text-muted-foreground">Geo-Political Zones</p></CardContent></Card>
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{states.length}</p><p className="text-xs text-muted-foreground">States & FCT</p></CardContent></Card>
        <Card><CardContent className="p-4"><Building2 className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{lgas.length}</p><p className="text-xs text-muted-foreground">LGAs Populated</p></CardContent></Card>
        <Card><CardContent className="p-4"><Map className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{properties.length}</p><p className="text-xs text-muted-foreground">Geo-Linked Properties</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Map className="h-4 w-4 text-flame-600" /> Geo-Political Zones</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : zones.map((z) => (
              <button key={z.id} onClick={() => setSelectedZone(selectedZone?.id === z.id ? null : z)} className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted ${selectedZone?.id === z.id ? 'bg-muted' : ''}`}>
                <div><p className="text-sm font-medium">{z.zone_name}</p><p className="text-xs text-muted-foreground">{z.states_count || states.filter((s) => s.region === z.zone_code).length} states</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-brand-700" /> {selectedZone ? `${selectedZone.zone_name} States` : 'All States & FCT'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {statesInZone.map((s) => {
                const propCount = properties.filter((p) => p.state === s.name).length;
                const lgaCount = lgas.filter((l) => l.state_code === s.code).length;
                return (
                  <div key={s.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium">{s.name}</p><Badge variant="outline" className="text-xs">{s.code}</Badge></div>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground"><span>{propCount} properties</span><span>{lgaCount} LGAs</span></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}