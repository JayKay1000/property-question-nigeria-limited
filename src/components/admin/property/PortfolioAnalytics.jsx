import { useEffect, useState } from 'react';
import { Building2, MapPin, Eye, Heart, Mail, Calendar, Star, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PortfolioAnalytics() {
  const [properties, setProperties] = useState([]);
  const [views, setViews] = useState([]);
  const [saved, setSaved] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.list('-created_date', 200).catch(() => []),
      base44.entities.PropertyView.list('-created_date', 50).catch(() => []),
      base44.entities.SavedProperty.list('-created_date', 50).catch(() => []),
      base44.entities.PropertyEnquiry.list('-created_date', 50).catch(() => []),
      base44.entities.InspectionRequest.list('-created_date', 50).catch(() => []),
    ]).then(([props, v, s, e, insp]) => {
      setProperties(props); setViews(v); setSaved(s); setEnquiries(e); setInspections(insp);
    }).finally(() => setLoading(false));
  }, []);

  const byType = {};
  properties.forEach((p) => { const t = p.property_type || 'unknown'; byType[t] = (byType[t] || 0) + 1; });
  const byStatus = {};
  properties.forEach((p) => { const s = p.status || 'unknown'; byStatus[s] = (byStatus[s] || 0) + 1; });
  const byState = {};
  properties.forEach((p) => { const s = p.state || 'Unknown'; byState[s] = (byState[s] || 0) + 1; });

  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topStates = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stats = [
    { label: 'Total Properties', value: properties.length, icon: Building2, color: 'text-brand-700' },
    { label: 'Total Views', value: views.length, icon: Eye, color: 'text-info' },
    { label: 'Saved Properties', value: saved.length, icon: Heart, color: 'text-flame-600' },
    { label: 'Enquiries', value: enquiries.length, icon: Mail, color: 'text-success' },
    { label: 'Inspection Requests', value: inspections.length, icon: Calendar, color: 'text-warning' },
    { label: 'Featured', value: properties.filter((p) => p.tags?.includes('featured') || p.status === 'featured').length, icon: Star, color: 'text-flame-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <p className="mt-2 font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-brand-700" /> Properties by Type</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topTypes.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : topTypes.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                <Badge variant="secondary" className="text-xs">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-flame-600" /> Geographic Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topStates.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : topStates.map(([state, count]) => (
              <div key={state} className="flex items-center justify-between">
                <span className="text-sm">{state}</span>
                <Badge variant="secondary" className="text-xs">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-success" /> Inventory Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm capitalize">{status.replace(/_/g, ' ')}</span>
                <Badge variant="secondary" className="text-xs">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-success" /> Recent Enquiries</CardTitle></CardHeader>
        <CardContent>
          {enquiries.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No enquiries yet.</p> : (
            <div className="space-y-2">
              {enquiries.slice(0, 8).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium">{e.customer_name}</p><p className="text-xs text-muted-foreground">{e.property_title || 'Property'} · {e.customer_email || ''}</p></div>
                  <Badge variant="outline" className="text-xs capitalize">{e.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}