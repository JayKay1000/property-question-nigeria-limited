import { Navigation, ArrowUpDown, Share2, Trash2, RefreshCw, Loader2, Route, Info, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationAutocomplete from '@/components/gis/LocationAutocomplete';
import TravelModeSelector from '@/components/gis/TravelModeSelector';
import RouteSummary from '@/components/gis/RouteSummary';
import { formatDistance, formatDuration, travelModeLabel } from '@/lib/geo-utils';

/**
 * Route-planning interface.
 *
 * This is a PREVIEW: it shows a real route computed by the routing service.
 * Live turn-by-turn guidance is never claimed here — START NAVIGATION hands the
 * destination and mode to the device's navigation app, which provides it.
 */
export default function RoutePlanner({
  origin,
  onOriginChange,
  destination,
  onDestinationChange,
  mode,
  onModeChange,
  supportedModes = ['drive'],
  result,
  loading = false,
  activeIndex = 0,
  onActiveIndexChange,
  onRecalculate,
  onClear,
  onReverse,
  onStartNavigation,
  onOpenInMaps,
  onShare,
  sharing = false,
  pickingMode = null,
  onPickOrigin,
  onPickDestination,
  onUseCurrentLocation,
  locating = false,
  near,
  onClose,
  title = 'Plan your route',
}) {
  const modeSupported = supportedModes.includes(mode);
  const activeRoute = result?.ok ? result.routes?.[activeIndex] || result.routes?.[0] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900">
          <Route className="h-4 w-4 text-flame-500" /> {title}
        </h3>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close route planner" className="rounded p-1 text-muted-foreground hover:text-brand-900">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Starting from</label>
          <LocationAutocomplete
            value={origin}
            onChange={onOriginChange}
            near={near}
            inputId="route-origin"
            ariaLabel="Starting location"
            placeholder="Search a starting point, address or landmark…"
            onUseCurrentLocation={onUseCurrentLocation}
            onPickOnMap={onPickOrigin}
            locating={locating}
          />
          {pickingMode === 'origin' && (
            <p className="mt-1 rounded-lg bg-flame-50 px-2 py-1.5 text-[11px] font-medium text-flame-700">
              Tap anywhere on the map to set the starting point.
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onReverse}
            disabled={!origin || !destination}
            className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition hover:bg-ice-50 disabled:opacity-40"
          >
            <ArrowUpDown className="h-3 w-3" /> Reverse
          </button>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Destination</label>
          <LocationAutocomplete
            value={destination}
            onChange={onDestinationChange}
            near={near}
            inputId="route-destination"
            ariaLabel="Destination"
            placeholder="Search a destination, or pick a property on the map…"
            onPickOnMap={onPickDestination}
          />
          {pickingMode === 'destination' && (
            <p className="mt-1 rounded-lg bg-flame-50 px-2 py-1.5 text-[11px] font-medium text-flame-700">
              Tap a property marker on the map to set the destination.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Travel mode</label>
          <TravelModeSelector value={mode} onChange={onModeChange} supportedModes={supportedModes} />
          {!modeSupported && (
            <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-[11px] leading-relaxed text-amber-800">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                Our routing service only computes driving routes on mapped roads. Switch to Driving for a road route, or use the Google Maps
                button below for {travelModeLabel(mode).toLowerCase()} directions.
              </span>
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-ice-50 p-3 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-flame-500" /> Calculating route…
        </div>
      )}

      {!loading && result && <RouteSummary result={result} selectedIndex={activeIndex} onSelectRoute={onActiveIndexChange} />}

      {!loading && !result && (!origin || !destination) && (
        <p className="rounded-xl border border-brand-100 bg-ice-50 p-3 text-xs leading-relaxed text-muted-foreground">
          Choose a starting point and a destination property to see the distance, estimated travel time and route line.
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <Button onClick={onStartNavigation} disabled={!activeRoute} className="flex-1 bg-flame-500 hover:bg-flame-600">
          <Navigation className="mr-1.5 h-4 w-4" /> START NAVIGATION
        </Button>
        <Button onClick={onOpenInMaps} variant="outline" disabled={!destination} className="border-brand-200">
          <MapPin className="mr-1.5 h-4 w-4" /> Open in Google Maps
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button onClick={onRecalculate} variant="outline" size="sm" disabled={!origin || !destination} className="border-brand-200">
          {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />} Recalculate
        </Button>
        <Button onClick={onShare} variant="outline" size="sm" disabled={!destination} className="border-brand-200">
          {sharing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />} Share route
        </Button>
        <Button onClick={onClear} variant="outline" size="sm" disabled={!origin && !destination} className="border-brand-200">
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear
        </Button>
      </div>

      {activeRoute && (
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          {formatDistance(activeRoute.distanceKm)} · {formatDuration(activeRoute.durationMinutes)} estimated · route preview only. Voice-guided
          navigation opens in your device's maps app via START NAVIGATION.
        </p>
      )}
    </div>
  );
}