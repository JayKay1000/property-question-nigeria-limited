import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { createPropertyIcon, createClusterIcon, calculateDistance, MAP_TILE_LAYERS, NIGERIA_CENTER, NIGERIA_ZOOM } from '@/lib/gis-map-utils';
import PropertyMapPopup from '@/components/gis/PropertyMapPopup';

function FlyToController({ selectedProperty }) {
  const map = useMap();
  useEffect(() => {
    if (selectedProperty?.latitude && selectedProperty?.longitude) {
      map.flyTo([selectedProperty.latitude, selectedProperty.longitude], Math.max(map.getZoom(), 14), { duration: 1.2 });
    }
  }, [selectedProperty]);
  return null;
}

function BoundsController({ properties, hasSearched }) {
  const map = useMap();
  useEffect(() => {
    const mapped = properties.filter((p) => p.latitude && p.longitude);
    if (mapped.length === 0) return;
    if (hasSearched && mapped.length > 0) {
      const lats = mapped.map((p) => p.latitude);
      const lngs = mapped.map((p) => p.longitude);
      const south = Math.min(...lats), north = Math.max(...lats);
      const west = Math.min(...lngs), east = Math.max(...lngs);
      map.fitBounds([[south, west], [north, east]], { padding: [50, 50], maxZoom: 14 });
    }
  }, [properties, hasSearched]);
  return null;
}

export default function MapView({ properties, landmarks = [], selectedProperty, onSelectProperty, mapType = 'street', radiusCenter, radiusKm }) {
  const mapped = useMemo(() => properties.filter((p) => p.latitude && p.longitude), [properties]);
  const tileConfig = MAP_TILE_LAYERS[mapType] || MAP_TILE_LAYERS.street;

  return (
    <MapContainer center={NIGERIA_CENTER} zoom={NIGERIA_ZOOM} zoomControl={true} className="h-full w-full" scrollWheelZoom={true}>
      <TileLayer key={mapType} url={tileConfig.url} attribution={tileConfig.attribution} maxZoom={19} />

      <FlyToController selectedProperty={selectedProperty} />
      <BoundsController properties={properties} hasSearched={false} />

      {/* Radius circle */}
      {radiusCenter && radiusKm && (
        <Circle center={radiusCenter} radius={radiusKm * 1000}
          pathOptions={{ color: '#FF7A00', fillColor: '#FF7A00', fillOpacity: 0.08, weight: 2, dashArray: '6 6' }} />
      )}

      {/* Property markers */}
      {mapped.map((prop) => (
        <Marker key={prop.id} position={[prop.latitude, prop.longitude]}
          icon={createPropertyIcon(prop, selectedProperty?.id === prop.id)}
          eventHandlers={{ click: () => onSelectProperty?.(prop) }}>
          <Popup maxWidth={280} minWidth={240}>
            <PropertyMapPopup property={prop} />
          </Popup>
        </Marker>
      ))}

      {/* Landmark markers */}
      {landmarks.filter((l) => l.latitude && l.longitude).map((lm) => (
        <Marker key={lm.id} position={[lm.latitude, lm.longitude]}
          icon={createClusterIcon(0)}
          opacity={0.6}>
          <Popup maxWidth={200}>
            <div className="text-sm">
              <p className="font-bold text-brand-900">{lm.landmark_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{lm.landmark_type?.replace(/_/g, ' ')}</p>
              {lm.address && <p className="mt-1 text-xs">{lm.address}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}