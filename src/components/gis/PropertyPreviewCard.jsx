import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Navigation, Eye, X, TriangleAlert, BadgeCheck, Milestone } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice, formatNumber, buildShortLocation, getMarkerConfig } from '@/lib/gis-map-utils';
import { formatCoordinates, VERIFICATION_DISPLAY } from '@/lib/geo-utils';

/** Rich preview for the marker the visitor selected on the map. */
export default function PropertyPreviewCard({ property, locationRecord, onClose, onPlanRoute, compact = false }) {
  if (!property) return null;

  const config = getMarkerConfig(property);
  const thumb = property.featured_image_url || property.image_urls?.[0];
  const verification = VERIFICATION_DISPLAY[locationRecord?.location_verification_status || 'unverified'];
  const accessPoint = locationRecord?.access_point_latitude != null && locationRecord?.access_point_longitude != null;

  return (
    <div className="overflow-hidden rounded-xl border border-brand-200 bg-white shadow-premium-lg">
      {!compact && (
        <div className="relative aspect-video w-full overflow-hidden bg-brand-100">
          {thumb && <Image src={thumb} alt={property.title} fittingType="fill" className="h-full w-full" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property preview"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-brand-700 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: config.color }}>
            {config.label}
          </span>
        </div>
      )}

      <div className="p-3">
        {compact && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property preview"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-brand-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <h4 className="font-heading text-sm font-bold leading-tight text-brand-900 line-clamp-2">{property.title}</h4>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" /> <span className="line-clamp-1">{buildShortLocation(property) || 'Nigeria'}</span>
        </p>

        {property.price != null && <p className="mt-1.5 font-heading text-lg font-bold text-flame-600">{formatPrice(property.price)}</p>}

        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
          {property.land_size_sqm != null && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" />{formatNumber(property.land_size_sqm)}sqm</span>}
        </div>

        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          {locationRecord?.location_verification_status === 'verified' ? (
            <BadgeCheck className="h-3 w-3 text-success" />
          ) : (
            <TriangleAlert className="h-3 w-3 text-amber-500" />
          )}
          {verification.label}
        </p>

        {accessPoint && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Milestone className="h-3 w-3 text-success" /> Separate road access point recorded
          </p>
        )}

        <p className="mt-1 text-[10px] text-muted-foreground">{formatCoordinates(property.latitude, property.longitude)}</p>

        <div className="mt-3 flex gap-1.5">
          <Link
            to={`/properties/${property.id}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-900 px-2 py-2 text-xs font-semibold text-white hover:bg-brand-800"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </Link>
          <button
            type="button"
            onClick={() => onPlanRoute?.(property)}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-flame-500 px-2 py-2 text-xs font-semibold text-white hover:bg-flame-600"
          >
            <Navigation className="h-3.5 w-3.5" /> Directions
          </button>
        </div>
      </div>
    </div>
  );
}