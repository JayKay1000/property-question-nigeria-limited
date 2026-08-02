import { useEffect, useState } from 'react';
import { BarChart3, Download, Eye, TrendingUp, Calendar, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MediaAnalytics() {
  const [downloads, setDownloads] = useState([]);
  const [views, setViews] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.FileDownload.list('-download_date', 200).catch(() => []),
      base44.entities.FileView.list('-view_date', 200).catch(() => []),
      base44.entities.MediaAsset.list('-created_date', 200).catch(() => []),
    ]).then(([d, v, a]) => { setDownloads(d); setViews(v); setAssets(a); }).finally(() => setLoading(false));
  }, []);

  const downloadByEntity = {};
  downloads.forEach((d) => { const key = d.entity_name || d.entity_id; downloadByEntity[key] = (downloadByEntity[key] || 0) + 1; });
  const topDownloaded = Object.entries(downloadByEntity).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxDL = topDownloaded.length ? topDownloaded[0][1] : 1;

  const viewByEntity = {};
  views.forEach((v) => { const key = v.entity_name || v.entity_id; viewByEntity[key] = (viewByEntity[key] || 0) + 1; });
  const topViewed = Object.entries(viewByEntity).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxView = topViewed.length ? topViewed[0][1] : 1;

  const viewBySource = {};
  views.forEach((v) => { if (v.source) viewBySource[v.source] = (viewBySource[v.source] || 0) + 1; });

  const downloadByPurpose = {};
  downloads.forEach((d) => { if (d.purpose) downloadByPurpose[d.purpose] = (downloadByPurpose[d.purpose] || 0) + 1; });

  const uniqueViewers = new Set(views.map((v) => v.user_id || v.session_id)).size;
  const totalDownloads = downloads.length;
  const totalViews = views.length;
  const avgDuration = views.length > 0 ? Math.round(views.reduce((s, v) => s + (v.view_duration_seconds || 0), 0) / views.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Download className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{totalDownloads}</p><p className="text-xs text-muted-foreground">Total Downloads</p></CardContent></Card>
        <Card><CardContent className="p-4"><Eye className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{totalViews}</p><p className="text-xs text-muted-foreground">Total Views</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{uniqueViewers}</p><p className="text-xs text-muted-foreground">Unique Viewers</p></CardContent></Card>
        <Card><CardContent className="p-4"><Calendar className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{avgDuration}s</p><p className="text-xs text-muted-foreground">Avg View Duration</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Download className="h-4 w-4 text-brand-700" /> Most Downloaded Assets</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {topDownloaded.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No download data.</p> : topDownloaded.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-48 truncate text-sm">{name}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxDL) * 100}%` }} /></div>
              <Badge variant="secondary" className="w-12 justify-center text-xs">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4 text-info" /> Most Viewed Assets</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {topViewed.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No view data.</p> : topViewed.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-48 truncate text-sm">{name}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-info" style={{ width: `${(count / maxView) * 100}%` }} /></div>
              <Badge variant="secondary" className="w-12 justify-center text-xs">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-brand-700" /> Views by Source</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(viewBySource).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No source data.</p> : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(viewBySource).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                  <div key={src} className="flex flex-col items-center rounded-lg border p-3 px-6">
                    <span className="font-heading text-2xl font-bold">{count}</span>
                    <span className="text-xs capitalize text-muted-foreground">{src?.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-flame-600" /> Downloads by Purpose</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(downloadByPurpose).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No purpose data.</p> : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(downloadByPurpose).sort((a, b) => b[1] - a[1]).map(([purpose, count]) => (
                  <div key={purpose} className="flex flex-col items-center rounded-lg border p-3 px-6">
                    <span className="font-heading text-2xl font-bold">{count}</span>
                    <span className="text-xs capitalize text-muted-foreground">{purpose?.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}