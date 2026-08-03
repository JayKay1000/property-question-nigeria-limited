import { Bed, Bath, Car, Maximize, Building2, MapPin, Tag, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice, formatNumber, buildShortLocation } from '@/lib/tour-utils';
import { AVAILABILITY_CONFIG, PURPOSE_CONFIG } from '@/lib/property-utils';

export default function TourInfoPanel({ property, tour, onBookInspection }) {
  if (!property) return null;
  const availability = AVAILABILITY_CONFIG[property.availability_status] || AVAILABILITY_CONFIG.available;
  const purpose = PURPOSE_CONFIG[property.listing_purpose] || '';

  const specs = [
    { icon: Bed, label: 'Bedrooms', value: property.bedrooms ?? '—' },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms ?? '—' },
    { icon: Car, label: 'Parking', value: property.parking_spaces ?? '—' },
    { icon: Maximize, label: 'Land Size', value: property.land_size_sqm ? `${formatNumber(property.land_size_sqm)} sqm` : '—' },
  ];

  return (
    <div className="rounded-2xl border border-brand-100 bg-ice-50 p-5">
      {/* Price */}
      <div className="mb-4">
        {property.price != null ? (
          <>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{purpose || 'Price'}</p>
            <p className="font-heading text-2xl font-bold text-flame-600">{formatPrice(property.price)}</p>
          </>
        ) : <p className="font-heading text-lg font-semibold text-muted-foreground">Price on request</p>}
        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${availability.className}`}>{availability.label}</span>
      </div>

      {/* Location */}
      <div className="mb-4 flex items-start gap-2 text-sm text-brand-900">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{buildShortLocation(property) || 'Nigeria'}</span>
      </div>

      {/* Specs grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {specs.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-white p-2.5">
            <s.icon className="h-4 w-4 text-flame-500" />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold text-brand-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Property info */}
      <div className="space-y-2 border-t border-border pt-4 text-sm">
        {property.reference_number && <InfoRow icon={Tag} label="Reference" value={property.reference_number} />}
        {property.property_type && <InfoRow icon={Building2} label="Type" value={property.property_type} />}
        {property.estate && <InfoRow icon={Building2} label="Estate" value={property.estate} />}
        {tour?.estimated_duration_minutes != null && <InfoRow icon={Clock} label="Tour Duration" value={`${tour.estimated_duration_minutes} mins`} />}
        {tour?.guide_name && <InfoRow icon={CheckCircle2} label="Tour Guide" value={tour.guide_name} />}
      </div>

      {/* Amenities */}
      {property.amenities?.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 8).map((a, i) => (
              <span key={i} className="rounded-full bg-ice-100 px-2 py-0.5 text-xs text-brand-700">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-semibold text-brand-900">{value}</span>
    </div>
  );
}