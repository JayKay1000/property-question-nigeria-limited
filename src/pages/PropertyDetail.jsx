import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { formatPrice, buildLocation, buildShortLocation, getPrimaryImage, AVAILABILITY_CONFIG, PURPOSE_CONFIG, CLASSIFICATION_CONFIG, ACTIVE_STATUSES } from '@/lib/property-utils';
import Gallery from '@/components/properties/Gallery';
import DetailSidebar from '@/components/properties/DetailSidebar';
import PropertyTabs from '@/components/properties/PropertyTabs';
import ListingCard from '@/components/properties/ListingCard';

const SAVE_KEY = 'pq_saved_properties';
const COMPARE_KEY = 'pq_compare_properties';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
    setCompareIds(JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'));
  }, []);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    base44.entities.Property.get(id)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch related properties
  useEffect(() => {
    if (!property) return;
    const query = { visibility: 'public' };
    if (property.state) query.state = property.state;
    base44.entities.Property.filter(query, '-created_date', 6)
      .then((results) => {
        setRelated(
          results
            .filter((p) => p.id !== property.id && ACTIVE_STATUSES.includes(p.status))
            .slice(0, 3)
        );
      })
      .catch(() => setRelated([]));
  }, [property]);

  const handleSave = useCallback((prop) => {
    setSavedIds((prev) => {
      const next = prev.includes(prop.id) ? prev.filter((pid) => pid !== prop.id) : [...prev, prop.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleCompare = useCallback((prop) => {
    setCompareIds((prev) => {
      let next;
      if (prev.includes(prop.id)) {
        next = prev.filter((pid) => pid !== prop.id);
      } else if (prev.length >= 4) {
        next = [...prev.slice(1), prop.id];
      } else {
        next = [...prev, prop.id];
      }
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-flame-500" />
          <p className="mt-4 text-sm text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <Building2 className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Property Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This property may have been removed or is no longer available.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings</Link>
        </Button>
      </div>
    );
  }

  const isSaved = savedIds.includes(property.id);
  const isCompared = compareIds.includes(property.id);
  const availability = AVAILABILITY_CONFIG[property.availability_status];
  const purpose = PURPOSE_CONFIG[property.listing_purpose] || 'For Sale';
  const location = buildShortLocation(property);
  const fullLocation = buildLocation(property);

  return (
    <div className="min-h-screen bg-ice-50 pb-16 pt-20">
      {/* Breadcrumb */}
      <div className="container-wide section-pad py-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-flame-600"><Home className="h-4 w-4" /></Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/properties" className="hover:text-flame-600">Properties</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-brand-900 font-medium">{property.title}</span>
        </nav>
      </div>

      {/* Gallery */}
      <div className="container-wide section-pad">
        <Gallery property={property} />
      </div>

      {/* Title section */}
      <div className="container-wide section-pad mt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-flame-500 px-3 py-1 text-xs font-semibold text-white">{purpose}</span>
            {availability && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${availability.className}`}>{availability.label}</span>
            )}
            {property.is_featured && <span className="rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold text-white">Featured</span>}
            {property.is_exclusive && <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">Exclusive</span>}
            {property.verified && <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">✓ Verified</span>}
          </div>
          <h1 className="font-heading text-2xl font-bold text-brand-900 sm:text-3xl">{property.title}</h1>
          <p className="flex items-center gap-1 text-muted-foreground">
            📍 {fullLocation || location || 'Location unavailable'}
          </p>
        </div>
      </div>

      {/* Main content + sidebar */}
      <div className="container-wide section-pad mt-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1 lg:max-w-2xl xl:max-w-3xl">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
              <PropertyTabs property={property} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 lg:shrink-0">
            <div className="sticky top-24">
              <DetailSidebar property={property} isSaved={isSaved} isCompared={isCompared}
                onSave={() => handleSave(property)} onCompare={() => handleCompare(property)} />
            </div>
          </aside>
        </div>
      </div>

      {/* Related properties */}
      {related.length > 0 && (
        <div className="container-wide section-pad mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-brand-900">Similar Properties</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ListingCard key={p.id} property={p}
                onSave={handleSave} isSaved={savedIds.includes(p.id)}
                onCompare={handleCompare} isCompared={compareIds.includes(p.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}