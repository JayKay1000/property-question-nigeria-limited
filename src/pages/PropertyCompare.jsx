import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, GitCompare, X, CheckCircle2, MapPin, Bed, Bath, Car, Maximize, ShieldCheck, Calendar, Building, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { formatPrice, formatNumber, buildLocation, getPrimaryImage, AVAILABILITY_CONFIG, PURPOSE_CONFIG, CLASSIFICATION_CONFIG, CONDITION_CONFIG, FURNISHING_CONFIG } from '@/lib/property-utils';
import { Image } from '@/components/ui/image';

export default function PropertyCompare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => base44.entities.Property.get(id).catch(() => null)))
      .then((results) => setProperties(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const removeProperty = (id) => {
    const remaining = ids.filter((pid) => pid !== id);
    if (remaining.length === 0) {
      window.location.href = '/properties';
    } else {
      window.location.href = `/properties/compare?ids=${remaining.join(',')}`;
    }
  };

  const compareRows = [
    { label: 'Price', getValue: (p) => formatPrice(p.price), highlight: true },
    { label: 'Location', getValue: (p) => buildLocation(p) || '—' },
    { label: 'Purpose', getValue: (p) => PURPOSE_CONFIG[p.listing_purpose] || '—' },
    { label: 'Type', getValue: (p) => p.property_type || '—' },
    { label: 'Classification', getValue: (p) => CLASSIFICATION_CONFIG[p.property_classification] || '—' },
    { label: 'Availability', getValue: (p) => AVAILABILITY_CONFIG[p.availability_status]?.label || '—' },
    { label: 'Bedrooms', getValue: (p) => p.bedrooms ?? '—' },
    { label: 'Bathrooms', getValue: (p) => p.bathrooms ?? '—' },
    { label: 'Parking', getValue: (p) => p.parking_spaces ?? '—' },
    { label: 'Land Size', getValue: (p) => p.land_size_sqm ? `${formatNumber(p.land_size_sqm)} sqm` : '—' },
    { label: 'Built Area', getValue: (p) => p.built_up_area_sqm ? `${formatNumber(p.built_up_area_sqm)} sqm` : '—' },
    { label: 'Year Built', getValue: (p) => p.year_built || '—' },
    { label: 'Condition', getValue: (p) => CONDITION_CONFIG[p.property_condition] || '—' },
    { label: 'Furnishing', getValue: (p) => FURNISHING_CONFIG[p.furnishing_status] || '—' },
    { label: 'Reference', getValue: (p) => p.reference_number || '—' },
    { label: 'Agent', getValue: (p) => p.listing_agent_name || 'Company' },
    { label: 'Verified', getValue: (p) => p.verified ? '✓ Yes' : 'No' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <GitCompare className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">No Properties to Compare</h1>
        <p className="mt-2 text-sm text-muted-foreground">Select properties from the listings page to compare them side by side.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Browse Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50 pb-16 pt-20">
      <div className="container-wide section-pad">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-brand-900 sm:text-3xl">
              <GitCompare className="h-6 w-6 text-flame-500" /> Compare Properties
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Side-by-side comparison of {properties.length} properties</p>
          </div>
          <Button asChild variant="outline" className="border-brand-200">
            <Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="w-40 p-4 text-left text-sm font-semibold text-muted-foreground">Property</th>
                {properties.map((p) => (
                  <th key={p.id} className="p-4 text-left align-top">
                    <div className="relative">
                      <button onClick={() => removeProperty(p.id)} aria-label="Remove"
                        className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <Link to={`/properties/${p.id}`} className="block">
                        <div className="mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-brand-50">
                          {getPrimaryImage(p) ? (
                            <Image src={getPrimaryImage(p)} alt={p.title} fittingType="fill" className="h-full w-full" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-brand-200"><Home className="h-8 w-8" /></div>
                          )}
                        </div>
                        <h3 className="line-clamp-2 font-heading text-sm font-bold text-brand-900 hover:text-flame-600">{p.title}</h3>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className={row.highlight ? 'bg-flame-50/50' : i % 2 === 0 ? 'bg-ice-50/50' : ''}>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">{row.label}</td>
                  {properties.map((p) => (
                    <td key={p.id} className={`p-4 text-sm ${row.highlight ? 'font-heading text-lg font-bold text-flame-600' : 'text-brand-900'}`}>
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Amenities row */}
              <tr className="bg-ice-50/50">
                <td className="p-4 text-sm font-semibold text-muted-foreground">Amenities</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.amenities || []).map((a, i) => (
                        <span key={i} className="rounded-full bg-ice-100 px-2 py-0.5 text-xs text-brand-700">{a}</span>
                      ))}
                      {!p.amenities?.length && <span className="text-sm text-muted-foreground">—</span>}
                    </div>
                  </td>
                ))}
              </tr>
              {/* CTA row */}
              <tr>
                <td className="p-4"></td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <Button asChild size="sm" className="w-full bg-flame-500 hover:bg-flame-600">
                      <Link to={`/properties/${p.id}`}>View Details</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}