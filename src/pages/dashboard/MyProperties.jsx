import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Building2, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { formatPrice, buildShortLocation, ACTIVE_STATUSES } from '@/lib/property-utils';
import PropertyListingForm from '@/components/dashboard/PropertyListingForm';

const STATUS_TONE = {
  published: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-600',
  sold: 'bg-rose-100 text-rose-700',
  reserved: 'bg-amber-100 text-amber-700',
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
      const res = await base44.entities.Property.filter(
        { $or: [{ owner_id: user.id }, { listing_agent_id: user.id }, { created_by_id: user.id }] },
        '-created_date', 200
      ).catch(() => []);
      setListings(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property listing? This cannot be undone.')) return;
    try {
      await base44.entities.Property.delete(id);
      setListings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert('Failed to delete listing.');
    }
  };

  const stats = {
    total: listings.length,
    published: listings.filter((p) => ACTIVE_STATUSES.includes(p.status)).length,
    views: listings.reduce((s, p) => s + (p.view_count || 0), 0),
    saved: listings.reduce((s, p) => s + (p.favorite_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Property Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit and manage your properties. Published listings appear live on the public site.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-flame-500 hover:bg-flame-600">
          <Plus className="mr-1 h-4 w-4" /> List a Property
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Building2} label="Total Listings" value={stats.total} tone="text-brand-700" />
        <StatCard icon={Eye} label="Published" value={stats.published} tone="text-emerald-500" />
        <StatCard icon={Eye} label="Total Views" value={stats.views} tone="text-flame-500" />
        <StatCard icon={Building2} label="Times Saved" value={stats.saved} tone="text-info" />
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          <p className="mt-3 text-sm text-muted-foreground">Loading your listings…</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No listings yet</h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">Create your first property listing to showcase it on Property Question Nigeria.</p>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-5 bg-flame-500 hover:bg-flame-600">
            <Plus className="mr-1 h-4 w-4" /> List a Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:shadow-card-hover">
              <div className="relative h-40 overflow-hidden bg-muted">
                {p.featured_image_url || p.image_urls?.[0] ? (
                  <Image src={p.featured_image_url || p.image_urls[0]} alt={p.title} fittingType="fill" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><Building2 className="h-8 w-8 text-muted-foreground/40" /></div>
                )}
                <span className={`absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_TONE[p.status] || 'bg-slate-100 text-slate-600'}`}>
                  {p.status}
                </span>
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  <Eye className="h-3 w-3" /> {p.view_count || 0}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate font-heading text-sm font-bold text-foreground">{p.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {buildShortLocation(p) || '—'}
                </p>
                <p className="mt-2 font-heading text-base font-bold text-flame-600">{formatPrice(p.price)}</p>
                <div className="mt-3 flex items-center gap-1">
                  <Link to={`/properties/${p.id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    <ExternalLink className="h-3.5 w-3.5" /> View
                  </Link>
                  <button onClick={() => { setEditing(p); setFormOpen(true); }} className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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