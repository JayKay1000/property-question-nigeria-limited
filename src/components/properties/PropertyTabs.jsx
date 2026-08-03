import { useState } from 'react';
import { FileText, CheckCircle2, MapPin, History, Home, Bath, Car, Maximize, Calendar, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice, formatNumber, buildLocation, CLASSIFICATION_CONFIG, CONDITION_CONFIG, FURNISHING_CONFIG } from '@/lib/property-utils';

function SpecRow({ icon: Icon, label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-brand-900">{value}</span>
    </div>
  );
}

export default function PropertyTabs({ property }) {
  const highlights = property.highlights || [];
  const amenities = property.amenities || [];
  const fullLocation = buildLocation(property);
  const hasMap = property.latitude && property.longitude;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-6 flex w-full justify-start gap-1 overflow-x-auto bg-ice-100 p-1">
        <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
        <TabsTrigger value="amenities" className="rounded-lg">Amenities</TabsTrigger>
        <TabsTrigger value="location" className="rounded-lg">Location</TabsTrigger>
        <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-6">
        {property.description && (
          <div>
            <h3 className="mb-3 font-heading text-lg font-bold text-brand-900">About This Property</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{property.description}</p>
          </div>
        )}
        {highlights.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-lg font-bold text-brand-900">Property Highlights</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-ice-50 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm text-brand-800">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="mb-3 font-heading text-lg font-bold text-brand-900">Key Specifications</h3>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <SpecRow icon={Home} label="Bedrooms" value={property.bedrooms} />
            <SpecRow icon={Bath} label="Bathrooms" value={property.bathrooms} />
            <SpecRow icon={Car} label="Parking Spaces" value={property.parking_spaces} />
            <SpecRow icon={Maximize} label="Land Size" value={property.land_size_sqm ? `${formatNumber(property.land_size_sqm)} sqm` : null} />
            <SpecRow icon={Building} label="Built Area" value={property.built_up_area_sqm ? `${formatNumber(property.built_up_area_sqm)} sqm` : null} />
            <SpecRow icon={Calendar} label="Year Built" value={property.year_built} />
          </div>
        </div>
      </TabsContent>

      {/* Amenities */}
      <TabsContent value="amenities">
        {amenities.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-ice-50 p-3">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-brand-800">{a}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No amenities listed for this property.</p>
        )}
      </TabsContent>

      {/* Location */}
      <TabsContent value="location" className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-brand-900">
            <MapPin className="h-5 w-5 text-flame-500" /> Location
          </h3>
          <p className="text-sm text-muted-foreground">{fullLocation || 'Location details not available'}</p>
          {property.address_line && <p className="mt-1 text-sm text-muted-foreground">{property.address_line}</p>}
        </div>
        {hasMap && (
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <iframe
              title="Property Location"
              src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`}
              className="h-[400px] w-full"
              loading="lazy"
            />
          </div>
        )}
      </TabsContent>

      {/* Details */}
      <TabsContent value="details" className="space-y-4">
        <div className="grid gap-x-8 sm:grid-cols-2">
          <SpecRow icon={FileText} label="Reference" value={property.reference_number} />
          <SpecRow icon={Building} label="Property Type" value={property.property_type} />
          <SpecRow icon={FileText} label="Classification" value={CLASSIFICATION_CONFIG[property.property_classification]} />
          <SpecRow icon={Building} label="Condition" value={CONDITION_CONFIG[property.property_condition]} />
          <SpecRow icon={Home} label="Furnishing" value={FURNISHING_CONFIG[property.furnishing_status]} />
          <SpecRow icon={Calendar} label="Development Stage" value={property.development_stage?.replace(/_/g, ' ')} />
          <SpecRow icon={Building} label="Estate" value={property.estate} />
          <SpecRow icon={MapPin} label="District" value={property.district} />
        </div>
        {property.tags && property.tags.length > 0 && (
          <div>
            <h3 className="mb-2 font-heading text-sm font-bold text-brand-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {property.tags.map((t, i) => (
                <span key={i} className="rounded-full bg-ice-100 px-3 py-1 text-xs font-medium text-brand-700">{t}</span>
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}