import { Locate, Plus, Minus, Maximize2, Minimize2, Map as MapIcon, Satellite, Mountain, Layers, Pentagon, Store, Loader2 } from 'lucide-react';

/**
 * Floating map toolbar. Every control is a real button with an accessible label
 * and a touch-sized target, and it is rendered above the map panes so nothing
 * overlaps the property preview card or the planner panel.
 */
export default function MapControls({
  api,
  locating = false,
  onLocate,
  hasResults = false,
  onFitAll,
  onResetView,
  fullscreen = false,
  onToggleFullscreen,
}) {
  const buttonClass = 'flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-brand-700 shadow-card backdrop-blur-md transition hover:bg-white hover:text-flame-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500 disabled:opacity-40';

  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1 rounded-xl bg-white/70 p-1 shadow-card backdrop-blur-md" role="group" aria-label="Map controls">
      <button type="button" onClick={onLocate} disabled={locating} className={buttonClass} aria-label="Show my current location" title="Show my current location">
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
      </button>
      <button type="button" onClick={() => api?.current?.zoomIn()} className={buttonClass} aria-label="Zoom in" title="Zoom in">
        <Plus className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => api?.current?.zoomOut()} className={buttonClass} aria-label="Zoom out" title="Zoom out">
        <Minus className="h-4 w-4" />
      </button>
      <button type="button" onClick={onFitAll} disabled={!hasResults} className={buttonClass} aria-label="Fit all results on screen" title="Fit all results on screen">
        <Layers className="h-4 w-4" />
      </button>
      <button type="button" onClick={onResetView} className={buttonClass} aria-label="Reset to Nigeria overview" title="Reset view">
        <MapIcon className="h-4 w-4" />
      </button>
      <button type="button" onClick={onToggleFullscreen} className={buttonClass} aria-label={fullscreen ? 'Exit full screen map' : 'View map full screen'} title={fullscreen ? 'Exit full screen' : 'Full screen map'}>
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

const BASE_LAYERS = [
  { id: 'street', label: 'Street', Icon: MapIcon },
  { id: 'satellite', label: 'Satellite', Icon: Satellite },
  { id: 'terrain', label: 'Terrain', Icon: Mountain },
];

/** Base-layer switcher plus the optional data overlays (boundary, nearby places). */
export function LayerSwitcher({
  mapType,
  onMapTypeChange,
  showBoundary,
  onToggleBoundary,
  hasBoundary,
  showNearby,
  onToggleNearby,
  hasNearby,
}) {
  return (
    <div className="pointer-events-auto flex flex-col gap-1.5">
      <div className="flex gap-1 rounded-xl bg-white/90 p-1 shadow-card backdrop-blur-md" role="group" aria-label="Map layer">
        {BASE_LAYERS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onMapTypeChange?.(id)}
            aria-pressed={mapType === id}
            title={`${label} map`}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              mapType === id ? 'bg-flame-500 text-white' : 'text-brand-700 hover:bg-ice-100'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {hasBoundary && (
        <button
          type="button"
          onClick={onToggleBoundary}
          aria-pressed={showBoundary}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-card backdrop-blur-md transition ${
            showBoundary ? 'bg-brand-900 text-white' : 'bg-white/90 text-brand-700 hover:bg-white'
          }`}
        >
          <Pentagon className="h-3.5 w-3.5" /> Boundary
        </button>
      )}

      {hasNearby && (
        <button
          type="button"
          onClick={onToggleNearby}
          aria-pressed={showNearby}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-card backdrop-blur-md transition ${
            showNearby ? 'bg-brand-900 text-white' : 'bg-white/90 text-brand-700 hover:bg-white'
          }`}
        >
          <Store className="h-3.5 w-3.5" /> Nearby
        </button>
      )}
    </div>
  );
}