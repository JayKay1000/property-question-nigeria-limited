import { useEffect, useState } from 'react';
import { TrendingUp, Eye, ShoppingCart, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectForecasting() {
  const [analytics, setAnalytics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ProjectAnalytics.list('-created_date', 100).catch(() => []),
      base44.entities.Project.list('-created_date', 100).catch(() => []),
      base44.entities.PlotReservation.list('-created_date', 100).catch(() => []),
    ]).then(([a, p, r]) => { setAnalytics(a); setProjects(p); setReservations(r); }).finally(() => setLoading(false));
  }, []);

  const views = analytics.filter((a) => a.analytics_type === 'project_view' || a.analytics_type === 'plot_view');
  const totalViews = views.reduce((s, a) => s + (a.count || 1), 0);
  const sales = analytics.filter((a) => a.analytics_type === 'sale');
  const conversions = analytics.filter((a) => a.analytics_type === 'conversion');
  const reservationRate = reservations.length > 0 ? Math.round((reservations.filter((r) => r.reservation_status === 'converted').length / reservations.length) * 100) : 0;

  const byProject = {};
  views.forEach((a) => { const p = a.project_name || 'Unknown'; byProject[p] = (byProject[p] || 0) + (a.count || 1); });
  const topProjects = Object.entries(byProject).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxViews = topProjects.length ? topProjects[0][1] : 1;

  const reservationsByStatus = {};
  reservations.forEach((r) => { reservationsByStatus[r.reservation_status] = (reservationsByStatus[r.reservation_status] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Eye className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{totalViews}</p><p className="text-xs text-muted-foreground">Total Project/Plot Views</p></CardContent></Card>
        <Card><CardContent className="p-4"><ShoppingCart className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{reservations.length}</p><p className="text-xs text-muted-foreground">Total Reservations</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{reservationRate}%</p><p className="text-xs text-muted-foreground">Reservation Conversion</p></CardContent></Card>
        <Card><CardContent className="p-4"><BarChart3 className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{sales.length}</p><p className="text-xs text-muted-foreground">Sales Recorded</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4 text-brand-700" /> Most Viewed Projects</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : topProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No view data yet.</p>
          ) : topProjects.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-40 truncate text-sm">{name}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxViews) * 100}%` }} /></div>
              <Badge variant="secondary" className="text-xs w-12 justify-center">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShoppingCart className="h-4 w-4 text-flame-600" /> Reservation Trends</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(reservationsByStatus).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No reservation data.</p> : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(reservationsByStatus).map(([status, count]) => (
                <div key={status} className="flex flex-col items-center rounded-lg border p-3 px-6">
                  <span className="font-heading text-2xl font-bold">{count}</span>
                  <span className="text-xs capitalize text-muted-foreground">{status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-success" /> Sales Velocity by Project</CardTitle></CardHeader>
        <CardContent>
          {projects.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No projects to analyze.</p> : (
            <div className="space-y-2">
              {projects.filter((p) => p.units_sold > 0).slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <span className="text-sm font-medium">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{p.units_sold} sold / {p.total_units || '?'} total</span>
                    <Badge variant="outline" className="text-xs">{p.units_available || 0} available</Badge>
                  </div>
                </div>
              ))}
              {projects.filter((p) => p.units_sold > 0).length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No sales recorded yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}