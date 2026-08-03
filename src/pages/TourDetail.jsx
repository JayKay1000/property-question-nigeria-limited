import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Share2, Heart, Download, MapPin, CheckCircle2, Grid3x3, Building2, FileText, Navigation, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import ImmersiveViewer from '@/components/tours/ImmersiveViewer';
import RoomNavigator from '@/components/tours/RoomNavigator';
import FloorPlanViewer from '@/components/tours/FloorPlanViewer';
import TourInfoPanel from '@/components/tours/TourInfoPanel';
import TourBookingForm from '@/components/tours/TourBookingForm';

export default function TourDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const propertyIdParam = searchParams.get('property');
  const [tour, setTour] = useState(null);
  const [property, setProperty] = useState(null);
  const [media360, setMedia360] = useState([]);
  const [droneMedia, setDroneMedia] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [virtualTours, setVirtualTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeScene, setActiveScene] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      base44.entities.VirtualTour.get(id).catch(() => null),
    ]).then(async ([vt]) => {
      setTour(vt);
      const propId = propertyIdParam || vt?.property_id;
      if (!propId) { setLoading(false); return; }
      const [
        prop, m360, drone, imgs, vids, plans, vts,
      ] = await Promise.all([
        base44.entities.Property.get(propId).catch(() => null),
        base44.entities.Media360.filter({ property_id: propId }, 'display_order', 50).catch(() => []),
        base44.entities.DroneMedia.filter({ property_id: propId }, '-created_date', 50).catch(() => []),
        base44.entities.PropertyImage.filter({ property_id: propId }, 'display_order', 100).catch(() => []),
        base44.entities.PropertyVideo.filter({ property_id: propId }, 'display_order', 50).catch(() => []),
        base44.entities.FloorPlan.filter({ property_id: propId }, 'display_order', 20).catch(() => []),
        base44.entities.VirtualTour.filter({ property_id: propId }, 'display_order', 20).catch(() => []),
      ]);
      setProperty(prop);
      setMedia360(m360);
      setDroneMedia(drone);
      setImages(imgs);
      setVideos(vids);
      setFloorPlans(plans);
      setVirtualTours(vts);
    }).finally(() => setLoading(false));

    const savedIds = JSON.parse(localStorage.getItem('pq_saved_tours') || '[]');
    setSaved(savedIds.includes(id));
  }, [id, propertyIdParam]);

  const handleSave = () => {
    const savedIds = JSON.parse(localStorage.getItem('pq_saved_tours') || '[]');
    const next = savedIds.includes(id) ? savedIds.filter((sid) => sid !== id) : [...savedIds, id];
    localStorage.setItem('pq_saved_tours', JSON.stringify(next));
    setSaved(next.includes(id));
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: tour?.title || property?.title || 'Property Tour', url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
      </div>
    );
  }

  if (!tour && !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <Building2 className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Tour Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This tour may have been removed or is not yet published.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/tours"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tours</Link>
        </Button>
      </div>
    );
  }

  const scenes = media360.flatMap((m) => m.scenes || []);
  const hasFloorPlans = floorPlans.length > 0;

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-20">
      {/* Header bar */}
      <div className="border-b border-brand-100 bg-white">
        <div className="container-wide section-pad py-3">
          <div className="flex items-center justify-between">
            <Link to="/tours" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
              <ArrowLeft className="h-4 w-4" /> All Tours
            </Link>
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="outline" size="sm" className="border-brand-200">
                <Heart className={`mr-1.5 h-4 w-4 ${saved ? 'fill-flame-500 text-flame-500' : ''}`} /> {saved ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm" className="border-brand-200">
                <Share2 className="mr-1.5 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="container-wide section-pad mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main viewer column */}
          <div className="lg:col-span-2">
            <ImmersiveViewer
              property={property}
              virtualTours={virtualTours}
              media360={media360}
              videos={videos}
              droneMedia={droneMedia}
              images={images}
            />

            {/* Room navigation */}
            {scenes.length > 0 && (
              <div className="mt-4">
                <RoomNavigator scenes={scenes} activeScene={activeScene} onSelect={setActiveScene} />
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="flex flex-wrap bg-ice-100">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
                {hasFloorPlans && <TabsTrigger value="floorplans" className="data-[state=active]:bg-white">Floor Plans</TabsTrigger>}
                <TabsTrigger value="location" className="data-[state=active]:bg-white">Location</TabsTrigger>
                {property?.description && <TabsTrigger value="description" className="data-[state=active]:bg-white">Details</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                  <h2 className="mb-3 font-heading text-xl font-bold text-brand-900">{property?.title || tour?.title || 'Property Tour'}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{property?.short_description || tour?.description || property?.description || 'Experience this property through our immersive virtual tour.'}</p>
                  {property?.highlights?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 font-heading text-sm font-bold text-brand-900">Key Features</h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {property.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-brand-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{h}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {property?.amenities?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 font-heading text-sm font-bold text-brand-900">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((a, i) => <Badge key={i} variant="secondary" className="bg-ice-100 text-brand-700">{a}</Badge>)}
                      </div>
                    </div>
                  )}
                </CardContent></Card>
              </TabsContent>

              {hasFloorPlans && (
                <TabsContent value="floorplans">
                  <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                    <h2 className="mb-4 font-heading text-xl font-bold text-brand-900">Floor Plans & Layouts</h2>
                    <FloorPlanViewer floorPlans={floorPlans} />
                  </CardContent></Card>
                </TabsContent>
              )}

              <TabsContent value="location">
                <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                  <h2 className="mb-4 font-heading text-xl font-bold text-brand-900">Location</h2>
                  {property?.latitude && property?.longitude ? (
                    <div className="overflow-hidden rounded-xl border border-brand-100">
                      <iframe title="Property Location" className="h-80 w-full" loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01}%2C${property.latitude - 0.01}%2C${property.longitude + 0.01}%2C${property.latitude + 0.01}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`} />
                    </div>
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-ice-50 text-center">
                      <MapPin className="h-8 w-8 text-brand-200" />
                      <p className="mt-2 text-sm text-muted-foreground">Location coordinates not yet available</p>
                    </div>
                  )}
                  {property?.estate && <p className="mt-3 text-sm text-muted-foreground"><Building2 className="mr-1.5 inline h-4 w-4" />{property.estate}</p>}
                  {property?.city && <p className="text-sm text-muted-foreground"><MapPin className="mr-1.5 inline h-4 w-4" />{property.city}, {property.state}</p>}
                </CardContent></Card>
              </TabsContent>

              {property?.description && (
                <TabsContent value="description">
                  <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                    <h2 className="mb-3 font-heading text-xl font-bold text-brand-900">Property Details</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{property.description}</p>
                  </CardContent></Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <TourInfoPanel property={property} tour={tour} />
              <TourBookingForm property={property} tour={tour} />

              {/* Quick links */}
              <Card className="border-brand-100 bg-white">
                <CardContent className="p-4 space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start border-brand-200">
                    <Link to={`/properties/${property?.id}`}><Building2 className="mr-2 h-4 w-4" /> View Full Listing</Link>
                  </Button>
                  {floorPlans.length > 0 && (
                    <a href={floorPlans[0]?.file_url} download target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-start rounded-md border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
                      <Download className="mr-2 h-4 w-4" /> Download Floor Plan
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}