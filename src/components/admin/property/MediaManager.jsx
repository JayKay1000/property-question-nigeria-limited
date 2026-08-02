import { useEffect, useState } from 'react';
import { Image as ImageIcon, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MediaManager() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tours, setTours] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PropertyImage.list('-created_date', 30).catch(() => []),
      base44.entities.PropertyVideo.list('-created_date', 20).catch(() => []),
      base44.entities.VirtualTour.list('-created_date', 10).catch(() => []),
      base44.entities.Property.list('-created_date', 200).catch(() => []),
    ]).then(([imgs, vids, turs, props]) => {
      setImages(imgs); setVideos(vids); setTours(turs); setProperties(props);
    }).finally(() => setLoading(false));
  }, []);

  const propsWithoutImages = properties.filter((p) => !images.some((i) => i.property_id === p.id) && (!p.image_urls || p.image_urls.length === 0));
  const unoptimizedCount = images.filter((i) => !i.is_optimized).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><CardContent className="p-4"><ImageIcon className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{images.length}</p><p className="text-xs text-muted-foreground">Total Images</p></CardContent></Card>
        <Card><CardContent className="p-4"><Video className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{videos.length}</p><p className="text-xs text-muted-foreground">Videos</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertCircle className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{propsWithoutImages.length}</p><p className="text-xs text-muted-foreground">Missing Images</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertCircle className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{unoptimizedCount}</p><p className="text-xs text-muted-foreground">Unoptimized</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{tours.length}</p><p className="text-xs text-muted-foreground">Virtual Tours</p></CardContent></Card>
      </div>

      {propsWithoutImages.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4 text-warning" /> Properties Missing Images</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {propsWithoutImages.slice(0, 15).map((p) => <Badge key={p.id} variant="outline" className="text-xs">{p.title || p.reference_number || 'Untitled'}</Badge>)}
              {propsWithoutImages.length > 15 && <Badge variant="secondary" className="text-xs">+{propsWithoutImages.length - 15} more</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ImageIcon className="h-4 w-4 text-brand-700" /> Recent Images</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : images.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {images.slice(0, 12).map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                  <img src={img.thumbnail_url || img.image_url} alt={img.caption || ''} className="h-full w-full object-cover" loading="lazy" />
                  {img.is_featured && <Badge className="absolute left-1 top-1 bg-flame-500 text-xs">Featured</Badge>}
                  {!img.is_optimized && <Badge variant="secondary" className="absolute right-1 top-1 text-xs">HD</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}