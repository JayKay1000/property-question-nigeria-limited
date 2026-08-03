import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Navigation, Eye, Building2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice, formatNumber, buildShortLocation } from '@/lib/gis-map-utils';
import { buildGoogleMapsDirectionsLink, getMarkerConfig } from '@/lib/gis-map-utils';

export default function PropertyMapPopup({ property }) {
  const cfg = getMarkerConfig(property);
  const thumb = property.featured_image_url || property.image_urls?.[0];

  return (
    <div className="overflow-hidden" style={{ margin: '-8px -12px' }}>
      {thumb && (
        <div className="aspect-video w-full overflow-hidden bg-brand-100">
          <Image src={thumb} alt={property.title} fittingType="fill" className="h-full w-full" />
        </div>
      )}
      <div className="p-3">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ background: cfg.color }}>{cfg.label}</span>
          {property.is_featured && <span className="rounded-full bg-flame-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Featured</span>}
        </div>
        <h4 className="font-heading text-sm font-bold leading-tight text-brand-900 line-clamp-1">{property.title}</h4>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> <span className="line-clamp-1">{buildShortLocation(property) || 'Nigeria'}</span>
        </div>

        {property.price != null && (
          <p className="mt-2 font-heading text-lg font-bold text-flame-600">{formatPrice(property.price)}</p>
        )}

        <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
          {property.land_size_sqm != null && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" />{formatNumber(property.land_size_sqm)}sqm</span>}
        </div>

        <div className="mt-3 flex gap-1.5">
          <Link to={`/properties/${property.id}`} className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-900 px-2 py-1.5 text-xs font-semibold text-white hover:bg-brand-800">
            <Eye className="h-3 w-3" /> View
          </Link>
          <a href={buildGoogleMapsDirectionsLink(property)} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-flame-500 px-2 py-1.5 text-xs font-semibold text-white hover:bg-flame-600">
            <Navigation className="h-3 w-3" /> Navigate
          </a>
        </div>
      </div>
    </div>
  );
}