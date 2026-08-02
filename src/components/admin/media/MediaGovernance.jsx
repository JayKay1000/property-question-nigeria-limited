import { useEffect, useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, Tag, Folder } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MediaGovernance() {
  const [assets, setAssets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.MediaAsset.list('-created_date', 200).catch(() => []),
      base44.entities.Document.list('-created_date', 200).catch(() => []),
      base44.entities.Folder.list('-sort_order', 100).catch(() => []),
      base44.entities.MediaTag.list('-sort_order', 100).catch(() => []),
      base44.entities.MediaCategory.list('-sort_order', 100).catch(() => []),
      base44.entities.FileVersion.list('-created_date', 100).catch(() => []),
    ]).then(([a, d, f, t, c, v]) => { setAssets(a); setDocuments(d); setFolders(f); setTags(t); setCategories(c); setVersions(v); }).finally(() => setLoading(false));
  }, []);

  const assetsNoAltText = assets.filter((a) => !a.description && a.asset_type === 'image');
  const assetsNoCategory = assets.filter((a) => !a.category_id);
  const assetsNoTags = assets.filter((a) => !a.tags || a.tags.length === 0);
  const docsNoReference = documents.filter((d) => !d.document_reference);
  const docsNoOwner = documents.filter((d) => !d.owner_id);
  const docsExpiredNoArchive = documents.filter((d) => d.expiry_date && new Date(d.expiry_date) < new Date() && d.status !== 'archived');
  const orphanedFolders = folders.filter((f) => f.item_count === 0);
  const unusedTags = tags.filter((t) => (t.usage_count || 0) === 0);
  const multiVersion = versions.filter((v) => v.version_number > 1);

  const totalItems = assets.length + documents.length;
  const issuesCount = assetsNoAltText.length + assetsNoCategory.length + docsNoReference.length + docsNoOwner.length + docsExpiredNoArchive.length;
  const completenessScore = totalItems > 0 ? Math.round(((totalItems - issuesCount) / totalItems) * 100) : 100;

  const checks = [
    { label: 'Assets Missing Description/Alt Text', count: assetsNoAltText.length, icon: AlertTriangle },
    { label: 'Assets Without Category', count: assetsNoCategory.length, icon: AlertTriangle },
    { label: 'Assets Without Tags', count: assetsNoTags.length, icon: Tag },
    { label: 'Documents Missing Reference Number', count: docsNoReference.length, icon: AlertTriangle },
    { label: 'Documents Without Owner', count: docsNoOwner.length, icon: AlertTriangle },
    { label: 'Expired Documents Not Archived', count: docsExpiredNoArchive.length, icon: AlertTriangle },
    { label: 'Empty Folders', count: orphanedFolders.length, icon: Folder },
    { label: 'Unused Tags', count: unusedTags.length, icon: Tag },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Database className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle2 className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{completenessScore}%</p><p className="text-xs text-muted-foreground">Data Quality Score</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertTriangle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{issuesCount}</p><p className="text-xs text-muted-foreground">Quality Issues</p></CardContent></Card>
        <Card><CardContent className="p-4"><Database className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{multiVersion.length}</p><p className="text-xs text-muted-foreground">Versioned Files</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <check.icon className={`h-5 w-5 ${check.count > 0 ? 'text-warning' : 'text-success'}`} />
                  <div><p className="text-sm font-medium">{check.label}</p><p className="text-xs text-muted-foreground">{check.count} items</p></div>
                </div>
                <Badge variant={check.count > 0 ? 'destructive' : 'default'} className="text-xs">{check.count > 0 ? 'Fix' : 'OK'}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {unusedTags.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-warning" /> Unused Tags</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{unusedTags.map((t) => <Badge key={t.id} variant="secondary" className="text-xs">{t.tag_name}</Badge>)}</div></CardContent>
        </Card>
      )}

      {docsExpiredNoArchive.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-destructive" /> Expired Documents Not Archived</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {docsExpiredNoArchive.slice(0, 10).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                <div><p className="text-sm font-medium">{d.title}</p><p className="text-xs text-muted-foreground">Expired: {d.expiry_date}</p></div>
                <Badge variant="destructive" className="text-xs">Archive Needed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}