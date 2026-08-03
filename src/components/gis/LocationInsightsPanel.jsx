import { TrendingUp, MapPin, Building2, Star, Activity } from 'lucide-react';
import { formatNumber, formatPrice } from '@/lib/gis-map-utils';

export default function LocationInsightsPanel({ properties, selectedState, totalStates }) {
  const total = properties.length;
  const avgPrice = total > 0 ? properties.reduce((s, p) => s + (p.price || 0), 0) / total : 0;
  const available = properties.filter((p) => p.availability_status === 'available').length;
  const featured = properties.filter((p) => p.is_featured).length;

  // Most common property type
  const typeCounts = {};
  properties.forEach((p) => { if (p.property_type) typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1; });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  // Price stats
  const prices = properties.map((p) => p.price).filter((p) => p != null).sort((a, b) => a - b);
  const minPrice = prices[0] || 0;
  const maxPrice = prices[prices.length - 1] || 0;

  const stats = [
    { icon: Building2, label: 'Properties Mapped', value: formatNumber(total), color: 'text-brand-700' },
    { icon: MapPin, label: 'Available Now', value: formatNumber(available), color: 'text-success' },
    { icon: TrendingUp, label: 'Average Price', value: total > 0 ? formatPrice(avgPrice) : '—', color: 'text-flame-600' },
    { icon: Star, label: 'Featured Listings', value: formatNumber(featured), color: 'text-flame-500' },
  ];

  return (
    <div className="rounded-2xl border border-brand-100 bg-ice-50 p-5">
      <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
        <Activity className="h-4 w-4 text-flame-500" /> Location Insights
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-brand-100 bg-white p-3">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <p className="mt-1.5 font-heading text-lg font-bold text-brand-900">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {minPrice > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price Range</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-900">{formatPrice(minPrice)}</span>
                <span className="text-muted-foreground">—</span>
                <span className="text-brand-900">{formatPrice(maxPrice)}</span>
              </div>
            </div>
          )}
          {topType && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Most Common Type</p>
              <p className="text-sm font-semibold capitalize text-brand-900">{topType[0]} ({topType[1]})</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}