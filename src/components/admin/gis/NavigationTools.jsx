import { useEffect, useState } from 'react';
import { Navigation, MapPin, Clock, Route, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NavigationTools() {
  const [routes, setRoutes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.InspectionRoute.list('-created_date', 20).catch(() => []),
      base44.entities.Property.filter({ status: 'published' }, '-created_date', 100).catch(() => []),
    ]).then(([r, p]) => { setRoutes(r); setProperties(p); }).finally(() => setLoading(false));
  }, []);

  const geoLinked = properties.filter((p) => p.latitude && p.longitude);
  const withMaps = properties.filter((p) => p.google_maps_link);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{geoLinked.length}</p><p className="text-xs text-muted-foreground">Properties with Coordinates</p></CardContent></Card>
        <Card><CardContent className="p-4"><Navigation className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{withMaps.length}</p><p className="text-xs text-muted-foreground">Google Maps Linked</p></CardContent></Card>
        <Card><CardContent className="p-4"><Route className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{routes.length}</p><p className="text-xs text-muted-foreground">Inspection Routes</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{routes.filter((r) => r.status === 'planned' || r.status === 'confirmed').length}</p><p className="text-xs text-muted-foreground">Scheduled Routes</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Route className="h-4 w-4 text-flame-600" /> Inspection Routes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : routes.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center"><Route className="h-10 w-10 text-muted-foreground/40" /><p className="mt-2 text-sm text-muted-foreground">No inspection routes planned yet.</p></div>
          ) : (
            <div className="space-y-2">
              {routes.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-sm font-medium">{r.route_name}</p><p className="text-xs text-muted-foreground">{r.agent_name || 'Unassigned'} · {r.property_ids?.length || 0} stops · {r.scheduled_date || 'Not scheduled'}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.total_distance_km && <Badge variant="outline" className="text-xs">{r.total_distance_km} km</Badge>}
                    {r.estimated_duration_minutes && <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" />{r.estimated_duration_minutes} min</Badge>}
                    <Badge variant={r.status === 'completed' ? 'default' : r.status === 'planned' ? 'secondary' : 'outline'} className="text-xs capitalize">{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-success" /> Properties with Google Maps Links</CardTitle></CardHeader>
        <CardContent>
          {withMaps.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No properties with Google Maps links.</p> : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {withMaps.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.city || ''} {p.state || ''}</p></div>
                  <a href={p.google_maps_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-700 hover:underline"><ExternalLink className="h-3 w-3" /> Open Map</a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}