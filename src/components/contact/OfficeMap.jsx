import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FALLBACK = {
  lat: 6.6486,
  lng: 3.3570,
  name: 'Head Office — Lagos',
  address: 'Suite 43, Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos, Nigeria'
};

const pinIcon = L.divIcon({
  className: 'office-map-pin',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#FF7A00" stroke="#001A3D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30]
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function OfficeMap({ offices = [], height = 400 }) {
  const points = useMemo(() => {
    const valid = offices
      .filter((o) => o.latitude && o.longitude)
      .map((o) => ({
        lat: o.latitude,
        lng: o.longitude,
        name: o.office_name,
        address: [o.address_line1, o.city, o.state_code].filter(Boolean).join(', ')
      }));
    return valid.length ? valid : [FALLBACK];
  }, [offices]);

  const center = points[0];

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height, width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <MapResizer />
      {points.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={pinIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-brand-900">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}