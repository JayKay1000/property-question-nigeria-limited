import { useEffect, useState } from 'react';
import { BarChart3, MapPin, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PropertyDistribution() {
  const [properties, setProperties] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.list('-created_date', 200).catch(() => []),
      base44.entities.Estate.list().catch(() => []),
    ]).then(([p, e]) => { setProperties(p); setEstates(e); }).finally(() => setLoading(false));
  }, []);

  const byState = {};
  properties.forEach((p) => { const s = p.state || 'Unknown'; byState[s] = (byState[s] || 0) + 1; });
  const byCity = {};
  properties.forEach((p) => { const c = p.city || 'Unknown'; byCity[c] = (byCity[c] || 0) + 1; });
  const byEstate = {};
  properties.forEach((p) => { const e = p.estate || 'None'; byEstate[e] = (byEstate[e] || 0) + 1; });
  const byLGA = {};
  properties.forEach((p) => { const l = p.lga || 'Unknown'; byLGA[l] = (byLGA[l] || 0) + 1; });

  const topStates = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topCities = Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topLGAs = Object.entries(byLGA).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxCount = Math.max(...topStates.map(([, c]) => c), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(byState).length}</p><p className="text-xs text-muted-foreground">States with Listings</p></CardContent></Card>
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(byCity).length}</p><p className="text-xs text-muted-foreground">Cities with Listings</p></CardContent></Card>
        <Card><CardContent className="p-4"><BarChart3 className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(byLGA).length}</p><p className="text-xs text-muted-foreground">LGAs with Listings</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{estates.length}</p><p className="text-xs text-muted-foreground">Registered Estates</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-brand-700" /> Properties by State</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : topStates.map(([state, count]) => (
              <div key={state} className="flex items-center gap-3">
                <span className="w-28 truncate text-sm">{state}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                <Badge variant="secondary" className="text-xs w-10 justify-center">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-flame-600" /> Properties by City</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : topCities.map(([city, count]) => (
              <div key={city} className="flex items-center gap-3">
                <span className="w-28 truncate text-sm">{city}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-flame-500" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                <Badge variant="secondary" className="text-xs w-10 justify-center">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-info" /> Properties by LGA (Top 10)</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {topLGAs.map(([lga, count]) => <Badge key={lga} variant="outline" className="text-xs">{lga}: {count}</Badge>)}
        </CardContent>
      </Card>
    </div>
  );
}