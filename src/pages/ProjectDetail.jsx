import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, MapPin, Calendar, Building2, Maximize, Grid3x3, TrendingUp, Share2, Heart, CheckCircle2, FileText, Download, Phone, Mail, Clock, Award, Users, Navigation, HardHat, Ruler, Zap, Droplets, Shield, TreePine, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { PROJECT_STATUS_CONFIG, INFRASTRUCTURE_LABELS, FACILITY_LABELS, formatPrice, formatNumber, buildProjectLocation, getProjectGallery, getProjectImage } from '@/lib/project-utils';
import { Image } from '@/components/ui/image';
import ProjectGallery from '@/components/projects/ProjectGallery';
import EstateLayoutViewer from '@/components/projects/EstateLayoutViewer';
import ConstructionTimeline from '@/components/projects/ConstructionTimeline';
import ProjectEnquiryForm from '@/components/projects/ProjectEnquiryForm';
import SiteInspectionBooking from '@/components/projects/SiteInspectionBooking';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [plots, setPlots] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [media, setMedia] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      base44.entities.Project.get(id).catch(() => null),
      base44.entities.EstatePlot.filter({ project_id: id }, 'plot_number', 500).catch(() => []),
      base44.entities.ProjectMilestone.filter({ project_id: id }, 'sort_order', 50).catch(() => []),
      base44.entities.ProjectMedia.filter({ project_id: id }, 'display_order', 100).catch(() => []),
      base44.entities.ProjectDocument.filter({ project_id: id }, '-created_date', 50).catch(() => []),
      base44.entities.EstateInfrastructure.filter({ project_id: id }, '-created_date', 50).catch(() => []),
      base44.entities.EstateFacility.filter({ project_id: id }, 'sort_order', 50).catch(() => []),
    ]).then(([p, pl, ms, md, docs, infra, fac]) => {
      setProject(p);
      setPlots(pl);
      setMilestones(ms);
      setMedia(md);
      setDocuments(docs);
      setInfrastructure(infra);
      setFacilities(fac);
    }).finally(() => setLoading(false));

    const savedIds = JSON.parse(localStorage.getItem('pq_saved_projects') || '[]');
    setSaved(savedIds.includes(id));
  }, [id]);

  const handleSave = () => {
    const savedIds = JSON.parse(localStorage.getItem('pq_saved_projects') || '[]');
    const next = savedIds.includes(id) ? savedIds.filter((sid) => sid !== id) : [...savedIds, id];
    localStorage.setItem('pq_saved_projects', JSON.stringify(next));
    setSaved(next.includes(id));
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: project.name, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <Building2 className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Project Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This project may have been removed or is not yet published.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const status = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.draft;
  const gallery = getProjectGallery(project);
  const available = project.units_available || plots.filter((p) => p.status === 'available').length;
  const sold = project.units_sold || plots.filter((p) => p.status === 'sold').length;
  const total = project.total_units || plots.length;
  const completion = project.progress_percentage || 0;

  const overviewStats = [
    { icon: Grid3x3, label: 'Total Plots', value: formatNumber(total) },
    { icon: TrendingUp, label: 'Available', value: formatNumber(available) },
    { icon: CheckCircle2, label: 'Sold', value: formatNumber(sold) },
    { icon: Maximize, label: 'Estate Area', value: project.total_land_area_sqm ? `${formatNumber(project.total_land_area_sqm)} sqm` : '—' },
    { icon: TrendingUp, label: 'Completion', value: `${completion}%` },
    { icon: Calendar, label: 'Est. Completion', value: project.estimated_completion_date ? new Date(project.estimated_completion_date).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—' },
  ];

  const infraIcons = { road: Navigation, drainage: Droplets, electricity: Zap, water_supply: Droplets, borehole: Droplets, perimeter_fence: Shield, gate_house: Building2, security_post: Shield, park: TreePine, school: Award, shopping_centre: Building2 };

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-20">
      {/* Hero gallery */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden bg-brand-900 lg:h-[60vh]">
          {getProjectImage(project) ? (
            <Image src={getProjectImage(project)} alt={project.name} fittingType="fill" className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950"><Building2 className="h-20 w-20 text-brand-400" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="container-wide section-pad pb-8">
              <Link to="/projects" className="mb-3 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> All Projects
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>{status.label}</span>
                {project.is_featured && <span className="flex items-center gap-1 rounded-full bg-flame-500 px-3 py-1 text-sm font-semibold text-white"><Award className="h-3.5 w-3.5" /> Featured</span>}
              </div>
              <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{project.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-lg text-white/80"><MapPin className="h-5 w-5" />{buildProjectLocation(project) || 'Nigeria'}</p>
              {project.short_description && <p className="mt-3 max-w-2xl text-white/70">{project.short_description}</p>}
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSave} className="bg-flame-500 hover:bg-flame-600">
                  <Heart className={`mr-1.5 h-4 w-4 ${saved ? 'fill-white' : ''}`} /> {saved ? 'Saved' : 'Save'}
                </Button>
                <Button onClick={handleShare} variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Share2 className="mr-1.5 h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-wide section-pad mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Overview stats */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {overviewStats.map((s, i) => (
                <Card key={i} className="border-brand-100 bg-white">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flame-50 text-flame-600"><s.icon className="h-5 w-5" /></div>
                    <div><p className="font-heading text-lg font-bold text-brand-900">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="mb-6 flex flex-wrap bg-ice-100">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:bg-white">Gallery</TabsTrigger>
                <TabsTrigger value="layout" className="data-[state=active]:bg-white">Plot Layout</TabsTrigger>
                <TabsTrigger value="construction" className="data-[state=active]:bg-white">Construction</TabsTrigger>
                {infrastructure.length > 0 && <TabsTrigger value="infrastructure" className="data-[state=active]:bg-white">Infrastructure</TabsTrigger>}
                {documents.length > 0 && <TabsTrigger value="documents" className="data-[state=active]:bg-white">Documents</TabsTrigger>}
                <TabsTrigger value="location" className="data-[state=active]:bg-white">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-brand-100 bg-white">
                  <CardContent className="p-6">
                    <h2 className="mb-3 font-heading text-xl font-bold text-brand-900">About {project.name}</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{project.description || project.short_description || 'Detailed information about this development will be available soon.'}</p>
                    {project.highlights?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Project Highlights</h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {project.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-brand-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{h}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {facilities.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Estate Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {facilities.map((f) => (
                            <Badge key={f.id} variant="secondary" className="bg-ice-100 text-brand-700">{FACILITY_LABELS[f.facility_type] || f.facility_type}: {f.facility_name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <ProjectGallery project={project} mediaItems={media} />
              </TabsContent>

              <TabsContent value="layout">
                <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                  <h2 className="mb-2 font-heading text-xl font-bold text-brand-900">Interactive Plot Layout</h2>
                  <p className="mb-4 text-sm text-muted-foreground">Click any plot to view details. Green = Available, Orange = Reserved, Red = Sold, Blue = Allocated, Grey = Not Released.</p>
                  <EstateLayoutViewer plots={plots} />
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="construction">
                <ConstructionTimeline milestones={milestones} progressPercentage={completion} />
              </TabsContent>

              {infrastructure.length > 0 && (
                <TabsContent value="infrastructure">
                  <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                    <h2 className="mb-4 font-heading text-xl font-bold text-brand-900">Infrastructure Development</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {infrastructure.map((inf) => {
                        const Icon = infraIcons[inf.infrastructure_type] || Building2;
                        return (
                          <div key={inf.id} className="flex items-center gap-3 rounded-xl border border-brand-100 bg-ice-50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flame-50 text-flame-600"><Icon className="h-5 w-5" /></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-brand-900">{INFRASTRUCTURE_LABELS[inf.infrastructure_type] || inf.infrastructure_name}</p>
                              <p className="text-xs text-muted-foreground">{inf.status} · {inf.completion_percentage || 0}% complete</p>
                            </div>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-flame-500" style={{ width: `${inf.completion_percentage || 0}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent></Card>
                </TabsContent>
              )}

              {documents.length > 0 && (
                <TabsContent value="documents">
                  <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                    <h2 className="mb-4 font-heading text-xl font-bold text-brand-900">Project Documents</h2>
                    <div className="space-y-3">
                      {documents.map((d) => (
                        <a key={d.id} href={d.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-brand-100 bg-ice-50 p-4 transition hover:border-flame-200 hover:bg-flame-50">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flame-100 text-flame-600"><FileText className="h-5 w-5" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-brand-900">{d.document_name}</p>
                            <p className="text-xs text-muted-foreground">{d.document_type.replace(/_/g, ' ')} · v{d.version || '1.0'}{d.verified && ' · ✓ Verified'}</p>
                          </div>
                          <Download className="h-5 w-5 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </CardContent></Card>
                </TabsContent>
              )}

              <TabsContent value="location">
                <Card className="border-brand-100 bg-white"><CardContent className="p-6">
                  <h2 className="mb-4 font-heading text-xl font-bold text-brand-900">Location & Directions</h2>
                  {project.latitude && project.longitude ? (
                    <div className="overflow-hidden rounded-xl border border-brand-100">
                      <iframe title="Project Location" className="h-80 w-full" loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.longitude - 0.01}%2C${project.latitude - 0.01}%2C${project.longitude + 0.01}%2C${project.latitude + 0.01}&layer=mapnik&marker=${project.latitude}%2C${project.longitude}`} />
                    </div>
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-ice-50 text-center">
                      <MapPin className="h-8 w-8 text-brand-200" />
                      <p className="mt-2 text-sm text-muted-foreground">Location coordinates not yet available</p>
                      {project.google_maps_link && <a href={project.google_maps_link} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm font-medium text-flame-600 hover:underline">View on Google Maps</a>}
                    </div>
                  )}
                  {project.location_address && <p className="mt-4 text-sm text-muted-foreground"><MapPin className="mr-1.5 inline h-4 w-4" />{project.location_address}</p>}
                </CardContent></Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              {/* Price & key info */}
              <Card className="border-brand-100 bg-white">
                <CardContent className="p-5">
                  {project.budget_ngn != null && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Starting from</p>
                      <p className="font-heading text-3xl font-bold text-flame-600">{formatPrice(project.budget_ngn)}</p>
                    </div>
                  )}
                  <div className="space-y-2 border-t border-border pt-4 text-sm">
                    {project.reference_number && <InfoRow label="Reference" value={project.reference_number} />}
                    {project.developer_name && <InfoRow label="Developer" value={project.developer_name} />}
                    {project.project_manager_name && <InfoRow label="Project Manager" value={project.project_manager_name} />}
                    {project.launch_date && <InfoRow label="Launched" value={new Date(project.launch_date).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })} />}
                    {project.estimated_completion_date && <InfoRow label="Est. Completion" value={new Date(project.estimated_completion_date).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })} />}
                  </div>
                </CardContent>
              </Card>

              <ProjectEnquiryForm project={project} />
              <SiteInspectionBooking project={project} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-brand-900">{value}</span>
    </div>
  );
}