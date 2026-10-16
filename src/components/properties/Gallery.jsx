import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Expand, Play, Video, X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { getAllImages } from '@/lib/property-utils';
import { isYoutubeUrl } from '@/components/media/youtubeUtils';

export default function Gallery({ property }) {
  const images = getAllImages(property);
  const videos = (property.video_urls || []).filter((u) => !isYoutubeUrl(u));
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allMedia = [
    ...images.map((url) => ({ type: 'image', url })),
    ...videos.map((url) => ({ type: 'video', url })),
  ];

  const hasMedia = allMedia.length > 0;
  const active = allMedia[activeIndex];

  const goPrev = useCallback(() => setActiveIndex((i) => (i === 0 ? allMedia.length - 1 : i - 1)), [allMedia.length]);
  const goNext = useCallback(() => setActiveIndex((i) => (i === allMedia.length - 1 ? 0 : i + 1)), [allMedia.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, goPrev, goNext]);

  if (!hasMedia) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-brand-50 text-brand-200">
        <Expand className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      {/* Main media */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-900 shadow-premium-lg">
        {active?.type === 'image' ? (
          <button onClick={() => setLightboxOpen(true)} className="h-full w-full" aria-label="Open image in full screen">
            <Image src={active.url} alt={property.title} fittingType="fit" className="h-full w-full" />
          </button>
        ) : active?.type === 'video' ? (
          <video src={active.url} controls preload="metadata" className="h-full w-full object-contain" />
        ) : null}

        {allMedia.length > 1 && (
          <>
            <button onClick={goPrev} aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-900 backdrop-blur transition hover:bg-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={goNext} aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-900 backdrop-blur transition hover:bg-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-4 rounded-full bg-brand-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {activeIndex + 1} / {allMedia.length}
        </div>
        {active?.type === 'image' && (
          <button onClick={() => setLightboxOpen(true)} aria-label="Open full screen"
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-brand-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-brand-950">
            <Expand className="h-3.5 w-3.5" /> Full screen
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {allMedia.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allMedia.map((media, i) => (
            <button key={i} onClick={() => setActiveIndex(i)} aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex ? 'border-flame-500' : 'border-transparent hover:border-brand-200'
              }`}>
              {media.type === 'image' ? (
                <Image src={media.url} alt="" fittingType="fit" className="h-full w-full bg-brand-900" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-800 text-white">
                  <Video className="h-5 w-5" />
                </div>
              )}
              {media.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-950/40">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && active?.type === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/90 p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }} aria-label="Close"
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
          <img src={active.url} alt={property.title} onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain" />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            {activeIndex + 1} / {allMedia.length}
          </span>
        </div>
      )}
    </div>
  );
}