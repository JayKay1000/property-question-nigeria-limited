import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Expand, Play, Video, X, Camera } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { getAllImages } from '@/lib/property-utils';
import { isYoutubeUrl } from '@/components/media/youtubeUtils';

export default function Gallery({ property }) {
  const images = getAllImages(property);
  const videos = (property.video_urls || []).filter((u) => !isYoutubeUrl(u));
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const allMedia = [
    ...images.map((url) => ({ type: 'image', url })),
    ...videos.map((url) => ({ type: 'video', url })),
  ];

  const hasMedia = allMedia.length > 0;
  const cover = images[0];
  const galleryItems = allMedia.slice(1); // everything after the cover

  const goPrev = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i === 0 ? allMedia.length - 1 : i - 1))), [allMedia.length]);
  const goNext = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i === allMedia.length - 1 ? 0 : i + 1))), [allMedia.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, goPrev, goNext]);

  if (!hasMedia) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-brand-50 text-brand-200">
        <Expand className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero cover image */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-900 shadow-premium-lg">
        <button onClick={() => setLightboxIndex(0)} className="block w-full" aria-label="Open cover image in full screen">
          <Image src={cover} alt={property.title} fittingType="fill" className="aspect-[16/10] w-full sm:aspect-[21/9] lg:aspect-[2/1]" />
        </button>

        {/* Cover badge */}
        <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-flame-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
          <Camera className="h-3.5 w-3.5" /> Cover
        </span>

        {/* Photo count + full screen */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <span className="rounded-full bg-brand-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => setLightboxIndex(0)} aria-label="Open full screen"
            className="flex items-center gap-1.5 rounded-full bg-brand-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-brand-950">
            <Expand className="h-3.5 w-3.5" /> Full screen
          </button>
        </div>
      </div>

      {/* Gallery grid (remaining photos) */}
      {galleryItems.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {galleryItems.map((media, i) => {
            const absoluteIndex = i + 1; // offset by the cover
            return (
              <button
                key={i}
                onClick={() => setLightboxIndex(absoluteIndex)}
                aria-label={`View photo ${absoluteIndex + 1}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-brand-50 transition hover:ring-2 hover:ring-flame-400"
              >
                {media.type === 'image' ? (
                  <Image src={media.url} alt="" fittingType="fill" className="h-full w-full transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-800 text-white">
                    <Video className="h-6 w-6" />
                  </div>
                )}
                {media.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-950/40">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-brand-950/0 opacity-0 transition group-hover:bg-brand-950/30 group-hover:opacity-100">
                  <Expand className="h-5 w-5 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && allMedia[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/90 p-4" onClick={() => setLightboxIndex(null)}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }} aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {allMedia.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous"
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next"
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          {allMedia[lightboxIndex].type === 'image' ? (
            <img src={allMedia[lightboxIndex].url} alt={property.title} onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain" />
          ) : (
            <video src={allMedia[lightboxIndex].url} controls autoPlay onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg" />
          )}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            {lightboxIndex + 1} / {allMedia.length}
          </span>
        </div>
      )}
    </div>
  );
}