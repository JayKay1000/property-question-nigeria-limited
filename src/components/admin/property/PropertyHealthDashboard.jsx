import { useEffect, useState } from 'react';
import { HeartPulse, ImageIcon, MapPin, FileText, FileEdit, Search, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PropertyHealthDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Property.list('-created_date', 200)
      .then(setProperties)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = properties.length;
  const missingImages = properties.filter((p) => !p.image_urls || p.image_urls.length === 0);
  const missingCoords = properties.filter((p) => !p.latitude || !p.longitude);
  const missingDesc = properties.filter((p) => !p.description || p.description.length < 50);
  const unpublishedDrafts = properties.filter((p) => p.status === 'draft');
  const shortTitles = properties.filter((p) => !p.title || p.title.length < 10);

  const healthChecks = [
    { label: 'Missing Images', count: missingImages.length, icon: ImageIcon, color: 'text-warning', max: total },
    { label: 'Missing Coordinates', count: missingCoords.length, icon: MapPin, color: 'text-info', max: total },
    { label: 'Incomplete Descriptions', count: missingDesc.length, icon: FileText, color: 'text-flame-600', max: total },
    { label: 'Unpublished Drafts', count: unpublishedDrafts.length, icon: FileEdit, color: 'text-muted-foreground', max: total },
    { label: 'Short/Invalid Titles', count: shortTitles.length, icon: Search, color: 'text-destructive', max: total },
  ];

  const dataQualityScore = total > 0 ? Math.round(((total - missingImages.length - missingCoords.length - missingDesc.length - shortTitles.length) / (total * 4)) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <HeartPulse className="h-6 w-6 text-flame-600" />
            <p className="mt-3 font-heading text-4xl font-bold">{dataQualityScore}%</p>
            <p className="text-sm text-muted-foreground">Data Quality Score</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${dataQualityScore > 75 ? 'bg-success' : dataQualityScore > 50 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${dataQualityScore}%` }} />
            </div>
          </CardContent>
        </Card>
        {healthChecks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <check.icon className={`h-5 w-5 ${check.color}`} />
              <p className="mt-2 font-heading text-2xl font-bold">{check.count}</p>
              <p className="text-xs text-muted-foreground">{check.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">of {check.max} properties</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {missingImages.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ImageIcon className="h-4 w-4 text-warning" /> Listings Missing Images</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingImages.slice(0, 15).map((p) => <Badge key={p.id} variant="outline" className="text-xs">{p.title || p.reference_number || 'Untitled'}</Badge>)}
              {missingImages.length > 15 && <Badge variant="secondary" className="text-xs">+{missingImages.length - 15} more</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {unpublishedDrafts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileEdit className="h-4 w-4 text-muted-foreground" /> Unpublished Drafts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unpublishedDrafts.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium">{p.title || 'Untitled'}</p><p className="text-xs text-muted-foreground">{p.reference_number || 'No ref'}</p></div>
                  <Badge variant="secondary" className="text-xs">Draft</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}