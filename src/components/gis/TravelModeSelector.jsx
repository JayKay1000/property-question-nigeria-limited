import { CarFront, Footprints, Bike } from 'lucide-react';
import { TRAVEL_MODES } from '@/lib/geo-utils';

const MODE_ICONS = { drive: CarFront, walk: Footprints, cycle: Bike, motorcycle: Bike };

/**
 * Travel-mode picker.
 *
 * Every mode stays selectable, but modes the routing provider does not serve
 * are marked so the planner can say so plainly instead of returning a car route
 * dressed up as a walking route.
 */
export default function TravelModeSelector({ value, onChange, supportedModes = ['drive'], className = '' }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`} role="group" aria-label="Travel mode">
      {TRAVEL_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode.id] || CarFront;
        const supported = supportedModes.includes(mode.id);
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange?.(mode.id)}
            aria-pressed={active}
            title={supported ? `${mode.label} road route` : `${mode.label} road routes are not served by our routing provider — you can still open this mode in Google Maps`}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              active
                ? 'border-flame-500 bg-flame-500 text-white'
                : 'border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-ice-50'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {mode.label}
            {!supported && (
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white/80' : 'bg-amber-500'}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}