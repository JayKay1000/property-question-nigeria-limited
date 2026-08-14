import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Play, Video, Box } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { getAllImages } from '@/lib/property-utils';
import { isYoutubeUrl } from '@/components/media/youtubeUtils';

export default function Gallery({ property }) {
  const images = getAllImages(property);
  const videos = (property.video_urls || []).filter((u) => !isYoutubeUrl(u));
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const allMedia = [
    ...images.map((url) => ({ type: 'image', url })),
    ...videos.map((url) => ({ type: 'video', url })),
  ];

  const active = allMedia[activeIndex];
  const hasMedia = allMedia.length > 0;

  if (!hasMedia) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-brand-50 text-brand-200">
        <Expand className="h-16 w-16" />
      </div>
    );
  }

  const goPrev = () => setActiveIndex((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === allMedia.length - 1 ? 0 : i + 1));

  return (
    <div>
      {/* Main media */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-900 shadow-premium-lg">
        {active?.type === 'image' ? (
          <Image src={active.url} alt={property.title} fittingType="fit"
            className="h-full w-full" />
        ) : active?.type === 'video' ? (
          <video src={active.url} controls preload="metadata" className="h-full w-full object-contain" />
        ) : null}

        <button onClick={goPrev} aria-label="Previous"
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-900 backdrop-blur transition hover:bg-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={goNext} aria-label="Next"
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-900 backdrop-blur transition hover:bg-white">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-4 rounded-full bg-brand-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {activeIndex + 1} / {allMedia.length}
        </div>
        {property.virtual_tour_url && (
          <a href={property.virtual_tour_url} target="_blank" rel="noopener noreferrer"
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-flame-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-flame-600">
            <Box className="h-3.5 w-3.5" /> 360° Tour
          </a>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {allMedia.map((media, i) => (
          <button key={i} onClick={() => setActiveIndex(i)}
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
    </div>
  );
}