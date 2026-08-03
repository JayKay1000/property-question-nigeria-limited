import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Heart } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Image } from '@/components/ui/image';

export default function PropertyCard({ property, href = '#' }) {
  const {
    title = 'Untitled Property',
    location = 'Location unavailable',
    price = 'Price on request',
    image,
    beds,
    baths,
    area,
    status,
    tag,
  } = property;

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fittingType="fit"
            className="h-full w-full bg-brand-50/40 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-200">
            <Maximize className="h-12 w-12" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {status && <StatusBadge status={status} />}
          {tag && <StatusBadge status={tag} />}
        </div>

        <button
          onClick={(e) => e.preventDefault()}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-700 backdrop-blur transition-colors hover:bg-white hover:text-flame-500"
          aria-label="Save property"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="truncate font-heading font-semibold text-brand-900">{title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {location}
        </p>
        <p className="mt-2 text-lg font-heading font-bold text-flame-600">{price}</p>
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {beds != null && (
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {beds}</span>
          )}
          {baths != null && (
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {baths}</span>
          )}
          {area != null && (
            <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {area}</span>
          )}
        </div>
      </div>
    </Link>
  );
}