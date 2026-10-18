import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin, AlertCircle, Search, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { NIGERIA_CENTER, NIGERIA_ZOOM, createPropertyIcon, createClusterIcon, MAP_TILE_LAYERS } from '@/lib/gis-map-utils';
import { isValidCoordinate, isWithinBounds, clusterMarkers, partitionByCoordinates } from '@/lib/marketplace-map-utils';
import PropertyMapPopup from '@/components/gis/PropertyMapPopup';
import { Button } from '@/components/ui/button';

/**
 * Tracks map movement and reports bounds + zoom to the parent.
 * The first call (on init) does NOT set mapMoved; subsequent calls do,
 * so the "Search this area" button only appears after an actual user pan/zoom.
 */
function MapEventController({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds(), map.getZoom(), true),
    zoomend: () => onBoundsChange(map.getBounds(), map.getZoom(), true),
  });
  useEffect(() => {
    onBoundsChange(map.getBounds(), map.getZoom(), false);
  }, [map]);
  return null;
}

/**
 * MarketplaceMapView — renders eligible marketplace listings as map markers.
 *
 * Receives the SAME `items` array as the grid (shared inventory, shared search
 * criteria). Displays markers for items with valid coordinates; clusters them
 * at low zoom. "Search this area" filters visible markers to the current
 * viewport bounds (client-side, since the SDK has no server-side geo-bounds query).
 */
export default function MarketplaceMapView({ items, selectedPropertyId, onSelectProperty }) {
  const [mapError, setMapError] = useState(false);
  const [mapMoved, setMapMoved] = useState(false);
  const [searchInBounds, setSearchInBounds] = useState(false);
  const [currentBounds, setCurrentBounds] = useState(null);
  const [zoom, setZoom] = useState(NIGERIA_ZOOM);
  const mapRef = useRef(null);

  const { withCoords, withoutCoords } = useMemo(
    () => partitionByCoordinates(items),
    [items]
  );

  // Markers visible in the current viewport (only when "Search this area" is active)
  const visibleMarkers = useMemo(() => {
    if (!searchInBounds || !currentBounds) return withCoords;
    return withCoords.filter((p) => isWithinBounds(p.latitude, p.longitude, currentBounds));
  }, [withCoords, searchInBounds, currentBounds]);

  const clusters = useMemo(() => clusterMarkers(visibleMarkers, zoom), [visibleMarkers, zoom]);

  const handleBoundsChange = (bounds, z, moved) => {
    setCurrentBounds(bounds);
    setZoom(z);
    if (moved) setMapMoved(true);
  };

  const handleSearchThisArea = () => {
    setSearchInBounds(true);
    setMapMoved(false);
  };

  const handleShowAll = () => {
    setSearchInBounds(false);
    setMapMoved(false);
  };

  const handleClusterClick = (center) => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, Math.min((mapRef.current.getZoom() || 8) + 2, 16), { duration: 0.8 });
    }
  };

  if (mapError) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
          <AlertCircle className="h-7 w-7 text-error" />
        </div>
        <h3 className="mt-4 font-heading text-base font-semibold text-brand-900">Map Unavailable</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The map service could not be loaded. This does not mean no properties exist — you can still browse them in grid or list view.
        </p>
        <Button onClick={() => setMapError(false)} variant="outline" className="mt-5 border-brand-200 hover:bg-brand-50">
          Retry Map
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-2xl border border-border bg-brand-50">
      <MapContainer
        center={NIGERIA_CENTER}
        zoom={NIGERIA_ZOOM}
        zoomControl={true}
        className="h-full w-full"
        scrollWheelZoom={true}
        ref={(ref) => { mapRef.current = ref; }}
      >
        <TileLayer
          url={MAP_TILE_LAYERS.street.url}
          attribution={MAP_TILE_LAYERS.street.attribution}
          maxZoom={19}
          eventHandlers={{ tileerror: () => setMapError(true) }}
        />
        <MapEventController onBoundsChange={handleBoundsChange} />

        {clusters.map((c, i) => {
          if (c.type === 'cluster') {
            return (
              <Marker
                key={`cluster-${i}`}
                position={c.center}
                icon={createClusterIcon(c.properties.length)}
                eventHandlers={{ click: () => handleClusterClick(c.center) }}
              />
            );
          }
          const prop = c.property;
          return (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={createPropertyIcon(prop, selectedPropertyId === prop.id)}
              eventHandlers={{ click: () => onSelectProperty?.(prop) }}
            >
              <Popup maxWidth={280} minWidth={240}>
                <PropertyMapPopup property={prop} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* "Search this area" button — appears after user pan/zoom */}
      {mapMoved && !searchInBounds && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2">
          <Button
            onClick={handleSearchThisArea}
            size="sm"
            className="pointer-events-auto bg-flame-500 text-white shadow-lg hover:bg-flame-600"
          >
            <Search className="mr-1.5 h-4 w-4" /> Search this area
          </Button>
        </div>
      )}

      {/* "Show all results" — exits viewport filter */}
      {searchInBounds && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2">
          <Button
            onClick={handleShowAll}
            size="sm"
            variant="outline"
            className="pointer-events-auto border-brand-200 bg-white shadow-lg hover:bg-brand-50"
          >
            <X className="mr-1.5 h-4 w-4" /> Show all results
          </Button>
        </div>
      )}

      {/* Listings without coordinates */}
      {withoutCoords > 0 && (
        <div className="absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-brand-900/90 px-4 py-2 text-center text-xs text-white shadow-lg">
          {withoutCoords} {withoutCoords === 1 ? 'listing lacks' : 'listings lack'} coordinates and cannot appear on the map
        </div>
      )}

      {/* No results in viewport */}
      {searchInBounds && visibleMarkers.length === 0 && withCoords.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
          <div className="rounded-xl bg-white/95 p-6 text-center shadow-xl">
            <MapPin className="mx-auto h-8 w-8 text-brand-300" />
            <p className="mt-2 text-sm font-medium text-brand-900">No listings in this area</p>
            <p className="mt-1 text-xs text-muted-foreground">Try panning to a different region or show all results.</p>
          </div>
        </div>
      )}

      {/* No mappable listings at all */}
      {withCoords.length === 0 && items.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
          <div className="rounded-xl bg-white/95 p-6 text-center shadow-xl">
            <MapPin className="mx-auto h-8 w-8 text-brand-300" />
            <p className="mt-2 text-sm font-medium text-brand-900">No mappable listings</p>
            <p className="mt-1 text-xs text-muted-foreground">None of the current results have coordinates. Try grid or list view.</p>
          </div>
        </div>
      )}
    </div>
  );
}