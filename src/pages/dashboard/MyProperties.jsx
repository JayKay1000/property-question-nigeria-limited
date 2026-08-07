import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Building2, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { formatPrice, buildShortLocation } from '@/lib/property-utils';
import PropertyListingForm from '@/components/dashboard/PropertyListingForm';

const STATUS_TONE = {
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-amber-100 text-amber-700',
  poa_requested: 'bg-amber-100 text-amber-700',
  poa_signed: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

const STATUS_LABEL = {
  submitted: 'Pending Approval',
  under_review: 'Under Review',
  poa_requested: 'POA Requested',
  poa_signed: 'POA Signed',
  approved: 'Approved & Live',
  rejected: 'Rejected',
};

const PENDING_STATUSES = ['submitted', 'under_review', 'poa_requested', 'poa_signed'];

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

export default function MyProperties() {
  const rbac = useRBAC();
  const user = rbac.user;
  const isAgent = rbac.isAgent || user?.account_type === 'agent';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await base44.entities.PropertyListing.filter(
        { $or: [{ owner_id: user.id }, { created_by_id: user.id }] },
        '-created_date', 200
      ).catch(() => []);
      setListings(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property submission? This cannot be undone.')) return;
    try {
      await base44.entities.PropertyListing.delete(id);
      setListings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert('Failed to delete submission.');
    }
  };

  const stats = {
    total: listings.length,
    pending: listings.filter((p) => PENDING_STATUSES.includes(p.status)).length,
    approved: listings.filter((p) => p.status === 'approved').length,
    rejected: listings.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Property Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submit properties for review. Approved listings appear live on the public site.</p>
        </div>
        {!isAgent && (
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-flame-500 hover:bg-flame-600">
            <Plus className="mr-1 h-4 w-4" /> List a Property
          </Button>
        )}
      </div>
      {isAgent && (
        <div className="rounded-xl border border-info/20 bg-info/5 p-4 text-sm text-info">
          Property submissions are handled by property owners. As an agent, you market and sell verified listings — uploading is not available.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Building2} label="Total Submissions" value={stats.total} tone="text-brand-700" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} tone="text-amber-500" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="text-emerald-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="text-rose-500" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          <p className="mt-3 text-sm text-muted-foreground">Loading your listings…</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No submissions yet</h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">Submit your first property for review. It goes live once approved by our team.</p>
          {!isAgent && (
            <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-5 bg-flame-500 hover:bg-flame-600">
              <Plus className="mr-1 h-4 w-4" /> List a Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => {
            const img = p.featured_image_url || p.image_urls?.[0] || p.photo_urls?.[0];
            const isLive = p.status === 'approved' && p.approved_property_id;
            return (
              <div key={p.id} className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:shadow-card-hover">
                <div className="relative h-40 overflow-hidden bg-muted">
                  {img ? (
                    <Image src={img} alt={p.property_title} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><Building2 className="h-8 w-8 text-muted-foreground/40" /></div>
                  )}
                  <span className={`absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_TONE[p.status] || 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-heading text-sm font-bold text-foreground">{p.property_title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {buildShortLocation(p) || p.property_address || '—'}
                  </p>
                  <p className="mt-2 font-heading text-base font-bold text-flame-600">{formatPrice(p.preferred_price)}</p>
                  <div className="mt-3 flex items-center gap-1">
                    {isLive ? (
                      <Link to={`/properties/${p.approved_property_id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                        <ExternalLink className="h-3.5 w-3.5" /> View Live
                      </Link>
                    ) : (
                      <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-border px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Not yet live
                      </span>
                    )}
                    <button onClick={() => { setEditing(p); setFormOpen(true); }} className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-muted">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PropertyListingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={load}
        editing={editing}
        user={user}
        isAgent={isAgent}
      />
    </div>
  );
}