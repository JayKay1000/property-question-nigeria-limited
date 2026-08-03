import { Compass, GraduationCap, Plus, Building2, ShoppingBag, Bus, Plane, Bed, UtensilsCrossed, Shield, Waves, TreePine, MapPin } from 'lucide-react';
import { calculateDistance } from '@/lib/gis-map-utils';

const ICON_MAP = {
  school: GraduationCap, university: GraduationCap, hospital: Plus,
  bank: Building2, shopping_mall: ShoppingBag, market: ShoppingBag,
  airport: Plane, hotel: Bed, restaurant: UtensilsCrossed,
  church: Compass, mosque: Compass, police_station: Shield,
  bus_stop: Bus, rail_station: Bus, beach: Waves, park: TreePine,
  other: MapPin,
};

export default function NearbyLandmarks({ landmarks = [], property }) {
  if (!property?.latitude || !property?.longitude) return null;

  const withDistance = landmarks
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      ...l,
      distance: calculateDistance(property.latitude, property.longitude, l.latitude, l.longitude),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 12);

  if (withDistance.length === 0) return null;

  return (
    <div className="rounded-2xl border border-brand-100 bg-ice-50 p-5">
      <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
        <Compass className="h-4 w-4 text-flame-500" /> Nearby Landmarks
      </h3>
      <div className="space-y-2">
        {withDistance.map((lm) => {
          const Icon = ICON_MAP[lm.landmark_type] || MapPin;
          return (
            <div key={lm.id} className="flex items-center gap-2.5 rounded-lg border border-brand-100 bg-white p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-flame-50 text-flame-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-900">{lm.landmark_name}</p>
                <p className="text-xs capitalize text-muted-foreground">{lm.landmark_type?.replace(/_/g, ' ')}</p>
              </div>
              <span className="shrink-0 rounded-full bg-ice-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {lm.distance < 1 ? `${(lm.distance * 1000).toFixed(0)}m` : `${lm.distance.toFixed(1)}km`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}