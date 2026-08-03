import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Car, Maximize, Heart, GitCompare, ShieldCheck, Eye, Star, BadgeCheck } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice, buildShortLocation, getPrimaryImage, AVAILABILITY_CONFIG, PURPOSE_CONFIG } from '@/lib/property-utils';

export default function ListingCard({ property, onCompare, isCompared, onSave, isSaved }) {
  const image = getPrimaryImage(property);
  const location = buildShortLocation(property);
  const availability = AVAILABILITY_CONFIG[property.availability_status];
  const purpose = PURPOSE_CONFIG[property.listing_purpose] || 'For Sale';
  const detailUrl = `/properties/${property.id}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-ice-50 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={detailUrl} className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <Image src={image} alt={property.title} fittingType="fill"
            className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-200">
            <Maximize className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>

      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">{purpose}</span>
        {availability && availability.label !== 'Available' && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold shadow-md ${availability.className}`}>{availability.label}</span>
        )}
        {property.is_featured && (
          <span className="flex items-center gap-1 rounded-full bg-brand-900 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
            <Star className="h-3 w-3" /> Featured
          </span>
        )}
        {property.is_exclusive && (
          <span className="flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
            <BadgeCheck className="h-3 w-3" /> Exclusive
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button onClick={() => onSave?.(property)} aria-label="Save property"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-700 backdrop-blur transition-colors hover:bg-white hover:text-flame-500">
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-flame-500 text-flame-500' : ''}`} />
        </button>
        <button onClick={() => onCompare?.(property)} aria-label="Compare property"
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-colors hover:bg-white ${isCompared ? 'text-flame-500' : 'text-brand-700 hover:text-flame-500'}`}>
          <GitCompare className="h-4 w-4" />
        </button>
      </div>

      <Link to={detailUrl} className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-brand-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Eye className="mr-1.5 inline h-3.5 w-3.5" /> Quick View
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-heading font-semibold text-brand-900">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-flame-500" /> {location || 'Location unavailable'}
        </p>
        <p className="mt-2 font-heading text-lg font-bold text-flame-600">{formatPrice(property.price)}</p>
        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms}</span>}
          {property.parking_spaces != null && <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" /> {property.parking_spaces}</span>}
          {property.land_size_sqm != null && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {property.land_size_sqm} sqm</span>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {property.verified ? (
              <><ShieldCheck className="h-3.5 w-3.5 text-success" /> {property.listing_agent_name || 'Verified Agent'}</>
            ) : (property.listing_agent_name || 'Company Listed')}
          </span>
          {property.reference_number && <span className="text-xs text-muted-foreground/70">{property.reference_number}</span>}
        </div>
      </div>
    </div>
  );
}