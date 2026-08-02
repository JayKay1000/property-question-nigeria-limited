import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, MapPin, Database, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GISGovernance() {
  const [properties, setProperties] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.list('-created_date', 200).catch(() => []),
      base44.entities.LookupState.list().catch(() => []),
      base44.entities.NigerianLGA.list().catch(() => []),
      base44.entities.Estate.list().catch(() => []),
    ]).then(([p, s, l, e]) => { setProperties(p); setStates(s); setLgas(l); setEstates(e); }).finally(() => setLoading(false));
  }, []);

  const missingCoords = properties.filter((p) => !p.latitude || !p.longitude);
  const missingState = properties.filter((p) => !p.state);
  const missingLGA = properties.filter((p) => !p.lga);
  const statesWithCoords = states.filter((s) => !s.latitude || !s.longitude);
  const lgaCoverage = lgas.length;
  const totalStates = states.length;

  const checks = [
    { label: 'Properties Missing Coordinates', count: missingCoords.length, total: properties.length, icon: MapPin, color: 'text-warning' },
    { label: 'Properties Missing State', count: missingState.length, total: properties.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Properties Missing LGA', count: missingLGA.length, total: properties.length, icon: AlertTriangle, color: 'text-flame-600' },
    { label: 'States Missing Coordinates', count: statesWithCoords.length, total: totalStates, icon: MapPin, color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Database className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{totalStates}</p><p className="text-xs text-muted-foreground">States in Database</p></CardContent></Card>
        <Card><CardContent className="p-4"><Database className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{lgaCoverage}</p><p className="text-xs text-muted-foreground">LGAs Populated (of 774)</p></CardContent></Card>
        <Card><CardContent className="p-4"><Building2 className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{estates.length}</p><p className="text-xs text-muted-foreground">Registered Estates</p></CardContent></Card>
        <Card><CardContent className="p-4"><ShieldCheck className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{properties.length - missingCoords.length}</p><p className="text-xs text-muted-foreground">Geo-Validated Properties</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <check.icon className={`h-5 w-5 ${check.color}`} />
                  <div><p className="text-sm font-medium">{check.label}</p><p className="text-xs text-muted-foreground">{check.count} of {check.total}</p></div>
                </div>
                <Badge variant={check.count > 0 ? 'destructive' : 'default'} className="text-xs">{check.count > 0 ? 'Action Needed' : 'OK'}</Badge>
              </div>
              {check.count > 0 && <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-destructive" style={{ width: `${(check.count / check.total) * 100}%` }} /></div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {missingCoords.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> Properties Missing Coordinates</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingCoords.slice(0, 15).map((p) => <Badge key={p.id} variant="outline" className="text-xs">{p.title || p.reference_number || 'Untitled'}</Badge>)}
              {missingCoords.length > 15 && <Badge variant="secondary" className="text-xs">+{missingCoords.length - 15} more</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-brand-700" /> Data Coverage Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>LGA Coverage</span><Badge variant="outline" className="text-xs">{lgaCoverage} / 774 ({Math.round((lgaCoverage / 774) * 100)}%)</Badge></div>
            <div className="flex justify-between"><span>State Coverage</span><Badge variant="outline" className="text-xs">{totalStates} / 37 ({Math.round((totalStates / 37) * 100)}%)</Badge></div>
            <div className="flex justify-between"><span>Property Geo-Coverage</span><Badge variant="outline" className="text-xs">{properties.length - missingCoords.length} / {properties.length}</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}