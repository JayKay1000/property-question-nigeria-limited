import { useEffect, useState } from 'react';
import { Image, Video, Music, Camera, Map, FileText, Search, Filter, Cpu, HardDrive } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Image as UIImage } from '@/components/ui/image';

const TYPE_ICONS = { image: Image, video: Video, audio: Music, '360_image': Camera, '360_video': Camera, virtual_tour: Map, drone_image: Camera, drone_video: Video, floor_plan: FileText, document: FileText, brochure: FileText };
const STATUS_COLORS = { uploading: 'secondary', processing: 'secondary', ready: 'default', failed: 'destructive', archived: 'secondary', deleted: 'destructive' };

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AssetLibrary() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.MediaAsset.list('-created_date', 200).catch(() => []),
      base44.entities.MediaCategory.list('-sort_order', 50).catch(() => []),
    ]).then(([a, c]) => { setAssets(a); setCategories(c); }).finally(() => setLoading(false));
  }, []);

  const types = [...new Set(assets.map((a) => a.asset_type))];
  const filtered = assets.filter((a) =>
    (!search || (a.display_name?.toLowerCase().includes(search.toLowerCase()) || a.asset_name?.toLowerCase().includes(search.toLowerCase()) || a.original_filename?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterType || a.asset_type === filterType)
  );
  const totalSize = assets.reduce((s, a) => s + (a.file_size_bytes || 0), 0);
  const readyAssets = assets.filter((a) => a.status === 'ready');
  const processingAssets = assets.filter((a) => a.status === 'processing' || a.status === 'uploading');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><FileText className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{assets.length}</p><p className="text-xs text-muted-foreground">Total Assets</p></CardContent></Card>
        <Card><CardContent className="p-4"><Image className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{readyAssets.length}</p><p className="text-xs text-muted-foreground">Ready for Use</p></CardContent></Card>
        <Card><CardContent className="p-4"><Cpu className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{processingAssets.length}</p><p className="text-xs text-muted-foreground">Processing</p></CardContent></Card>
        <Card><CardContent className="p-4"><HardDrive className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{formatSize(totalSize)}</p><p className="text-xs text-muted-foreground">Total Size</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><Image className="h-4 w-4 text-brand-700" /> Digital Asset Library</span>
            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..." className="h-9 pl-9" />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {types.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => setFilterType(null)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${!filterType ? 'bg-brand-700 text-white' : 'hover:bg-muted'}`}>All Types</button>
              {types.map((t) => {
                const Icon = TYPE_ICONS[t] || FileText;
                return <button key={t} onClick={() => setFilterType(filterType === t ? null : t)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${filterType === t ? 'bg-flame-500 text-white' : 'hover:bg-muted'}`}><Icon className="h-3 w-3" />{t.replace(/_/g, ' ')}</button>;
              })}
            </div>
          )}

          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No media assets found. Upload files to populate the library.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.slice(0, 30).map((a) => {
                const Icon = TYPE_ICONS[a.asset_type] || FileText;
                return (
                  <div key={a.id} className="overflow-hidden rounded-lg border">
                    <div className="flex h-32 items-center justify-center bg-muted">
                      {a.thumbnail_url ? <UIImage src={a.thumbnail_url} fittingType="fill" className="h-full w-full" /> : <Icon className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-medium">{a.display_name || a.asset_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{formatSize(a.file_size_bytes)}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <Badge variant={STATUS_COLORS[a.status] || 'secondary'} className="text-xs">{a.status}</Badge>
                        {a.is_featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {filtered.length > 30 && <p className="mt-3 text-center text-xs text-muted-foreground">Showing 30 of {filtered.length} assets</p>}
        </CardContent>
      </Card>

      {categories.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Filter className="h-4 w-4 text-brand-700" /> Categories</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{categories.map((c) => <Badge key={c.id} variant="secondary" className="text-xs">{c.category_name} ({c.item_count || 0})</Badge>)}</div></CardContent>
        </Card>
      )}
    </div>
  );
}