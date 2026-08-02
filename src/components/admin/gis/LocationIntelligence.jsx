import { useEffect, useState } from 'react';
import { TrendingUp, MapPin, Search, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LocationIntelligence() {
  const [analytics, setAnalytics] = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.LocationAnalytics.list('-created_date', 50).catch(() => []),
      base44.entities.Property.list('-created_date', 200).catch(() => []),
      base44.entities.Agent.filter({ status: 'active' }).catch(() => []),
    ]).then(([a, p, ag]) => { setAnalytics(a); setProperties(p); setAgents(ag); }).finally(() => setLoading(false));
  }, []);

  const searches = analytics.filter((a) => a.analytics_type === 'search');
  const byLocation = {};
  searches.forEach((a) => { byLocation[a.location_name] = (byLocation[a.location_name] || 0) + a.count; });
  const topSearched = Object.entries(byLocation).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const propByState = {};
  properties.forEach((p) => { const s = p.state || 'Unknown'; propByState[s] = (propByState[s] || 0) + 1; });
  const hotspotStates = Object.entries(propByState).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Search className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{searches.length}</p><p className="text-xs text-muted-foreground">Location Searches</p></CardContent></Card>
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(byLocation).length}</p><p className="text-xs text-muted-foreground">Unique Locations Searched</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{hotspotStates.length}</p><p className="text-xs text-muted-foreground">Investment Hotspot States</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{agents.length}</p><p className="text-xs text-muted-foreground">Active Agents</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Search className="h-4 w-4 text-flame-600" /> Most Searched Locations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : topSearched.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No search data yet.</p>
            ) : topSearched.map(([loc, count]) => (
              <div key={loc} className="flex items-center justify-between rounded-lg border p-2.5">
                <span className="text-sm font-medium">{loc}</span>
                <Badge variant="secondary" className="text-xs">{count} searches</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-success" /> Investment Hotspots (by Listings)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {hotspotStates.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No property data.</p> : hotspotStates.map(([state, count]) => (
              <div key={state} className="flex items-center gap-3">
                <span className="w-28 truncate text-sm">{state}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${(count / hotspotStates[0][1]) * 100}%` }} /></div>
                <Badge variant="secondary" className="text-xs w-10 justify-center">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-info" /> Agent Territory Coverage</CardTitle></CardHeader>
        <CardContent>
          {agents.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No active agents.</p> : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {agents.slice(0, 12).map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.specialization || 'General'} · {a.service_areas?.length || 0} areas</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}