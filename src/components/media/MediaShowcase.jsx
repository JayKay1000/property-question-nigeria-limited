import React, { useState } from "react";
import { Box, Youtube } from "lucide-react";
import { Image } from "@/components/ui/image";
import Panorama360Viewer from "./Panorama360Viewer";
import { youtubeEmbedUrl } from "./youtubeUtils";

/**
 * Displays 360° panorama tours and YouTube videos for a property or project.
 * Pass `tour360Urls` (string[]) and `videoUrls` (string[]).
 * Returns null when there is nothing to show.
 */
export default function MediaShowcase({ tour360Urls = [], videoUrls = [] }) {
  const [active360, setActive360] = useState(0);
  const tours = (tour360Urls || []).filter(Boolean);
  const videos = (videoUrls || []).filter(Boolean);

  if (!tours.length && !videos.length) return null;

  return (
    <div className="space-y-8">
      {tours.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brand-900">
            <Box className="h-5 w-5 text-flame-500" /> 360° Virtual Tour
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">Drag to look around the property.</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-brand-900">
            <div className="h-80 w-full sm:h-[420px]">
              <Panorama360Viewer url={tours[active360]} />
            </div>
          </div>
          {tours.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {tours.map((u, i) => (
                <button
                  key={i}
                  onClick={() => setActive360(i)}
                  className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === active360 ? "border-flame-500" : "border-transparent hover:border-brand-200"
                  }`}
                >
                  <Image src={u} alt={`360 view ${i + 1}`} fittingType="fill" className="h-full w-full" />
                  <span className="absolute left-1 top-1 rounded bg-brand-900/70 px-1 text-[9px] font-semibold text-white">360°</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brand-900">
            <Youtube className="h-5 w-5 text-flame-500" /> Videos
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {videos.map((v, i) => {
              const embed = youtubeEmbedUrl(v);
              return (
                <div key={i} className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
                  {embed ? (
                    <iframe
                      className="h-full w-full"
                      src={embed}
                      title={`video-${i + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={v} controls preload="metadata" className="h-full w-full object-contain" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}