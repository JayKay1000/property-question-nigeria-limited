import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, Grid3x3, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectGovernance() {
  const [projects, setProjects] = useState([]);
  const [plots, setPlots] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list('-created_date', 100).catch(() => []),
      base44.entities.EstatePlot.list('-created_date', 200).catch(() => []),
      base44.entities.ProjectDocument.list('-created_date', 100).catch(() => []),
    ]).then(([p, pl, d]) => { setProjects(p); setPlots(pl); setDocs(d); }).finally(() => setLoading(false));
  }, []);

  const missingCoords = projects.filter((p) => !p.latitude || !p.longitude);
  const missingReference = projects.filter((p) => !p.reference_number && !p.code);
  const missingSlug = projects.filter((p) => !p.slug);
  const unverifiedDocs = docs.filter((d) => !d.verified);
  const plotsNoPrice = plots.filter((p) => !p.price_ngn);
  const plotsNoCoords = plots.filter((p) => !p.latitude || !p.longitude);
  const duplicatePlotNumbers = (() => {
    const seen = {};
    const dups = [];
    plots.forEach((p) => { const key = `${p.estate_id}-${p.plot_number}`; if (seen[key]) dups.push(p.plot_number); seen[key] = true; });
    return [...new Set(dups)];
  })();

  const checks = [
    { label: 'Projects Missing Coordinates', count: missingCoords.length, total: projects.length, icon: MapPin, color: 'text-warning' },
    { label: 'Projects Missing Reference Number', count: missingReference.length, total: projects.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Projects Missing Slug', count: missingSlug.length, total: projects.length, icon: AlertTriangle, color: 'text-flame-600' },
    { label: 'Plots Missing Price', count: plotsNoPrice.length, total: plots.length, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Plots Missing Coordinates', count: plotsNoCoords.length, total: plots.length, icon: MapPin, color: 'text-info' },
    { label: 'Duplicate Plot Numbers', count: duplicatePlotNumbers.length, total: plots.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Unverified Documents', count: unverifiedDocs.length, total: docs.length, icon: FileText, color: 'text-warning' },
  ];

  const dataScore = projects.length > 0 ? Math.round(((projects.length - missingCoords.length - missingReference.length) / projects.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Grid3x3 className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{plots.length}</p><p className="text-xs text-muted-foreground">Total Plots</p></CardContent></Card>
        <Card><CardContent className="p-4"><FileText className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{docs.length}</p><p className="text-xs text-muted-foreground">Project Documents</p></CardContent></Card>
        <Card><CardContent className="p-4"><ShieldCheck className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{dataScore}%</p><p className="text-xs text-muted-foreground">Data Quality Score</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertTriangle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{checks.filter((c) => c.count > 0).length}</p><p className="text-xs text-muted-foreground">Issues Detected</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {duplicatePlotNumbers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-destructive" /> Duplicate Plot Numbers Detected</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{duplicatePlotNumbers.map((n, i) => <Badge key={i} variant="destructive" className="text-xs">{n}</Badge>)}</div></CardContent>
        </Card>
      )}

      {missingCoords.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-warning" /> Projects Missing GIS Coordinates</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{missingCoords.slice(0, 10).map((p) => <Badge key={p.id} variant="outline" className="text-xs">{p.name}</Badge>)}{missingCoords.length > 10 && <Badge variant="secondary" className="text-xs">+{missingCoords.length - 10} more</Badge>}</div></CardContent>
        </Card>
      )}
    </div>
  );
}