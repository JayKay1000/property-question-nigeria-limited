/**
 * Shared utilities for the Enterprise GIS & Location Intelligence Module.
 */
import L from 'leaflet';
import { formatPrice, formatNumber, buildShortLocation } from '@/lib/property-utils';

export { formatPrice, formatNumber, buildShortLocation };

// Fix Leaflet default icon paths for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const MAP_TILE_LAYERS = {
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    icon: 'Map',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    icon: 'Satellite',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
    icon: 'Mountain',
  },
};

export const PROPERTY_MARKER_CONFIG = {
  house: { color: '#001A3D', label: 'House', emoji: '🏠' },
  apartment: { color: '#3b82f6', label: 'Apartment', emoji: '🏢' },
  land: { color: '#22c55e', label: 'Land', emoji: '📍' },
  commercial: { color: '#FF7A00', label: 'Commercial', emoji: '🏬' },
  villa: { color: '#8b5cf6', label: 'Villa', emoji: '🏡' },
  duplex: { color: '#06b6d4', label: 'Duplex', emoji: '🏘️' },
  industrial: { color: '#64748b', label: 'Industrial', emoji: '🏭' },
  mixed_use: { color: '#f59e0b', label: 'Mixed Use', emoji: '🏙️' },
  default: { color: '#FF7A00', label: 'Property', emoji: '📍' },
};

export const LANDMARK_TYPE_CONFIG = {
  school: { label: 'School', icon: 'GraduationCap', color: '#3b82f6' },
  university: { label: 'University', icon: 'GraduationCap', color: '#1d4ed8' },
  hospital: { label: 'Hospital', icon: 'Plus', color: '#ef4444' },
  bank: { label: 'Bank', icon: 'Building2', color: '#001A3D' },
  shopping_mall: { label: 'Shopping Mall', icon: 'ShoppingBag', color: '#FF7A00' },
  market: { label: 'Market', icon: 'ShoppingCart', color: '#f59e0b' },
  airport: { label: 'Airport', icon: 'Plane', color: '#6366f1' },
  hotel: { label: 'Hotel', icon: 'Bed', color: '#8b5cf6' },
  restaurant: { label: 'Restaurant', icon: 'UtensilsCrossed', color: '#f97316' },
  church: { label: 'Church', icon: 'Church', color: '#64748b' },
  mosque: { label: 'Mosque', icon: 'Church', color: '#16a34a' },
  police_station: { label: 'Police Station', icon: 'Shield', color: '#1e3a8a' },
  fire_station: { label: 'Fire Station', icon: 'Flame', color: '#dc2626' },
  bus_stop: { label: 'Bus Stop', icon: 'Bus', color: '#0891b2' },
  rail_station: { label: 'Rail Station', icon: 'Train', color: '#7c3aed' },
  beach: { label: 'Beach', icon: 'Waves', color: '#0ea5e9' },
  park: { label: 'Park', icon: 'TreePine', color: '#16a34a' },
  stadium: { label: 'Stadium', icon: 'Trophy', color: '#ea580c' },
  tourist_attraction: { label: 'Tourist Attraction', icon: 'Camera', color: '#d97706' },
  government_office: { label: 'Government Office', icon: 'Landmark', color: '#475569' },
  other: { label: 'Landmark', icon: 'MapPin', color: '#64748b' },
};

export const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

export const NIGERIA_CENTER = [9.082, 8.6753];
export const NIGERIA_ZOOM = 6;

export function getMarkerConfig(property) {
  const type = property?.property_type?.toLowerCase() || '';
  return PROPERTY_MARKER_CONFIG[type] || PROPERTY_MARKER_CONFIG.default;
}

export function createPropertyIcon(property, isSelected = false) {
  const cfg = getMarkerConfig(property);
  const size = isSelected ? 40 : 30;
  const ring = isSelected ? `border-4 border-flame-500` : `border-2 border-white`;
  return L.divIcon({
    className: 'pq-map-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${cfg.color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      ${ring};
      box-shadow: 0 2px 6px rgba(0,26,61,0.4);
      display: flex; align-items: center; justify-content: center;
    "><span style="transform: rotate(45deg); font-size: ${size * 0.4}px; line-height: 1;">${cfg.emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export function createLandmarkIcon(landmarkType) {
  const cfg = LANDMARK_TYPE_CONFIG[landmarkType] || LANDMARK_TYPE_CONFIG.other;
  return L.divIcon({
    className: 'pq-landmark-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${cfg.color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function createClusterIcon(count) {
  const size = count > 99 ? 48 : count > 9 ? 40 : 32;
  return L.divIcon({
    className: 'pq-cluster-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: rgba(0,26,61,0.7);
      border: 3px solid #FF7A00;
      border-radius: 50%;
      color: white; font-weight: 700; font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Haversine distance in km
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinRadius(lat1, lng1, lat2, lng2, radiusKm) {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusKm;
}

export function buildGoogleMapsLink(property) {
  if (property?.google_maps_link) return property.google_maps_link;
  if (property?.latitude && property?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
  }
  const addr = [property?.address_line, property?.city, property?.state, 'Nigeria'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}

export function buildGoogleMapsDirectionsLink(property) {
  const dest = property?.latitude && property?.longitude
    ? `${property.latitude},${property.longitude}`
    : encodeURIComponent([property?.address_line, property?.city, property?.state, 'Nigeria'].filter(Boolean).join(', '));
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}