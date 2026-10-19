import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { formatPrice, buildLocation, buildShortLocation, AVAILABILITY_CONFIG, PURPOSE_CONFIG, ACTIVE_STATUSES } from '@/lib/property-utils';
import Gallery from '@/components/properties/Gallery';
import MediaShowcase from '@/components/media/MediaShowcase';
import { isYoutubeUrl } from '@/components/media/youtubeUtils';
import DetailSidebar from '@/components/properties/DetailSidebar';
import PropertyTabs from '@/components/properties/PropertyTabs';
import ListingCard from '@/components/properties/ListingCard';
import { setPropertySEO, clearPropertySEO } from '@/lib/property-seo';

const SAVE_KEY = 'pq_saved_properties';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false));
  }, []);

  // Fetch property + agent via backend function (enforces public eligibility server-side)
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setProperty(null);
    setAgent(null);
    window.scrollTo(0, 0);

    base44.functions.invoke('getMarketplacePropertyDetail', { property_id: id })
      .then((res) => {
        setProperty(res.data.property);
        setAgent(res.data.agent);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Set SEO metadata when property loads
  useEffect(() => {
    if (property) setPropertySEO(property);
    return () => clearPropertySEO();
  }, [property]);

  // Check saved status
  useEffect(() => {
    if (!property) return;
    if (isAuthenticated) {
      base44.auth.me().then((user) => {
        if (!user) return;
        base44.entities.SavedProperty.filter({ user_id: user.id, property_id: property.id })
          .then((res) => {
            const items = res.items || res;
            setIsSaved(items.length > 0);
          })
          .catch(() => {});
      }).catch(() => {});
    } else {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
      setIsSaved(saved.includes(property.id));
    }
  }, [property, isAuthenticated]);

  // Fetch similar properties from other agents
  useEffect(() => {
    if (!property) return;
    const query = { visibility: 'public', status: { $in: ACTIVE_STATUSES } };
    if (property.listing_purpose) query.listing_purpose = property.listing_purpose;
    if (property.state) query.state = property.state;
    // Exclude properties from the same agent so buyers see other agents' listings
    const agentId = property.listing_agent_id || property.owner_user_id;
    if (agentId) {
      query.listing_agent_id = { $ne: agentId };
      query.owner_user_id = { $ne: agentId };
    }
    base44.entities.Property.filter(query, { sort: '-created_date', limit: 12 })
      .then((res) => {
        const items = res.items || res;
        setRelated(items.filter((p) => p.id !== property.id).slice(0, 6));
      })
      .catch(() => setRelated([]));
  }, [property]);

  const handleSave = useCallback(async () => {
    if (!property) return;
    if (isAuthenticated) {
      setSaving(true);
      try {
        const res = await base44.functions.invoke('toggleSavedProperty', { property_id: property.id });
        setIsSaved(res.data.saved);
      } catch {
        // ignore
      }
      setSaving(false);
    } else {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
      const next = saved.includes(property.id) ? saved.filter((pid) => pid !== property.id) : [...saved, property.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      setIsSaved(next.includes(property.id));
    }
  }, [property, isAuthenticated]);

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

  if (notFound || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <Building2 className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Property Not Available</h1>
        <p className="mt-2 text-sm text-muted-foreground">This property may have been removed, sold, or is no longer available.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties</Link>
        </Button>
      </div>
    );
  }

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

      {/* 360° Tour & Videos */}
      {(property.tour_360_urls?.length || (property.video_urls || []).some((u) => isYoutubeUrl(u))) ? (
        <div className="container-wide section-pad mt-6">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
            <MediaShowcase
              tour360Urls={property.tour_360_urls}
              videoUrls={(property.video_urls || []).filter((u) => isYoutubeUrl(u))}
            />
          </div>
        </div>
      ) : null}

      {/* Title section */}
      <div className="container-wide section-pad mt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-flame-500 px-3 py-1 text-xs font-semibold text-white">{purpose}</span>
            {availability && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${availability.className}`}>{availability.label}</span>
            )}
            {property.is_featured && <span className="rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold text-white">Featured</span>}
            {property.is_joint_venture && <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">Joint Venture</span>}
          </div>
          <h1 className="font-heading text-2xl font-bold text-brand-900 sm:text-3xl">{property.title}</h1>
          <p className="flex items-center gap-1 text-muted-foreground">
            📍 {fullLocation || location || 'Location unavailable'}
          </p>
          {property.published_at && (
            <p className="text-xs text-muted-foreground/70">Listed on {new Date(property.published_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
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
              <DetailSidebar property={property} agent={agent} isSaved={isSaved} onSave={handleSave} saving={saving} />
            </div>
          </aside>
        </div>
      </div>

      {/* Similar properties */}
      {related.length > 0 && (
        <div className="container-wide section-pad mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-brand-900">Similar Properties from Other Agents</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ListingCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}