import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle } from 'react-leaflet';
import {
  createPropertyIcon, createClusterIcon, createLandmarkIcon, createNearbyPlaceIcon,
  createOriginIcon, createDestinationIcon, createAccessPointIcon, createUserLocationIcon,
  MAP_TILE_LAYERS, NIGERIA_CENTER, NIGERIA_ZOOM,
  ROUTE_LINE_STYLE, ALTERNATIVE_ROUTE_STYLE, BOUNDARY_STYLE,
} from '@/lib/gis-map-utils';
import { isWithinRadius } from '@/lib/gis-map-utils';
import PropertyMapPopup from '@/components/gis/PropertyMapPopup';
import {
  MapApiBridge, SelectionController, FitController, ClickPicker, ResizeController, ZoomWatcher,
} from '@/components/gis/mapControllers';

/**
 * Grid-based marker clustering. Cell size shrinks as the visitor zooms in; at
 * street zoom every property is its own marker again.
 */
function clusterByGrid(properties, zoom) {
  const cell = zoom >= 16 ? 0 : zoom >= 14 ? 0.0035 : zoom >= 12 ? 0.009 : zoom >= 10 ? 0.035 : zoom >= 8 ? 0.12 : 0.45;
  if (!cell) return properties.map((property) => ({ key: property.id, type: 'single', property }));

  const buckets = new Map();
  properties.forEach((property) => {
    const key = `${Math.floor(property.latitude / cell)}:${Math.floor(property.longitude / cell)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(property);
  });

  const output = [];
  buckets.forEach((group) => {
    if (group.length === 1) {
      output.push({ key: group[0].id, type: 'single', property: group[0] });
      return;
    }
    const lat = group.reduce((sum, p) => sum + p.latitude, 0) / group.length;
    const lng = group.reduce((sum, p) => sum + p.longitude, 0) / group.length;
    output.push({ key: `cluster-${lat.toFixed(4)}-${lng.toFixed(4)}-${group.length}`, type: 'cluster', lat, lng, count: group.length, items: group });
  });
  return output;
}

export default function MapView({
  properties = [],
  landmarks = [],
  selectedProperty,
  onSelectProperty,
  mapType = 'street',
  radiusCenter,
  radiusKm,
  route,
  origin,
  destination,
  userLocation,
  accessPoint,
  boundary = [],
  nearbyPlaces = [],
  showNearby = false,
  showBoundary = true,
  pickingMode = null,
  onMapPick,
  apiRef,
  fitToken,
  focusTarget,
  onZoomChange,
  resizeTrigger,
}) {
  const [zoom, setZoom] = useState(NIGERIA_ZOOM);

  const mapped = useMemo(() => properties.filter((p) => p.latitude && p.longitude), [properties]);
  const tileConfig = MAP_TILE_LAYERS[mapType] || MAP_TILE_LAYERS.street;

  const clustered = useMemo(() => clusterByGrid(mapped, zoom), [mapped, zoom]);
  const fitPoints = useMemo(() => mapped.map((p) => [p.latitude, p.longitude]), [mapped]);

  const activeRoute = route?.routes?.[route.activeIndex ?? 0] || route?.routes?.[0];
  const alternativeRoutes = (route?.routes || []).filter((_, index) => index !== (route?.activeIndex ?? 0));

  const routeBounds = useMemo(() => {
    const geometries = (route?.routes || []).map((r) => r.geometry).filter((g) => Array.isArray(g) && g.length);
    if (!geometries.length) return null;
    const all = geometries.flat();
    const lats = all.map((p) => p[0]);
    const lngs = all.map((p) => p[1]);
    return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
  }, [route]);

  const radiusMeters = radiusKm > 0 ? radiusKm * 1000 : null;
  const nearbyVisible = showNearby
    ? nearbyPlaces
        .filter((place) => place.latitude != null && place.longitude != null)
        .filter((place) => {
          if (!radiusMeters || !radiusCenter) return true;
          return isWithinRadius(radiusCenter[0], radiusCenter[1], place.latitude, place.longitude, radiusKm);
        })
    : [];

  return (
    <MapContainer
      center={NIGERIA_CENTER}
      zoom={NIGERIA_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      scrollWheelZoom
      style={{ cursor: pickingMode ? 'crosshair' : undefined }}
    >
      <TileLayer key={mapType} url={tileConfig.url} attribution={tileConfig.attribution} maxZoom={19} />

      <MapApiBridge apiRef={apiRef} onZoomChange={(value) => { setZoom(value); onZoomChange?.(value); }} />
      <ZoomWatcher onZoomChange={setZoom} />
      <SelectionController focus={focusTarget || selectedProperty} routeBounds={routeBounds} />
      <FitController token={fitToken} points={fitPoints} />
      <ClickPicker active={Boolean(pickingMode)} onPick={onMapPick} />
      <ResizeController trigger={resizeTrigger} />

      {radiusCenter && radiusKm > 0 && (
        <Circle
          center={radiusCenter}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#FF7A00', fillColor: '#FF7A00', fillOpacity: 0.06, weight: 2, dashArray: '6 6' }}
        />
      )}

      {showBoundary && boundary.length >= 3 && (
        <Polygon positions={boundary} pathOptions={BOUNDARY_STYLE} />
      )}

      {alternativeRoutes.map((alternative, index) => (
        <Polyline key={`alt-${index}`} positions={alternative.geometry} pathOptions={ALTERNATIVE_ROUTE_STYLE} />
      ))}
      {activeRoute && <Polyline positions={activeRoute.geometry} pathOptions={ROUTE_LINE_STYLE} />}

      {clustered.map((item) =>
        item.type === 'cluster' ? (
          <Marker
            key={item.key}
            position={[item.lat, item.lng]}
            icon={createClusterIcon(item.count)}
            eventHandlers={{ click: () => apiRef?.current?.flyTo(item.lat, item.lng, Math.min(zoom + 3, 18)) }}
          />
        ) : (
          <Marker
            key={item.key}
            position={[item.property.latitude, item.property.longitude]}
            icon={createPropertyIcon(item.property, selectedProperty?.id === item.property.id)}
            eventHandlers={{ click: () => onSelectProperty?.(item.property) }}
            zIndexOffset={selectedProperty?.id === item.property.id ? 500 : 0}
          >
            <Popup maxWidth={280} minWidth={240}>
              <PropertyMapPopup property={item.property} />
            </Popup>
          </Marker>
        ),
      )}

      {landmarks
        .filter((l) => l.latitude && l.longitude)
        .map((landmark) => (
          <Marker key={landmark.id} position={[landmark.latitude, landmark.longitude]} icon={createLandmarkIcon(landmark.landmark_type)} opacity={0.75}>
            <Popup maxWidth={220}>
              <div className="text-sm">
                <p className="font-bold text-brand-900">{landmark.landmark_name}</p>
                <p className="text-xs capitalize text-muted-foreground">{landmark.landmark_type?.replace(/_/g, ' ')}</p>
                {landmark.address && <p className="mt-1 text-xs">{landmark.address}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

      {nearbyVisible.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={createNearbyPlaceIcon(place.category)} opacity={0.9}>
          <Popup maxWidth={230}>
            <div className="text-sm">
              <p className="font-bold text-brand-900">{place.name}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {place.category?.replace(/_/g, ' ')} · {place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} m` : `${place.distanceKm.toFixed(1)} km`} away
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">Distance is a straight line. Source: OpenStreetMap.</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {userLocation && <Marker position={userLocation} icon={createUserLocationIcon()} zIndexOffset={300} />}

      {accessPoint && (
        <Marker position={[accessPoint.lat, accessPoint.lng]} icon={createAccessPointIcon()} zIndexOffset={400}>
          <Popup maxWidth={230}>
            <div className="text-sm">
              <p className="font-bold text-brand-900">Road access point</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {accessPoint.instructions || 'The entrance or approach point for this property.'}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={createOriginIcon()} zIndexOffset={600}>
          <Popup>
            <p className="text-sm font-bold text-brand-900">Starting point</p>
            <p className="text-xs text-muted-foreground">{origin.label || 'Selected on map'}</p>
          </Popup>
        </Marker>
      )}

      {destination && destination.lat != null && destination.lng != null && (
        <Marker position={[destination.lat, destination.lng]} icon={createDestinationIcon()} zIndexOffset={650}>
          <Popup>
            <p className="text-sm font-bold text-brand-900">{destination.label || 'Destination'}</p>
            <p className="text-xs text-muted-foreground">Route destination</p>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}