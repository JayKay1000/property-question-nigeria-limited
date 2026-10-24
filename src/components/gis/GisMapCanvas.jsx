import { Loader2, X, Building2, Share2, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { hasCoordinates } from '@/lib/geo-utils';
import MapView from '@/components/gis/MapView';
import MapControls, { LayerSwitcher } from '@/components/gis/MapControls';
import GisResultsList from '@/components/gis/GisResultsList';
import PropertyPreviewCard from '@/components/gis/PropertyPreviewCard';
import RoutePlanner from '@/components/gis/RoutePlanner';

/**
 * The interactive map canvas and every control layered over it.
 *
 * Kept as its own component so the page it belongs to stays about data and
 * state, while this file stays about the map surface: base layers, clustering,
 * route lines, boundaries, the toolbar, the results overlay, the route planner
 * and the property preview card.
 */
export default function GisMapCanvas({ state, handlers, apiRef }) {
  const {
    mappedResults, unmappedResults, landmarks, locationRecords,
    selectedProperty, selectedLocation, selectedBoundary, selectedAccessPoint,
    mapType, showBoundary, showNearby, radiusCenter, radiusKm, userLocation,
    fitToken, resizeTrigger, pickingMode, plannerOpen, fullscreen, showList,
    loading, loadError, nearby, planner, sharing,
  } = state;

  const {
    onSelectProperty, onMapPick, onLocate, onFitAll, onResetView, onToggleFullscreen,
    onToggleList, onSetMapType, onToggleBoundary, onToggleNearby, onPlanRoute,
    onClosePreview, onShareProperty, onClosePlanner, onPickOrigin, onPickDestination,
    onUseCurrentLocation, onStartNavigation, onOpenInMaps, onShareRoute,
    setOrigin, setDestination, setMode, onActiveIndexChange, onRecalculate, onClearRoute, onReverse,
  } = handlers;

  const routeForMap = planner.result ? { ...planner.result, activeIndex: planner.activeIndex } : null;
  const near = selectedProperty && hasCoordinates(selectedProperty)
    ? { lat: selectedProperty.latitude, lng: selectedProperty.longitude }
    : undefined;

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[1500] bg-brand-950'
          : 'relative h-[560px] overflow-hidden rounded-2xl border border-brand-200 shadow-card lg:h-[680px]'
      }
    >
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-ice-50">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-flame-500" />
            <p className="mt-3 text-sm text-muted-foreground">Loading map…</p>
          </div>
        </div>
      ) : loadError ? (
        <div className="flex h-full w-full items-center justify-center bg-ice-50 p-6 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">{loadError}</p>
        </div>
      ) : (
        <MapView
          properties={mappedResults}
          landmarks={landmarks}
          selectedProperty={selectedProperty}
          onSelectProperty={onSelectProperty}
          mapType={mapType}
          radiusCenter={radiusCenter}
          radiusKm={radiusKm}
          route={routeForMap}
          origin={planner.origin}
          destination={planner.destination}
          userLocation={userLocation}
          accessPoint={selectedAccessPoint}
          boundary={selectedBoundary}
          nearbyPlaces={nearby.places}
          showNearby={showNearby}
          showBoundary={showBoundary}
          pickingMode={pickingMode}
          onMapPick={onMapPick}
          apiRef={apiRef}
          fitToken={fitToken}
          resizeTrigger={resizeTrigger}
        />
      )}

      <button
        type="button"
        onClick={onToggleList}
        className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-card backdrop-blur-md hover:bg-white lg:hidden"
      >
        <Building2 className="h-3.5 w-3.5" /> {showList ? 'Map' : 'List'}
      </button>

      <div className="pointer-events-none absolute left-3 top-16 z-[1000] lg:top-3">
        <LayerSwitcher
          mapType={mapType}
          onMapTypeChange={onSetMapType}
          hasBoundary={selectedBoundary.length >= 3}
          showBoundary={showBoundary}
          onToggleBoundary={onToggleBoundary}
          hasNearby={nearby.places.length > 0}
          showNearby={showNearby}
          onToggleNearby={onToggleNearby}
        />
      </div>

      <MapControls
        api={apiRef}
        locating={state.locating}
        onLocate={onLocate}
        hasResults={mappedResults.length > 0}
        onFitAll={onFitAll}
        onResetView={onResetView}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      {showList && !loading && (
        <div className="absolute inset-0 z-[999] overflow-y-auto bg-ice-50 p-3 lg:hidden">
          <GisResultsList
            properties={mappedResults}
            unmapped={unmappedResults}
            locationRecords={locationRecords}
            selectedProperty={selectedProperty}
            onSelect={onSelectProperty}
            onPlanRoute={onPlanRoute}
            maxItems={40}
          />
        </div>
      )}

      {plannerOpen && (
        <div className="absolute inset-x-0 bottom-0 z-[1300] max-h-[78vh] overflow-y-auto rounded-t-2xl border border-brand-200 bg-white p-4 shadow-premium-lg sm:inset-x-auto sm:bottom-3 sm:left-3 sm:top-3 sm:max-h-none sm:w-[360px] sm:rounded-2xl">
          <RoutePlanner
            origin={planner.origin}
            onOriginChange={setOrigin}
            destination={planner.destination}
            onDestinationChange={setDestination}
            mode={planner.mode}
            onModeChange={setMode}
            supportedModes={planner.supportedModes}
            result={planner.result}
            loading={planner.loading}
            activeIndex={planner.activeIndex}
            onActiveIndexChange={onActiveIndexChange}
            onRecalculate={onRecalculate}
            onClear={onClearRoute}
            onReverse={onReverse}
            onStartNavigation={onStartNavigation}
            onOpenInMaps={onOpenInMaps}
            onShare={onShareRoute}
            sharing={sharing}
            pickingMode={pickingMode}
            onPickOrigin={onPickOrigin}
            onPickDestination={onPickDestination}
            onUseCurrentLocation={onUseCurrentLocation}
            locating={state.locating}
            near={near}
            onClose={onClosePlanner}
          />
        </div>
      )}

      {selectedProperty && !showList && (
        <div className="absolute bottom-3 left-3 right-3 z-[1150] sm:right-auto sm:w-[340px]">
          <PropertyPreviewCard
            property={selectedProperty}
            locationRecord={selectedLocation}
            onClose={onClosePreview}
            onPlanRoute={onPlanRoute}
          />
          <button
            type="button"
            onClick={onShareProperty}
            className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-card backdrop-blur-md hover:bg-white"
          >
            <Share2 className="h-3.5 w-3.5" /> Share this location
          </button>
        </div>
      )}

      {pickingMode && (
        <p className="absolute left-1/2 top-3 z-[1300] -translate-x-1/2 rounded-lg bg-brand-900/90 px-3 py-1.5 text-xs font-semibold text-white">
          Tap the map to set the {pickingMode === 'origin' ? 'starting point' : 'destination'}
        </p>
      )}

      {fullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="fixed bottom-4 right-4 z-[1600] flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-900 shadow-premium-lg"
        >
          <X className="h-4 w-4" /> Exit full screen
        </button>
      )}

      {fullscreen && selectedProperty && (
        <div className="fixed bottom-4 left-4 z-[1600]">
          <button
            type="button"
            onClick={() => onPlanRoute(selectedProperty)}
            className="flex items-center gap-1.5 rounded-lg bg-flame-500 px-3 py-2 text-xs font-semibold text-white shadow-premium-lg hover:bg-flame-600"
          >
            <Navigation className="h-4 w-4" /> Plan a route
          </button>
        </div>
      )}
    </div>
  );
}