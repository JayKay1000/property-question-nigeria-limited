import { Link } from 'react-router-dom';
import { Play, MapPin, Heart, Share2, Star, View, Box, Scan, Navigation, MousePointer, Clock } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice, buildShortLocation } from '@/lib/tour-utils';

export default function TourCard({ tour, property, onSave, isSaved, onShare }) {
  const typeConfig = {
    '360_tour': { label: '360° Tour', icon: View, badge: 'bg-info text-white' },
    vr_tour: { label: 'VR Tour', icon: Box, badge: 'bg-brand-700 text-white' },
    panorama: { label: 'Panorama', icon: Scan, badge: 'bg-flame-500 text-white' },
    guided_tour: { label: 'Guided Tour', icon: Navigation, badge: 'bg-success text-white' },
    interactive: { label: 'Interactive', icon: MousePointer, badge: 'bg-purple-600 text-white' },
  };
  const cfg = typeConfig[tour.tour_type] || typeConfig['360_tour'];
  const TypeIcon = cfg.icon;
  const thumb = tour.thumbnail_url || property?.featured_image_url || property?.image_urls?.[0];
  const title = tour.title || property?.title || 'Untitled Property';
  const price = property?.price;
  const location = property ? buildShortLocation(property) : null;

  const handleSave = (e) => { e.preventDefault(); e.stopPropagation(); onSave?.(tour); };
  const handleShare = (e) => { e.preventDefault(); e.stopPropagation(); onShare?.(tour); };

  return (
    <Link to={`/tours/${tour.id}?property=${property?.id || ''}`} className="group block overflow-hidden rounded-2xl border border-brand-100 bg-ice-50 shadow-card transition-all hover:shadow-card-hover hover:border-flame-200">
      <div className="relative aspect-video overflow-hidden bg-brand-100">
        {thumb ? (
          <Image src={thumb} alt={title} fittingType="fill" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950"><View className="h-10 w-10 text-brand-400" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
            <TypeIcon className="h-3 w-3" /> {cfg.label}
          </span>
          {property?.is_featured && (
            <span className="flex items-center gap-1 rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white">
              <Star className="h-3 w-3 fill-white" /> Featured
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button onClick={handleSave} aria-label="Save tour"
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${isSaved ? 'bg-flame-500 text-white' : 'bg-white/80 text-brand-700 hover:bg-white'}`}>
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
          <button onClick={handleShare} aria-label="Share tour"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brand-700 backdrop-blur-md transition hover:bg-white">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-flame-500/90 shadow-glow-flame">
            <Play className="h-6 w-6 fill-white text-white" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-heading text-base font-bold leading-tight text-brand-900 group-hover:text-flame-600 line-clamp-1">{title}</h3>
        {location && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" /><span className="line-clamp-1">{location}</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            {price != null ? (
              <>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</p>
                <p className="font-heading text-lg font-bold text-flame-600">{formatPrice(price)}</p>
              </>
            ) : <p className="text-sm font-semibold text-muted-foreground">Price on request</p>}
          </div>
          {tour.estimated_duration_minutes != null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {tour.estimated_duration_minutes}m tour
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}