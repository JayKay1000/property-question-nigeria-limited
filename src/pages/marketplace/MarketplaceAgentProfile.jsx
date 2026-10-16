import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, IdCard, MapPin, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TIER_CONFIG, VERIFICATION_STATUS_CONFIG } from '@/lib/marketplace-utils';
import VerificationSubmit from '@/components/marketplace/VerificationSubmit';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';

export default function MarketplaceAgentProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showIdentitySubmit, setShowIdentitySubmit] = useState(false);
  const [showAddressSubmit, setShowAddressSubmit] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await base44.functions.invoke('getMarketplaceAgentProfile', {});
      setProfile(res.data);
    } catch {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf9]">
        <MarketplaceHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
        </div>
        <MarketplaceFooter />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fbfaf9]">
        <MarketplaceHeader />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-lg font-bold text-brand-900">Agent Profile Not Found</h1>
          <p className="mt-1 text-sm text-muted-foreground">You need an agent account to view this page.</p>
          <Button asChild className="mt-5 bg-flame-500 text-white hover:bg-flame-600">
            <Link to="/marketplace/agent/register">Become an Agent</Link>
          </Button>
        </div>
        <MarketplaceFooter />
      </div>
    );
  }

  const { agent, tier, verification, verifications } = profile;
  const tierConfig = TIER_CONFIG[tier.effective_tier] || TIER_CONFIG.basic;
  const identityConfig = VERIFICATION_STATUS_CONFIG[verification.identity_status] || VERIFICATION_STATUS_CONFIG.not_submitted;
  const addressConfig = VERIFICATION_STATUS_CONFIG[verification.address_status] || VERIFICATION_STATUS_CONFIG.not_submitted;

  const canSubmitIdentity = verification.identity_status !== 'pending' && agent.status !== 'suspended';
  const canSubmitAddress = verification.identity_approved && verification.address_status !== 'pending' && agent.status !== 'suspended';

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      <MarketplaceHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-900">{agent.full_name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{agent.email} · {agent.phone}</p>
            {agent.agent_code && <Badge variant="secondary" className="mt-2 bg-brand-50 text-brand-700 border-0">{agent.agent_code}</Badge>}
          </div>
          <div className="text-right">
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${tierConfig.badge}`}>{tierConfig.label}</span>
            <p className="mt-1 text-xs text-muted-foreground">{tier.listing_limit_display} listings</p>
          </div>
        </div>

        {/* Listing capacity */}
        <div className="mb-6 rounded-2xl border border-border bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-heading font-bold text-brand-900">Listing Capacity</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-heading font-bold text-brand-900">{tier.active_listings}</p>
              <p className="text-xs text-muted-foreground">Active published listings</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-heading font-bold text-flame-600">
                {tier.listing_limit === null ? '∞' : tier.listing_limit}
              </p>
              <p className="text-xs text-muted-foreground">Maximum allowed</p>
            </div>
          </div>
          {tier.listing_limit !== null && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full rounded-full bg-flame-500 transition-all" style={{ width: `${Math.min(100, (tier.active_listings / tier.listing_limit) * 100)}%` }} />
            </div>
          )}
          <p className={`mt-2 text-xs ${tier.can_publish ? 'text-success' : 'text-error'}`}>
            {tier.can_publish
              ? `You can publish ${tier.remaining === null ? 'unlimited' : tier.remaining} more ${tier.remaining === 1 ? 'listing' : 'listings'}.`
              : 'You have reached your listing limit. Verify your identity or address to increase it.'}
          </p>
        </div>

        {/* Verification cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Identity verification */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
                <IdCard className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-brand-900">Tier 2: Identity</h3>
                <p className="text-xs text-muted-foreground">Government-issued ID</p>
              </div>
            </div>
            <StatusBadge config={identityConfig} />
            <p className="mt-2 text-xs text-muted-foreground">
              {verification.identity_approved
                ? 'Your identity is verified. You can now request address verification.'
                : verification.identity_status === 'pending'
                ? 'Your document is under review. We will notify you once approved.'
                : verification.identity_status === 'rejected'
                ? 'Your submission was rejected. Please review the reason and resubmit.'
                : 'Submit a government-issued ID to increase your limit to 50 listings.'}
            </p>
            {verification.identity_status === 'rejected' && verifications.find((v) => v.verification_type === 'identity' && v.status === 'rejected')?.rejection_reason && (
              <div className="mt-2 rounded-lg border border-error/20 bg-error/5 p-2.5">
                <p className="text-xs text-error">{verifications.find((v) => v.verification_type === 'identity' && v.status === 'rejected').rejection_reason}</p>
              </div>
            )}
            {canSubmitIdentity && !showIdentitySubmit && (
              <Button onClick={() => setShowIdentitySubmit(true)} variant="outline" size="sm" className="mt-3 w-full border-brand-200 hover:bg-brand-50">
                {verification.identity_status === 'rejected' ? 'Resubmit Identity Document' : 'Submit Identity Document'} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
            {showIdentitySubmit && (
              <VerificationSubmit type="identity" onDone={() => { setShowIdentitySubmit(false); loadProfile(); }} onCancel={() => setShowIdentitySubmit(false)} />
            )}
          </div>

          {/* Address verification */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-brand-900">Tier 3: Address</h3>
                <p className="text-xs text-muted-foreground">Proof of address</p>
              </div>
            </div>
            {!verification.identity_approved ? (
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                <p className="text-xs text-warning">Identity verification must be approved before you can submit address verification.</p>
              </div>
            ) : (
              <>
                <StatusBadge config={addressConfig} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {verification.address_approved
                    ? 'Your address is verified. You have unlimited listings.'
                    : verification.address_status === 'pending'
                    ? 'Your document is under review.'
                    : verification.address_status === 'rejected'
                    ? 'Your submission was rejected. Please review and resubmit.'
                    : 'Submit proof of address to unlock unlimited listings.'}
                </p>
                {verification.address_status === 'rejected' && verifications.find((v) => v.verification_type === 'address' && v.status === 'rejected')?.rejection_reason && (
                  <div className="mt-2 rounded-lg border border-error/20 bg-error/5 p-2.5">
                    <p className="text-xs text-error">{verifications.find((v) => v.verification_type === 'address' && v.status === 'rejected').rejection_reason}</p>
                  </div>
                )}
                {canSubmitAddress && !showAddressSubmit && (
                  <Button onClick={() => setShowAddressSubmit(true)} variant="outline" size="sm" className="mt-3 w-full border-brand-200 hover:bg-brand-50">
                    {verification.address_status === 'rejected' ? 'Resubmit Address Document' : 'Submit Address Document'} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
                {showAddressSubmit && (
                  <VerificationSubmit type="address" onDone={() => { setShowAddressSubmit(false); loadProfile(); }} onCancel={() => setShowAddressSubmit(false)} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-5 rounded-xl border border-border bg-brand-50/50 p-4">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-brand-800"><ShieldCheck className="h-3.5 w-3.5" /> Document Privacy</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Your verification documents are stored in private, access-controlled storage. Only authorized PQNL reviewers can view them. Documents are never published publicly or shown in marketplace listings. You may resubmit if a document is rejected.
          </p>
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

function StatusBadge({ config }) {
  const Icon = config.label === 'Approved' ? CheckCircle2 : config.label === 'Pending Review' ? Clock : config.label === 'Rejected' ? XCircle : null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badge}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}