import { useState } from 'react';
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Eye, Video, Camera, Navigation, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ImmersiveViewer({ property, virtualTours = [], media360 = [], videos = [], droneMedia = [], images = [] }) {
  const [activeTab, setActiveTab] = useState('images');
  const [currentImage, setCurrentImage] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [current360, setCurrent360] = useState(0);
  const [currentDrone, setCurrentDrone] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const hasImages = images.length > 0 || property?.image_urls?.length > 0 || property?.featured_image_url;
  const hasVideos = videos.length > 0;
  const has360 = media360.length > 0;
  const hasDrone = droneMedia.length > 0;
  const hasVirtualTour = virtualTours.length > 0;

  const allImages = [
    ...(property?.featured_image_url ? [property.featured_image_url] : []),
    ...(property?.image_urls || []),
    ...images.map((i) => i.image_url),
  ].filter(Boolean);
  const uniqueImages = [...new Set(allImages)];

  const active360 = media360[current360];
  const activeVideo = videos[currentVideo];
  const activeDrone = droneMedia[currentDrone];

  const resetZoom = () => setZoom(1);

  return (
    <div className={`overflow-hidden rounded-2xl border border-brand-200 bg-brand-950 ${fullscreen ? 'fixed inset-0 z-[70] rounded-none' : ''}`}>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/10 bg-brand-900 p-2">
        {hasImages && (
          <TabButton active={activeTab === 'images'} onClick={() => setActiveTab('images')} icon={Camera} label={`Images (${uniqueImages.length})`} />
        )}
        {has360 && (
          <TabButton active={activeTab === '360'} onClick={() => setActiveTab('360')} icon={Eye} label={`360° (${media360.length})`} />
        )}
        {hasVirtualTour && (
          <TabButton active={activeTab === 'virtual'} onClick={() => setActiveTab('virtual')} icon={Navigation} label="Virtual Tour" />
        )}
        {hasVideos && (
          <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon={Video} label={`Videos (${videos.length})`} />
        )}
        {hasDrone && (
          <TabButton active={activeTab === 'drone'} onClick={() => setActiveTab('drone')} icon={Navigation} label={`Drone (${droneMedia.length})`} />
        )}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setShowHelp(!showHelp)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20" aria-label="Help">
            <HelpCircle className="h-4 w-4" />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20" aria-label="Fullscreen">
            {fullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Viewer area */}
      <div className="relative aspect-video bg-brand-950">
        {/* Images tab */}
        {activeTab === 'images' && uniqueImages.length > 0 && (
          <div className="relative h-full w-full overflow-hidden">
            <div className="h-full w-full" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
              <Image src={uniqueImages[currentImage]} alt={property?.title || 'Property'} fittingType="fit" className="h-full w-full" />
            </div>
            {uniqueImages.length > 1 && (
              <>
                <button onClick={() => { setCurrentImage((c) => (c - 1 + uniqueImages.length) % uniqueImages.length); resetZoom(); }}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button onClick={() => { setCurrentImage((c) => (c + 1) % uniqueImages.length); resetZoom(); }}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                  <RotateCcw className="h-5 w-5 scale-x-[-1]" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-950/80 px-3 py-1 text-xs text-white backdrop-blur-md">
                  {currentImage + 1} / {uniqueImages.length}
                </div>
              </>
            )}
            <div className="absolute right-3 top-3 flex gap-1.5">
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={resetZoom} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* 360 tab */}
        {activeTab === '360' && active360 && (
          <div className="h-full w-full">
            {active360.viewer_url ? (
              <iframe src={active360.viewer_url} title="360 Tour" className="h-full w-full border-0" allow="fullscreen; gyroscope; accelerometer" />
            ) : active360.source_image_url ? (
              <div className="flex h-full w-full items-center justify-center bg-brand-900">
                <Image src={active360.source_image_url} alt="360 Panorama" fittingType="fit" className="h-full w-full" />
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-950/80 px-3 py-1 text-xs text-white">360° Panorama — drag to look around</span>
              </div>
            ) : (
              <EmptyViewer icon={Eye} label="360° media not yet available" />
            )}
          </div>
        )}

        {/* Virtual tour tab */}
        {activeTab === 'virtual' && hasVirtualTour && (
          <div className="h-full w-full">
            {virtualTours[0]?.tour_url ? (
              <iframe src={virtualTours[0].tour_url} title={virtualTours[0].title || 'Virtual Tour'} className="h-full w-full border-0" allow="fullscreen; gyroscope; accelerometer" />
            ) : (
              <EmptyViewer icon={Navigation} label="Virtual tour not yet available" />
            )}
          </div>
        )}

        {/* Videos tab */}
        {activeTab === 'videos' && activeVideo && (
          <div className="h-full w-full bg-black">
            <video src={activeVideo.video_url} controls={!muted} muted={muted} autoPlay className="h-full w-full" poster={activeVideo.thumbnail_url} />
            <div className="absolute right-3 top-3 flex gap-1.5">
              <button onClick={() => setMuted(!muted)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
            {videos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {videos.map((v, i) => (
                  <button key={v.id || i} onClick={() => setCurrentVideo(i)}
                    className={`h-2 rounded-full transition ${i === currentVideo ? 'w-8 bg-flame-500' : 'w-2 bg-white/30'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drone tab */}
        {activeTab === 'drone' && activeDrone && (
          <div className="h-full w-full bg-black">
            {activeDrone.drone_media_type?.includes('video') ? (
              <video src={activeDrone.media_asset_id} controls className="h-full w-full" />
            ) : (
              <Image src={activeDrone.preview_url || activeDrone.media_asset_id} alt="Drone footage" fittingType="fit" className="h-full w-full" />
            )}
            <span className="absolute bottom-4 left-4 rounded-full bg-brand-950/80 px-3 py-1 text-xs text-white">Drone footage</span>
          </div>
        )}

        {/* Help overlay */}
        {showHelp && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-950/90 p-6" onClick={() => setShowHelp(false)}>
            <div className="max-w-sm rounded-xl bg-white p-5 text-sm text-brand-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-heading text-base font-bold">Tour Controls</h4>
                <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-brand-900"><X className="h-4 w-4" /></button>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex gap-2"><Camera className="h-4 w-4 shrink-0 text-flame-500" /> <strong>Images:</strong> Click arrows or use zoom controls</li>
                <li className="flex gap-2"><Eye className="h-4 w-4 shrink-0 text-info" /> <strong>360°:</strong> Drag to look around, use gyroscope on mobile</li>
                <li className="flex gap-2"><Navigation className="h-4 w-4 shrink-0 text-success" /> <strong>Virtual Tour:</strong> Navigate between scenes with hotspots</li>
                <li className="flex gap-2"><Video className="h-4 w-4 shrink-0 text-flame-500" /> <strong>Videos:</strong> Toggle mute, switch between clips</li>
                <li className="flex gap-2"><Maximize2 className="h-4 w-4 shrink-0 text-brand-700" /> <strong>Fullscreen:</strong> Click the expand icon for immersive viewing</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${active ? 'bg-flame-500 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
      <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EmptyViewer({ icon: Icon, label }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-brand-900">
      <Icon className="h-12 w-12 text-white/20" />
      <p className="mt-3 text-sm text-white/40">{label}</p>
    </div>
  );
}