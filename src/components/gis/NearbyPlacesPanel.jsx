import { useMemo, useState } from 'react';
import {
  Compass, MapPin, Navigation, Loader2, TriangleAlert, Info, BadgeCheck, RefreshCw, Ruler,
} from 'lucide-react';
import {
  School, GraduationCap, Hospital, Plus, Building2, ShoppingBag, Plane, Bed, UtensilsCrossed,
  Shield, Flame, Landmark, Bus, TrainFront, TreePine, Trophy, Camera, Fuel, Milestone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateDistance, LANDMARK_TYPE_CONFIG, NEARBY_CATEGORY_GROUPS } from '@/lib/gis-map-utils';
import { formatDistance } from '@/lib/geo-utils';

const CATEGORY_ICONS = {
  school: School, university: GraduationCap, hospital: Hospital, pharmacy: Plus,
  bank: Building2, atm: Building2, market: ShoppingBag, shopping_mall: ShoppingBag,
  airport: Plane, hotel: Bed, restaurant: UtensilsCrossed, police_station: Shield,
  fire_station: Flame, government_office: Landmark, bus_stop: Bus, rail_station: TrainFront,
  park: TreePine, stadium: Trophy, tourist_attraction: Camera, fuel_station: Fuel,
  place_of_worship: Compass, junction: Milestone, other: MapPin,
};

const RADIUS_CHOICES = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
];

/**
 * Nearby-places intelligence.
 *
 * Two honest sources are merged and always labelled:
 *  - PQNL's own landmark records (available instantly, verified in-house), and
 *  - live places from OpenStreetMap, fetched on request from the secure service.
 * Distances shown here are straight-line. Road distance appears only once a real
 * route has been calculated in the planner.
 */
export default function NearbyPlacesPanel({
  property,
  landmarks = [],
  livePlaces = [],
  liveState = {},
  onLoadLive,
  onFocusPlace,
  onDirections,
  radiusM = 2000,
  onRadiusChange,
}) {
  const [activeGroups, setActiveGroups] = useState([]);

  const hasCoordinates = property?.latitude != null && property?.longitude != null;

  const allowedCategories = useMemo(() => {
    if (!activeGroups.length) return null;
    const set = new Set();
    NEARBY_CATEGORY_GROUPS.filter((g) => activeGroups.includes(g.id)).forEach((g) => g.categories.forEach((c) => set.add(c)));
    return set;
  }, [activeGroups]);

  const combined = useMemo(() => {
    if (!hasCoordinates) return [];
    const official = landmarks
      .filter((l) => l.latitude != null && l.longitude != null)
      .map((l) => ({
        id: `landmark-${l.id}`,
        name: l.landmark_name,
        category: l.landmark_type || 'other',
        latitude: l.latitude,
        longitude: l.longitude,
        address: l.address,
        source: 'PQNL record',
        verified: true,
      }));
    const live = livePlaces.map((p) => ({ ...p, source: 'OpenStreetMap', verified: false }));

    const seen = new Set();
    return [...official, ...live]
      .map((place) => ({ ...place, distanceKm: calculateDistance(property.latitude, property.longitude, place.latitude, place.longitude) }))
      .filter((place) => {
        const key = `${place.name?.toLowerCase()}|${place.latitude.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .filter((place) => !allowedCategories || allowedCategories.has(place.category))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 40);
  }, [landmarks, livePlaces, hasCoordinates, property?.latitude, property?.longitude, allowedCategories]);

  const toggleGroup = (id) => setActiveGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  if (!hasCoordinates) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <Compass className="h-4 w-4 text-flame-500" /> Nearby places
        </h3>
        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>This property has no mapped coordinates yet, so distances to nearby places cannot be calculated.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <Compass className="h-4 w-4 text-flame-500" /> Nearby places
        </h3>
        <span className="rounded-full bg-ice-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">{combined.length}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {RADIUS_CHOICES.map((choice) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => {
              onRadiusChange?.(choice.value);
              onLoadLive?.(choice.value);
            }}
            aria-pressed={radiusM === choice.value}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
              radiusM === choice.value ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-brand-200 text-brand-700 hover:bg-ice-50'
            }`}
          >
            {choice.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onLoadLive?.(radiusM)}
          className="flex items-center gap-1.5 rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-ice-50"
        >
          {liveState.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {liveState.loaded ? 'Refresh live places' : 'Load live places'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {NEARBY_CATEGORY_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => toggleGroup(group.id)}
            aria-pressed={activeGroups.includes(group.id)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              activeGroups.includes(group.id) ? 'bg-brand-900 text-white' : 'bg-ice-100 text-brand-700 hover:bg-ice-200'
            }`}
          >
            {group.label}
          </button>
        ))}
        {activeGroups.length > 0 && (
          <button type="button" onClick={() => setActiveGroups([])} className="text-[11px] font-semibold text-flame-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      {liveState.error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-[11px] leading-relaxed text-amber-800">
          <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{liveState.error} PQNL's own verified landmark records are still shown below.</span>
        </p>
      )}

      {combined.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {liveState.loading
            ? 'Looking for places around this property…'
            : 'No places recorded within this radius. Try a wider radius or load live places.'}
        </p>
      ) : (
        <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {combined.map((place) => {
            const Icon = CATEGORY_ICONS[place.category] || MapPin;
            const config = LANDMARK_TYPE_CONFIG[place.category];
            return (
              <div key={place.id} className="flex items-center gap-2.5 rounded-lg border border-brand-100 bg-ice-50 p-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-flame-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-900">{place.name}</p>
                  <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    {config?.label || place.category?.replace(/_/g, ' ')}
                    {place.verified && <BadgeCheck className="h-3 w-3 text-success" title="PQNL verified record" />}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700" title="Straight-line distance">
                    {formatDistance(place.distanceKm)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onFocusPlace?.(place)}
                    aria-label={`Show ${place.name} on the map`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-brand-600 hover:bg-white"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDirections?.(place)}
                    aria-label={`Get directions to ${place.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-flame-600 hover:bg-white"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 border-t border-brand-100 pt-2 text-[10px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        <span>
          Distances are straight-line, not road distance. Map data © OpenStreetMap contributors. PQNL landmark records are verified by our team;
          live places come from the OpenStreetMap community and may be incomplete.
        </span>
      </p>
    </div>
  );
}