import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, MapPin, Star, Building2, Phone, Mail, Languages, Award, TrendingUp, Briefcase, ArrowLeft, Share2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import AgentBadge from '@/components/agents/AgentBadge';
import VerificationTracker from '@/components/agents/VerificationTracker';
import { formatRating, formatPrice, AGENT_STATUS_CONFIG } from '@/lib/agent-utils';

export default function AgentDetail() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    base44.entities.Agent.get(id).then(async (a) => {
      setAgent(a);
      if (a?.user_id) {
        const props = await base44.entities.Property.filter({ listing_agent_id: a.user_id }, '-created_date', 20).catch(() => []);
        setListings(props);
      }
    }).catch(() => setAgent(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <Briefcase className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Agent Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This agent profile may not exist or has been removed.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/agents"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Agents</Link>
        </Button>
      </div>
    );
  }

  const status = AGENT_STATUS_CONFIG[agent.status] || AGENT_STATUS_CONFIG.pending;
  const isVerified = agent.verification_status === 'verified' || agent.status === 'verified' || agent.status === 'active';

  return (
    <div className="min-h-screen bg-ice-50 pt-20 lg:pt-24">
      {/* Header */}
      <div className="border-b border-brand-100 bg-white">
        <div className="container-wide section-pad py-3">
          <Link to="/agents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> All Agents
          </Link>
        </div>
      </div>

      <div className="container-wide section-pad mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
                <div className="aspect-square w-full overflow-hidden bg-brand-100">
                  {agent.photo_url ? (
                    <Image src={agent.photo_url} alt={agent.full_name} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950">
                      <span className="font-heading text-6xl font-bold text-white/30">{agent.full_name?.charAt(0) || 'A'}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="font-heading text-xl font-bold text-brand-900">{agent.full_name}</h1>
                      {agent.specialization && <p className="text-sm font-medium capitalize text-flame-600">{agent.specialization}</p>}
                    </div>
                    {isVerified && <AgentBadge agent={agent} size="sm" />}
                  </div>
                  {agent.agent_code && <p className="mt-1 text-xs text-muted-foreground">Agent Code: {agent.agent_code}</p>}
                  {agent.service_areas?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" /> <span className="line-clamp-2">{agent.service_areas.join(', ')}</span>
                    </div>
                  )}
                  {agent.rating > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-flame-500 text-flame-500" />
                      <span className="font-bold text-brand-900">{formatRating(agent.rating)}</span>
                      <span className="text-xs text-muted-foreground">({agent.review_count || 0} reviews)</span>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    {agent.phone && (
                      <a href={`tel:${agent.phone}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-flame-500 px-3 py-2 text-sm font-semibold text-white hover:bg-flame-600">
                        <Phone className="h-4 w-4" /> Call
                      </a>
                    )}
                    {agent.email && (
                      <a href={`mailto:${agent.email}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-ice-50">
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification tracker */}
              <VerificationTracker agent={agent} />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Building2} label="Listings" value={agent.total_listings || 0} color="text-brand-700" />
                <StatCard icon={TrendingUp} label="Sales" value={agent.total_sales || 0} color="text-success" />
                <StatCard icon={Award} label="Rating" value={formatRating(agent.rating)} color="text-flame-500" />
                <StatCard icon={Briefcase} label="Reviews" value={agent.review_count || 0} color="text-info" />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            {agent.bio && (
              <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
                <h2 className="mb-3 font-heading text-lg font-bold text-brand-900">About {agent.full_name}</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{agent.bio}</p>
              </div>
            )}

            {/* Languages & Specializations */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {agent.languages?.length > 0 && (
                <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
                  <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-brand-900"><Languages className="h-4 w-4 text-flame-500" /> Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.languages.map((l, i) => <Badge key={i} variant="secondary" className="bg-ice-100 text-brand-700">{l}</Badge>)}
                  </div>
                </div>
              )}
              {agent.service_areas?.length > 0 && (
                <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
                  <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-brand-900"><MapPin className="h-4 w-4 text-flame-500" /> Service Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.service_areas.map((s, i) => <Badge key={i} variant="secondary" className="bg-ice-100 text-brand-700">{s}</Badge>)}
                  </div>
                </div>
              )}
            </div>

            {/* License info */}
            {agent.license_number && (
              <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-brand-900"><Award className="h-4 w-4 text-flame-500" /> License & Certification</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow label="License Number" value={agent.license_number} />
                  {agent.license_expiry && <InfoRow label="License Expiry" value={new Date(agent.license_expiry).toLocaleDateString('en-NG')} />}
                  {agent.verified_at && <InfoRow label="Verified On" value={new Date(agent.verified_at).toLocaleDateString('en-NG')} />}
                  {agent.verified_by && <InfoRow label="Verified By" value="Property Question Team" />}
                </div>
              </div>
            )}

            {/* Active listings */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-brand-900">Active Listings</h2>
                <span className="text-sm text-muted-foreground">{listings.length} properties</span>
              </div>
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {listings.map((p) => (
                    <Link key={p.id} to={`/properties/${p.id}`} className="group flex gap-3 rounded-xl border border-brand-100 bg-white p-3 transition hover:border-flame-200 hover:shadow-card">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                        {(p.featured_image_url || p.image_urls?.[0]) && <Image src={p.featured_image_url || p.image_urls[0]} alt={p.title} fittingType="fill" className="h-full w-full" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-brand-900 group-hover:text-flame-600">{p.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(', ')}</p>
                        {p.price != null && <p className="mt-1 font-heading text-base font-bold text-flame-600">{formatPrice(p.price)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-200 bg-white py-12 text-center">
                  <Building2 className="h-8 w-8 text-brand-200" />
                  <p className="mt-2 text-sm text-muted-foreground">No active listings from this agent yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-4 text-center shadow-card">
      <Icon className={`mx-auto h-5 w-5 ${color}`} />
      <p className="mt-1.5 font-heading text-xl font-bold text-brand-900">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-brand-900">{value}</span>
    </div>
  );
}