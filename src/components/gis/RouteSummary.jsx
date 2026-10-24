import { Route, Clock, Ruler, TriangleAlert, Info, CircleCheckBig } from 'lucide-react';
import { formatDistance, formatDuration, travelModeLabel } from '@/lib/geo-utils';

/**
 * Presentational route summary.
 *
 * It only ever displays values the routing service actually returned. When a
 * mode is unsupported or no road route exists, it says so and shows the
 * straight-line distance clearly labelled as a direct distance — never a
 * fabricated travel time.
 */
export default function RouteSummary({ result, selectedIndex = 0, onSelectRoute }) {
  if (!result) return null;

  if (!result.ok) {
    const distanceOnly = result.directDistanceKm != null;
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="flex items-start gap-2 text-sm font-semibold text-amber-900">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {result.code === 'UNSUPPORTED_MODE'
              ? `No ${travelModeLabel(result.mode).toLowerCase()} road route available`
              : result.code === 'NO_ROUTE'
                ? 'No drivable route found'
                : 'Route unavailable'}
          </span>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-amber-800">{result.message}</p>

        {distanceOnly && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-900">
            <Ruler className="h-3.5 w-3.5 shrink-0" />
            Direct distance: <strong>{formatDistance(result.directDistanceKm)}</strong> in a straight line — not a road route.
          </p>
        )}
        {distanceOnly && (
          <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
            Open this journey in Google Maps below for turn-by-turn directions in that travel mode.
          </p>
        )}
      </div>
    );
  }

  const routes = result.routes || [];
  const active = routes[selectedIndex] || routes[0];
  if (!active) return null;

  return (
    <div className="rounded-xl border border-brand-100 bg-ice-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-brand-700">
          <Route className="h-3.5 w-3.5 text-flame-500" /> Route summary
        </h4>
        <span className="rounded-full bg-brand-900 px-2 py-0.5 text-[10px] font-semibold text-white">{travelModeLabel(result.mode)}</span>
      </div>

      <div className="mt-2.5 flex items-end gap-4">
        <div>
          <p className="font-heading text-2xl font-bold leading-none text-brand-900">{formatDistance(active.distanceKm)}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Ruler className="h-3 w-3" /> Road distance</p>
        </div>
        <div>
          <p className="font-heading text-2xl font-bold leading-none text-flame-600">{formatDuration(active.durationMinutes)}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> Estimated driving time</p>
        </div>
      </div>

      {!result.trafficAware && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-white p-2 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Estimate based on the mapped road network. Live traffic conditions are not included, so the actual journey may take longer.</span>
        </p>
      )}

      {result.directDistanceKm != null && active.distanceKm > result.directDistanceKm * 1.15 && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Straight-line distance is {formatDistance(result.directDistanceKm)} — the road route is longer.
        </p>
      )}

      {routes.length > 1 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Alternative routes</p>
          <div className="space-y-1.5">
            {routes.map((route, index) => {
              const isActive = index === (routes[selectedIndex] ? selectedIndex : 0);
              return (
                <button
                  key={route.index ?? index}
                  type="button"
                  onClick={() => onSelectRoute?.(index)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-left transition ${
                    isActive ? 'border-flame-500 bg-white' : 'border-brand-100 bg-white/70 hover:border-brand-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-brand-900">
                    {isActive && <CircleCheckBig className="h-3.5 w-3.5 text-flame-500" />}
                    {route.label || `Route ${index + 1}`}
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground">
                    <span>{formatDistance(route.distanceKm)}</span>
                    <span className="font-semibold text-brand-900">{formatDuration(route.durationMinutes)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {result.disclaimer && (
        <p className="mt-3 border-t border-brand-100 pt-2 text-[10px] leading-relaxed text-muted-foreground">
          {result.disclaimer}
          {result.providerLabel ? ` Routing: ${result.providerLabel}.` : ''}
          {result.attribution ? ` ${result.attribution}.` : ''}
        </p>
      )}
    </div>
  );
}