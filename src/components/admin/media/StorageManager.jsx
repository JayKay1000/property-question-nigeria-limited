import { useEffect, useState } from 'react';
import { HardDrive, Cloud, Copy, FileQuestion, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function StorageManager() {
  const [assets, setAssets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.MediaAsset.list('-created_date', 500).catch(() => []),
      base44.entities.Folder.list('-sort_order', 100).catch(() => []),
    ]).then(([a, f]) => { setAssets(a); setFolders(f); }).finally(() => setLoading(false));
  }, []);

  const totalSize = assets.reduce((s, a) => s + (a.file_size_bytes || 0), 0);
  const byProvider = {};
  assets.forEach((a) => { if (a.storage_provider) { byProvider[a.storage_provider] = (byProvider[a.storage_provider] || { count: 0, size: 0 }); byProvider[a.storage_provider].count++; byProvider[a.storage_provider].size += (a.file_size_bytes || 0); } });

  const byModule = {};
  assets.forEach((a) => { if (a.related_module) { byModule[a.related_module] = (byModule[a.related_module] || 0) + 1; } });

  const checksums = {};
  let duplicateCount = 0;
  assets.forEach((a) => { if (a.checksum) { if (checksums[a.checksum]) duplicateCount++; checksums[a.checksum] = true; } });

  const orphanedAssets = assets.filter((a) => !a.related_entity_id && !a.folder_id);
  const largeFiles = assets.filter((a) => (a.file_size_bytes || 0) > 50 * 1024 * 1024).sort((a, b) => (b.file_size_bytes || 0) - (a.file_size_bytes || 0));

  const rootFolders = folders.filter((f) => !f.parent_folder_id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><HardDrive className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{formatSize(totalSize)}</p><p className="text-xs text-muted-foreground">Total Storage Used</p></CardContent></Card>
        <Card><CardContent className="p-4"><Cloud className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(byProvider).length}</p><p className="text-xs text-muted-foreground">Storage Providers</p></CardContent></Card>
        <Card><CardContent className="p-4"><Copy className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{duplicateCount}</p><p className="text-xs text-muted-foreground">Duplicate Files</p></CardContent></Card>
        <Card><CardContent className="p-4"><FileQuestion className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{orphanedAssets.length}</p><p className="text-xs text-muted-foreground">Orphaned Files</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Cloud className="h-4 w-4 text-brand-700" /> Storage Provider Distribution</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(byProvider).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No storage data.</p> : (
            <div className="space-y-2">
              {Object.entries(byProvider).map(([provider, data]) => (
                <div key={provider} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3"><Cloud className="h-4 w-4 text-brand-700" /><div><p className="text-sm font-medium capitalize">{provider?.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{data.count} files · {formatSize(data.size)}</p></div></div>
                  <Badge variant="default" className="text-xs">{((data.size / totalSize) * 100).toFixed(1)}%</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><HardDrive className="h-4 w-4 text-flame-600" /> Storage by Module</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(byModule).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No module data.</p> : (
              <div className="space-y-2">
                {Object.entries(byModule).sort((a, b) => b[1] - a[1]).map(([mod, count]) => (
                  <div key={mod} className="flex items-center justify-between rounded-lg border p-2.5">
                    <span className="text-sm capitalize">{mod?.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary" className="text-xs">{count} assets</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> Large Files {'>'} 50 MB</CardTitle></CardHeader>
          <CardContent>
            {largeFiles.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No large files.</p> : (
              <div className="space-y-2">
                {largeFiles.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <p className="truncate text-sm font-medium">{a.display_name || a.asset_name}</p>
                    <Badge variant="secondary" className="text-xs">{formatSize(a.file_size_bytes)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><HardDrive className="h-4 w-4 text-brand-700" /> Folder Structure</CardTitle></CardHeader>
        <CardContent>
          {rootFolders.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No folders created.</p> : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {rootFolders.map((f) => (
                <div key={f.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{f.folder_name}</p>
                  <p className="text-xs text-muted-foreground">{f.item_count || 0} items · {formatSize(f.total_size_bytes)}</p>
                  {f.is_system_folder && <Badge variant="secondary" className="mt-1 text-xs">System</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}