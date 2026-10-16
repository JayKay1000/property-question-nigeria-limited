import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Plus, ShieldCheck, User, Home, FileText, Clock, XCircle, CheckCircle2, Archive, AlertCircle, Edit3, Send, Eye, RotateCcw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TIER_CONFIG } from '@/lib/marketplace-utils';
import { formatPrice, buildShortLocation, getPrimaryImage, PURPOSE_CONFIG } from '@/lib/property-utils';
import { Image } from '@/components/ui/image';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';
import AgentListingCard from '@/components/marketplace/AgentListingCard';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'pending_approval', label: 'Pending' },
  { key: 'published', label: 'Published' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'inactive', label: 'Archived' },
];

export default function MarketplaceAgentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('getMarketplaceAgentDashboard', {});
      setData(res.data);
    } catch (e) {
      if (e.response?.status === 404) {
        navigate('/marketplace/agent/register');
        return;
      }
      setError('Failed to load dashboard.');
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action, listing) => {
    setActionLoading(listing.id);
    try {
      if (action === 'submit') {
        await base44.functions.invoke('submitMarketplaceListing', { listing_id: listing.id });
      } else if (action === 'archive') {
        await base44.functions.invoke('archiveMarketplaceListing', { listing_id: listing.id });
      } else if (action === 'reactivate') {
        await base44.functions.invoke('reactivateMarketplaceListing', { listing_id: listing.id });
      }
      await load();
    } catch (e) {
      const msg = e.response?.data?.error || 'Action failed.';
      setError(msg);
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf9]">
        <MarketplaceHeader />
        <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-flame-500" /></div>
        <MarketplaceFooter />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fbfaf9]">
        <MarketplaceHeader />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-lg font-bold text-brand-900">Dashboard Unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error || 'Please try again later.'}</p>
          <Button asChild className="mt-5 bg-flame-500 text-white hover:bg-flame-600"><Link to="/marketplace">Back to Marketplace</Link></Button>
        </div>
        <MarketplaceFooter />
      </div>
    );
  }

  const { agent, tier, counts, listings } = data;
  const tierConfig = TIER_CONFIG[tier.effective_tier] || TIER_CONFIG.basic;

  const filteredListings = tab === 'all' ? listings : listings.filter((l) => {
    if (tab === 'published') return ['published', 'active', 'approved', 'verified'].includes(l.status);
    return l.status === tab;
  });

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      <MarketplaceHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-900">Agent Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Welcome back, {agent.full_name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-flame-500 text-white hover:bg-flame-600">
              <Link to="/marketplace/agent/properties/new"><Plus className="mr-1.5 h-4 w-4" /> Post New Property</Link>
            </Button>
            <Button asChild variant="outline" className="border-brand-200 hover:bg-brand-50">
              <Link to="/marketplace/agent/profile"><ShieldCheck className="mr-1.5 h-4 w-4" /> Verification</Link>
            </Button>
          </div>
        </div>

        {/* Tier banner */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-flame-50">
              <TrendingUp className="h-6 w-6 text-flame-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Tier</p>
              <p className="font-heading text-lg font-bold text-brand-900">{tierConfig.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Active / Limit</p>
            <p className="font-heading text-lg font-bold text-brand-900">
              {tier.active_listings} / <span className="text-flame-600">{tier.listing_limit === null ? '∞' : tier.listing_limit}</span>
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard icon={CheckCircle2} label="Published" value={counts.active} color="text-success" bg="bg-success/10" />
          <SummaryCard icon={FileText} label="Drafts" value={counts.drafts} color="text-brand-700" bg="bg-brand-50" />
          <SummaryCard icon={Clock} label="Pending Review" value={counts.pending} color="text-warning" bg="bg-warning/10" />
          <SummaryCard icon={XCircle} label="Rejected" value={counts.rejected} color="text-error" bg="bg-error/10" />
        </div>

        {/* Capacity warning */}
        {!tier.can_publish && tier.listing_limit !== null && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-semibold text-brand-900">Listing Limit Reached</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You have reached your {tier.listing_limit}-listing tier limit. Deactivate an existing listing or{' '}
                <Link to="/marketplace/agent/profile" className="font-semibold text-flame-600 hover:underline">complete verification</Link>{' '}
                to increase your limit.
              </p>
            </div>
          </div>
        )}

        {/* Listings */}
        <div className="rounded-2xl border border-border bg-white shadow-card">
          <div className="border-b border-border p-4">
            <h2 className="font-heading text-base font-bold text-brand-900">My Listings</h2>
          </div>
          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === t.key ? 'bg-brand-900 text-white' : 'text-muted-foreground hover:bg-brand-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && <div className="m-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>}

          {/* Listings list */}
          <div className="p-4">
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Home className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {tab === 'all' ? 'No listings yet. Click "Post New Property" to create your first advertisement.' : `No ${tab === 'pending_approval' ? 'pending' : tab} listings.`}
                </p>
                {tab === 'all' && (
                  <Button asChild className="mt-4 bg-flame-500 text-white hover:bg-flame-600">
                    <Link to="/marketplace/agent/properties/new"><Plus className="mr-1.5 h-4 w-4" /> Post New Property</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredListings.map((listing) => (
                  <AgentListingCard
                    key={listing.id}
                    listing={listing}
                    onAction={handleAction}
                    actionLoading={actionLoading === listing.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline" className="border-brand-200 hover:bg-brand-50">
            <Link to="/marketplace"><Home className="mr-1.5 h-4 w-4" /> Marketplace</Link>
          </Button>
        </div>
      </div>
      <MarketplaceFooter />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="font-heading text-xl font-bold text-brand-900">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}