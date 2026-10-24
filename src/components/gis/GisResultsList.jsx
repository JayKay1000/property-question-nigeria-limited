import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, TriangleAlert, Navigation, BadgeCheck, MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { formatPrice, buildShortLocation } from '@/lib/gis-map-utils';

function ResultRow({ property, locationRecord, active, onSelect, onPlanRoute }) {
  const thumb = property.featured_image_url || property.image_urls?.[0];
  return (
    <div
      className={`flex gap-2.5 rounded-xl border p-3 transition ${
        active ? 'border-flame-500 bg-flame-50' : 'border-brand-100 bg-white hover:border-brand-200 hover:shadow-card'
      }`}
    >
      <button type="button" onClick={() => onSelect(property)} className="flex min-w-0 flex-1 gap-2.5 text-left">
        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
          {thumb && <Image src={thumb} alt={property.title} fittingType="fill" className="h-full w-full" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-900">{property.title}</p>
          <p className="truncate text-xs text-muted-foreground">{buildShortLocation(property)}</p>
          <div className="mt-0.5 flex items-center gap-2">
            {property.price != null && <p className="text-sm font-bold text-flame-600">{formatPrice(property.price)}</p>}
            {locationRecord?.location_verification_status === 'verified' && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-success">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onPlanRoute(property)}
        aria-label={`Plan a route to ${property.title}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg text-flame-600 hover:bg-flame-50"
      >
        <Navigation className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Results list under the map.
 *
 * Properties without coordinates stay in the results — they are real listings —
 * but are grouped separately behind a clear notice, because they cannot be
 * placed on the map. Nothing is silently dropped from the visitor's view.
 */
export default function GisResultsList({
  properties = [],
  unmapped = [],
  locationRecords = {},
  selectedProperty,
  onSelect,
  onPlanRoute,
  maxItems = 12,
}) {
  const visible = properties.slice(0, maxItems);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-bold text-brand-900">
          {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} on the map
        </h3>
        {properties.length > maxItems && (
          <Button asChild variant="outline" size="sm" className="border-brand-200">
            <Link to="/properties">View all properties <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        )}
      </div>

      {properties.length === 0 ? (
        <p className="rounded-xl border border-brand-100 bg-white p-4 text-sm text-muted-foreground">
          No mapped properties match your filters. Clear a filter or widen the search area.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((property) => (
            <ResultRow
              key={property.id}
              property={property}
              locationRecord={locationRecords[property.id]}
              active={selectedProperty?.id === property.id}
              onSelect={onSelect}
              onPlanRoute={onPlanRoute}
            />
          ))}
        </div>
      )}

      {unmapped.length > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <TriangleAlert className="h-4 w-4" />
            {unmapped.length} propert{unmapped.length === 1 ? 'y' : 'ies'} without a mapped location
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            These listings are available and fully searchable, but they have no verified coordinates yet, so they cannot be shown on the map.
            Their details and agent contacts are unaffected.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {unmapped.slice(0, 6).map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white p-3 transition hover:border-amber-300"
              >
                <MapPinOff className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-brand-900">{property.title}</span>
                  <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {buildShortLocation(property)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {unmapped.length > 6 && (
            <p className="mt-2 text-[11px] text-amber-800">…and {unmapped.length - 6} more.</p>
          )}
        </div>
      )}
    </div>
  );
}