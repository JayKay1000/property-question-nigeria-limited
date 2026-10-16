import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Heart } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice, buildShortLocation, getPrimaryImage, PURPOSE_CONFIG } from '@/lib/property-utils';

export default function PropertyAdCard({ property, onSave, isSaved }) {
  const image = getPrimaryImage(property);
  const location = buildShortLocation(property);
  const purpose = PURPOSE_CONFIG[property.listing_purpose] || 'For Sale';
  const detailUrl = `/properties/${property.id}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-card">
      <Link to={detailUrl} className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {image ? (
          <Image src={image} alt={property.title} fittingType="fit"
            className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-200">
            <Maximize className="h-10 w-10" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-flame-500 px-2 py-0.5 text-xs font-semibold text-white">{purpose}</span>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="font-heading text-base font-bold text-brand-900">{formatPrice(property.price)}</p>
        <Link to={detailUrl}>
          <h3 className="mt-1 line-clamp-1 text-sm font-medium text-brand-800 hover:text-flame-600">{property.title}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 text-flame-500" /> {location || 'Location unavailable'}
        </p>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" /> {property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {property.bathrooms}</span>}
          {property.land_size_sqm != null && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" /> {property.land_size_sqm} sqm</span>}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
          <span className="truncate text-xs text-muted-foreground">{property.listing_agent_name || 'PQNL Listed'}</span>
          {onSave && (
            <button
              onClick={() => onSave(property)}
              aria-label="Save property"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-500 transition-colors hover:bg-brand-50 hover:text-flame-500"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-flame-500 text-flame-500' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}