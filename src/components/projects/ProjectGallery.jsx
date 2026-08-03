import { useState } from 'react';
import { Images, Video, FileText, Play, X, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProjectGallery({ project, mediaItems = [] }) {
  const galleryImages = project.gallery_urls || [];
  const allImages = [project.featured_image_url, ...galleryImages].filter(Boolean);
  const videos = mediaItems.filter((m) => ['drone_video', 'progress_video', 'marketing_video'].includes(m.media_type));
  const documents = mediaItems.filter((m) => ['brochure', 'site_plan', 'other'].includes(m.media_type));
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const next = () => setLightboxIndex((i) => (i + 1) % allImages.length);
  const prev = () => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <div>
      <Tabs defaultValue="images">
        <TabsList className="mb-4 bg-ice-100">
          <TabsTrigger value="images" className="data-[state=active]:bg-white">
            <Images className="mr-1.5 h-4 w-4" /> Images ({allImages.length})
          </TabsTrigger>
          {videos.length > 0 && (
            <TabsTrigger value="videos" className="data-[state=active]:bg-white">
              <Video className="mr-1.5 h-4 w-4" /> Videos ({videos.length})
            </TabsTrigger>
          )}
          {documents.length > 0 && (
            <TabsTrigger value="docs" className="data-[state=active]:bg-white">
              <FileText className="mr-1.5 h-4 w-4" /> Documents ({documents.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="images">
          {allImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {allImages.map((url, i) => (
                <button key={i} onClick={() => openLightbox(i)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-brand-100">
                  <Image src={url} alt={`Gallery ${i + 1}`} fittingType="fill"
                    className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-950/0 transition group-hover:bg-brand-950/30">
                    <Maximize className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-ice-50 text-sm text-muted-foreground">
              No images available yet
            </div>
          )}
        </TabsContent>

        {videos.length > 0 && (
          <TabsContent value="videos">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {videos.map((v) => (
                <div key={v.id} className="overflow-hidden rounded-xl bg-brand-900">
                  <div className="relative aspect-video">
                    {v.media_url ? (
                      <video src={v.media_url} controls className="h-full w-full" poster={v.thumbnail_url} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white">{v.title || 'Project Video'}</p>
                    {v.description && <p className="mt-0.5 text-xs text-white/60">{v.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {documents.length > 0 && (
          <TabsContent value="docs">
            <div className="space-y-3">
              {documents.map((d) => (
                <a key={d.id} href={d.media_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-brand-100 bg-ice-50 p-4 transition hover:border-flame-200 hover:bg-flame-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flame-100 text-flame-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-900">{d.title || 'Document'}</p>
                    <p className="text-xs text-muted-foreground">{d.description || 'Click to view'}</p>
                  </div>
                </a>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Lightbox */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-950/95" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img src={allImages[lightboxIndex]} alt="Gallery" className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronRight className="h-6 w-6" />
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70">{lightboxIndex + 1} / {allImages.length}</p>
        </div>
      )}
    </div>
  );
}