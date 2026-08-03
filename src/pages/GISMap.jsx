import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon, Satellite, Mountain, Loader2, X, SlidersHorizontal, Building2, Navigation, Eye, MapPin, Star, Layers, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { formatPrice, buildShortLocation, buildGoogleMapsDirectionsLink, calculateDistance, NIGERIA_CENTER } from '@/lib/gis-map-utils';
import { ACTIVE_STATUSES } from '@/lib/property-utils';
import MapView from '@/components/gis/MapView';
import GISMapSearchBar from '@/components/gis/GISMapSearchBar';
import GISMapFilterPanel from '@/components/gis/GISMapFilterPanel';
import LocationInsightsPanel from '@/components/gis/LocationInsightsPanel';
import NearbyLandmarks from '@/components/gis/NearbyLandmarks';

const defaultFilters = {
  keyword: '', state: '', propertyType: '', availability: '',
  bedrooms: undefined, featured: false, hasTour: false, priceRange: [0, 500000000],
};

export default function GISMap() {
  const [properties, setProperties] = useState([]);
  const [states, setStates] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [mapType, setMapType] = useState('street');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [radiusKm, setRadiusKm] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.list('-created_date', 300).catch(() => []),
      base44.entities.LookupState.list('sort_order', 100).catch(() => []),
      base44.entities.Landmark.list('-created_date', 100).catch(() => []),
    ]).then(([props, sts, lms]) => {
      setProperties(props);
      setStates(sts);
      setLandmarks(lms);
    }).finally(() => setLoading(false));
  }, []);

  const mapped = useMemo(() => properties.filter((p) => p.latitude && p.longitude), [properties]);

  const filtered = useMemo(() => {
    let result = [...mapped];
    const f = filters;
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      result = result.filter((p) =>
        p.title?.toLowerCase().includes(kw) ||
        p.reference_number?.toLowerCase().includes(kw) ||
        p.city?.toLowerCase().includes(kw) ||
        p.state?.toLowerCase().includes(kw) ||
        p.estate?.toLowerCase().includes(kw)
      );
    }
    if (f.state) result = result.filter((p) => p.state === f.state);
    if (f.propertyType) result = result.filter((p) => p.property_type === f.propertyType);
    if (f.availability) result = result.filter((p) => p.availability_status === f.availability);
    if (f.bedrooms) result = result.filter((p) => (p.bedrooms || 0) >= f.bedrooms);
    if (f.featured) result = result.filter((p) => p.is_featured);
    if (f.hasTour) result = result.filter((p) => p.virtual_tour_url);
    if (f.priceRange && f.priceRange[1] < 500000000) result = result.filter((p) => (p.price || 0) <= f.priceRange[1]);
    if (radiusKm > 0 && userLocation) {
      result = result.filter((p) => calculateDistance(userLocation[0], userLocation[1], p.latitude, p.longitude) <= radiusKm);
    }
    return result;
  }, [mapped, filters, radiusKm, userLocation]);

  const radiusCenter = userLocation && radiusKm > 0 ? userLocation : null;

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        if (radiusKm === 0) setRadiusKm(10);
      },
      () => alert('Unable to get your location. Please enable location access.')
    );
  }, [radiusKm]);

  const handleRadiusChange = useCallback((km) => {
    setRadiusKm(km);
    if (km > 0 && !userLocation) handleLocateMe();
  }, [userLocation, handleLocateMe]);

  const mapTypeTabs = [
    { value: 'street', icon: MapIcon, label: 'Street' },
    { value: 'satellite', icon: Satellite, label: 'Satellite' },
    { value: 'terrain', icon: Mountain, label: 'Terrain' },
  ];

  return (
    <div className="min-h-screen bg-ice-50 pt-16 lg:pt-20">
      {/* Header */}
      <div className="border-b border-brand-100 bg-brand-900">
        <div className="container-wide section-pad py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-white">
                <Compass className="h-6 w-6 text-flame-500" /> GIS Location Intelligence
              </h1>
              <p className="mt-1 text-sm text-white/60">Discover properties across Nigeria with interactive maps, spatial insights, and navigation</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Building2, label: `${properties.length} Properties`, value: properties.length },
                { icon: MapPin, label: `${mapped.length} Mapped`, value: mapped.length },
                { icon: Star, label: `${filtered.length} Showing`, value: filtered.length },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <s.icon className="h-4 w-4 text-flame-400" />
                  <span className="text-sm font-semibold text-white">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container-wide section-pad mt-4">
        <GISMapSearchBar filters={filters} setFilters={setFilters} states={states} onLocateMe={handleLocateMe} onRadiusChange={handleRadiusChange} />
      </div>

      {/* Main layout */}
      <div className="container-wide section-pad mt-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Filter sidebar */}
          <aside className="hidden w-full lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <GISMapFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} maxPrice={500000000} />
              <LocationInsightsPanel properties={filtered} totalStates={states.length} />
              {selectedProperty && <NearbyLandmarks landmarks={landmarks} property={selectedProperty} />}
            </div>
          </aside>

          {/* Map + property list */}
          <div className="lg:col-span-3">
            <div className="relative h-[600px] overflow-hidden rounded-2xl border border-brand-200 shadow-card">
              {/* Map type toggle */}
              <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1 rounded-lg bg-white/90 p-1 shadow-card backdrop-blur-md">
                {mapTypeTabs.map((t) => (
                  <button key={t.value} onClick={() => setMapType(t.value)} title={t.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-md transition ${mapType === t.value ? 'bg-flame-500 text-white' : 'text-brand-700 hover:bg-ice-100'}`}>
                    <t.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* List toggle (mobile) */}
              <button onClick={() => setShowList(!showList)}
                className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-card backdrop-blur-md hover:bg-white lg:hidden">
                <Building2 className="h-3.5 w-3.5" /> {showList ? 'Map' : 'List'}
              </button>

              {loading ? (
                <div className="flex h-full w-full items-center justify-center bg-ice-50">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-flame-500" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div className={`h-full w-full ${showList ? 'hidden lg:block' : 'block'}`}>
                  <MapView
                    properties={filtered}
                    landmarks={landmarks}
                    selectedProperty={selectedProperty}
                    onSelectProperty={setSelectedProperty}
                    mapType={mapType}
                    radiusCenter={radiusCenter}
                    radiusKm={radiusKm}
                  />
                </div>
              )}

              {/* Property list overlay (mobile) */}
              {showList && !loading && (
                <div className="absolute inset-0 z-[999] overflow-y-auto bg-ice-50 p-3 lg:hidden">
                  <div className="space-y-3">
                    {filtered.slice(0, 20).map((p) => (
                      <button key={p.id} onClick={() => { setSelectedProperty(p); setShowList(false); }}
                        className="flex w-full gap-3 rounded-xl border border-brand-100 bg-white p-3 text-left">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                          {(p.featured_image_url || p.image_urls?.[0]) && <Image src={p.featured_image_url || p.image_urls[0]} alt={p.title} fittingType="fill" className="h-full w-full" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-brand-900">{p.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{buildShortLocation(p)}</p>
                          {p.price != null && <p className="text-sm font-bold text-flame-600">{formatPrice(p.price)}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected property floating card */}
              {selectedProperty && !showList && (
                <div className="absolute bottom-3 left-3 z-[1000] max-w-sm">
                  <div className="overflow-hidden rounded-xl border border-brand-200 bg-white shadow-premium-lg">
                    <div className="relative aspect-video w-full overflow-hidden bg-brand-100">
                      {(selectedProperty.featured_image_url || selectedProperty.image_urls?.[0]) && (
                        <Image src={selectedProperty.featured_image_url || selectedProperty.image_urls[0]} alt={selectedProperty.title} fittingType="fill" className="h-full w-full" />
                      )}
                      <button onClick={() => setSelectedProperty(null)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-brand-700 hover:bg-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="font-heading text-sm font-bold text-brand-900 line-clamp-1">{selectedProperty.title}</h4>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {buildShortLocation(selectedProperty)}</p>
                      {selectedProperty.price != null && <p className="mt-1.5 font-heading text-lg font-bold text-flame-600">{formatPrice(selectedProperty.price)}</p>}
                      <div className="mt-2 flex gap-1.5">
                        <Button asChild size="sm" className="flex-1 bg-brand-900 hover:bg-brand-800">
                          <Link to={`/properties/${selectedProperty.id}`}><Eye className="mr-1 h-3.5 w-3.5" /> View</Link>
                        </Button>
                        <a href={buildGoogleMapsDirectionsLink(selectedProperty)} target="_blank" rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-flame-500 px-2 py-1.5 text-xs font-semibold text-white hover:bg-flame-600">
                          <Navigation className="h-3.5 w-3.5" /> Navigate
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop property grid below map */}
            <div className="mt-5 hidden lg:block">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-brand-900">{filtered.length} Properties on Map</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="mr-1 h-4 w-4" /> {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {filtered.slice(0, 12).map((p) => (
                  <button key={p.id} onClick={() => setSelectedProperty(p)}
                    className={`flex gap-2.5 rounded-xl border p-3 text-left transition ${selectedProperty?.id === p.id ? 'border-flame-500 bg-flame-50' : 'border-brand-100 bg-white hover:border-brand-200 hover:shadow-card'}`}>
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                      {(p.featured_image_url || p.image_urls?.[0]) && <Image src={p.featured_image_url || p.image_urls[0]} alt={p.title} fittingType="fill" className="h-full w-full" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-brand-900">{p.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{buildShortLocation(p)}</p>
                      {p.price != null && <p className="text-sm font-bold text-flame-600">{formatPrice(p.price)}</p>}
                    </div>
                  </button>
                ))}
              </div>
              {filtered.length > 12 && (
                <div className="mt-3 text-center">
                  <Button asChild variant="outline" className="border-brand-200">
                    <Link to="/properties">View All Properties <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-brand-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></Button>
            </div>
            <GISMapFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} maxPrice={500000000} />
          </div>
        </div>
      )}
    </div>
  );
}