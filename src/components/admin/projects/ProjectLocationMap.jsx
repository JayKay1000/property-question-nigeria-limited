import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, ExternalLink } from "lucide-react";

// Fix default marker icons under bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Nigeria centroid
const DEFAULT_CENTER = [9.082, 8.6753];
const SATELLITE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_ATTR =
  "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics";

function hasValidCoords(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  return (
    lat !== "" && lat != null && lng !== "" && lng != null &&
    !isNaN(la) && !isNaN(ln) &&
    la >= -90 && la <= 90 && ln >= -180 && ln <= 180
  );
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom() < 13 ? 15 : map.getZoom());
  }, [position, map]);
  return null;
}

function ClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => onClick(e.latlng),
  });
  return null;
}

export default function ProjectLocationMap({ latitude, longitude, onChange }) {
  const valid = hasValidCoords(latitude, longitude);
  const position = valid ? [Number(latitude), Number(longitude)] : null;
  const center = position || DEFAULT_CENTER;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange(pos.coords.latitude, pos.coords.longitude),
      () => alert("Unable to retrieve your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <MapPin className="h-4 w-4 text-flame-500" />
        Satellite Location Map
      </div>

      <MapContainer
        center={center}
        zoom={valid ? 15 : 6}
        scrollWheelZoom
        className="h-72 w-full rounded-lg overflow-hidden border border-gray-200 z-0"
      >
        <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTR} />
        <ClickHandler onClick={(latlng) => onChange(latlng.lat, latlng.lng)} />
        {position && <Recenter position={position} />}
        {position && (
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onChange(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={handleLocate}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200"
        >
          <Navigation className="h-3.5 w-3.5" /> Use my current location
        </button>

        {valid ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-flame-500 px-3 py-1.5 font-medium text-white hover:bg-flame-600"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Get directions
          </a>
        ) : (
          <span className="text-gray-500">
            Click the map, drag the pin, or use “Use my current location” to set coordinates.
          </span>
        )}
      </div>
    </div>
  );
}