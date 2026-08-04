import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Building2, Eye, ArrowRight, ShieldCheck, Clock, ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { formatPrice, buildShortLocation, ACTIVE_STATUSES } from '@/lib/property-utils';

const ACCOUNT_LABEL = {
  agent: 'Agent',
  owner: 'Property Owner',
  corporate: 'Corporate Client',
};

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function ListerDashboard() {
  const rbac = useRBAC();
  const user = rbac.user;
  const accountType = user?.account_type || 'owner';
  const isAgent = accountType === 'agent' || rbac.isAgent;
  const [listings, setListings] = useState([]);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Property.filter(
        { $or: [{ owner_id: user.id }, { listing_agent_id: user.id }, { created_by_id: user.id }] },
        '-created_date', 200
      ).catch(() => []),
      isAgent ? base44.entities.Agent.filter({ user_id: user.id }, '-created_date', 1).catch(() => []) : Promise.resolve([]),
    ]).then(([p, a]) => {
      setListings(Array.isArray(p) ? p : []);
      setAgent(Array.isArray(a) && a[0] ? a[0] : null);
    }).finally(() => setLoading(false));
  }, [user, isAgent]);

  const published = listings.filter((p) => ACTIVE_STATUSES.includes(p.status)).length;
  const totalViews = listings.reduce((s, p) => s + (p.view_count || 0), 0);
  const verified = isAgent ? agent?.status === 'active' : true;
  const verificationLabel = isAgent
    ? (agent?.status === 'active' ? 'Verified Agent' : agent?.status === 'under_review' ? 'Under Review' : 'Pending Verification')
    : 'Verified';

  const name = user?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-6 text-white shadow-premium-lg sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 -translate-y-16 translate-x-16 rounded-full bg-flame-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-ice-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/70">Welcome back,</p>
            <h2 className="mt-1 font-heading text-3xl font-bold capitalize">{name}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                {ACCOUNT_LABEL[accountType] || 'Member'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {verificationLabel}
              </span>
            </div>
            {!verified && isAgent && (
              <p className="mt-3 max-w-md text-xs text-white/60">
                Your agent application is under review. You can start listing properties now — your agent profile becomes public once an admin verifies your account.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button asChild className="bg-flame-500 hover:bg-flame-600">
              <Link to="/dashboard/properties"><Plus className="mr-1 h-4 w-4" /> List a Property</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link to="/"><ExternalLink className="mr-1 h-4 w-4" /> View Public Site</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Building2} label="My Listings" value={listings.length} tone="text-brand-700" />
        <StatCard icon={Eye} label="Published" value={published} tone="text-emerald-500" />
        <StatCard icon={Eye} label="Total Views" value={totalViews} tone="text-flame-500" />
        <StatCard icon={ShieldCheck} label="Verification" value={verified ? 'Verified' : 'Pending'} tone={verified ? 'text-emerald-500' : 'text-amber-500'} />
      </div>

      {/* Recent listings */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-foreground">Recent Listings</h3>
          <Link to="/dashboard/properties" className="inline-flex items-center gap-1 text-xs font-medium text-flame-600 hover:underline">
            Manage all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">You haven't listed any properties yet.</p>
            <Button asChild className="mt-4 bg-flame-500 hover:bg-flame-600">
              <Link to="/dashboard/properties"><Plus className="mr-1 h-4 w-4" /> Create your first listing</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 3).map((p) => (
              <Link key={p.id} to={`/properties/${p.id}`} className="group flex gap-3 rounded-xl border border-border bg-muted/20 p-3 transition hover:border-flame-200 hover:shadow-card">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {(p.featured_image_url || p.image_urls?.[0]) ? (
                    <Image src={p.featured_image_url || p.image_urls[0]} alt={p.title} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground/40" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-flame-600">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground"><MapPin className="mr-0.5 inline h-3 w-3" />{buildShortLocation(p) || '—'}</p>
                  <p className="mt-1 font-heading text-sm font-bold text-flame-600">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}