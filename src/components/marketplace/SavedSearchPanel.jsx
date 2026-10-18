import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Trash2, Edit2, Loader2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

function summarizeFilters(f) {
  if (!f) return 'All properties';
  const parts = [];
  if (f.keyword) parts.push(f.keyword);
  if (f.state) parts.push(f.state);
  if (f.lga) parts.push(f.lga);
  if (f.propertyType) parts.push(f.propertyType);
  if (f.purpose) parts.push(f.purpose);
  if (f.priceMin || f.priceMax) parts.push(`${f.priceMin || '0'}-${f.priceMax || '\u221E'}`);
  if (f.bedrooms) parts.push(`${f.bedrooms}+ bed`);
  return parts.length > 0 ? parts.join(' \u2022 ') : 'All properties';
}

export default function SavedSearchPanel() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    try {
      const res = await base44.functions.invoke('manageSavedSearch', { action: 'list' });
      setSearches(res.data?.searches || []);
    } catch {
      /* silent — user may not be authenticated */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await base44.functions.invoke('manageSavedSearch', { action: 'delete', search_id: id });
      setSearches((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Search deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleToggleAlerts = async (search) => {
    setToggling(search.id);
    try {
      await base44.functions.invoke('manageSavedSearch', {
        action: 'update',
        search_id: search.id,
        alerts_enabled: !search.alerts_enabled,
      });
      load();
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setToggling(null);
    }
  };

  const handleRename = async (search) => {
    if (!editName.trim()) { setEditingId(null); return; }
    try {
      await base44.functions.invoke('manageSavedSearch', {
        action: 'update',
        search_id: search.id,
        search_name: editName.trim(),
      });
      setEditingId(null);
      load();
    } catch {
      toast({ title: 'Failed to rename', variant: 'destructive' });
    }
  };

  const runSearch = (search) => {
    const f = search.filters || {};
    const params = new URLSearchParams();
    if (f.state) params.set('state', f.state);
    if (f.propertyType) params.set('propertyType', f.propertyType);
    if (f.purpose) params.set('purpose', f.purpose);
    navigate(`/marketplace?${params.toString()}`);
  };

  if (loading) return null;
  if (searches.length === 0) return null;

  return (
    <section className="container-wide section-pad py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-card transition-colors hover:bg-ice-50"
      >
        <span className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <Save className="h-4 w-4 text-flame-500" /> My Saved Searches
          <Badge variant="secondary" className="ml-1">{searches.length}</Badge>
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {searches.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg border border-brand-100 bg-white p-3 shadow-card">
              <button onClick={() => runSearch(s)} className="min-w-0 flex-1 text-left">
                {editingId === s.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(s)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(s)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <>
                    <p className="truncate text-sm font-medium text-brand-900">{s.search_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {summarizeFilters(s.filters)}
                      {s.last_match_count > 0 && ` \u2022 ${s.last_match_count} matches`}
                    </p>
                  </>
                )}
              </button>
              {s.alerts_enabled && (
                <Badge variant="outline" className="shrink-0 gap-1 text-xs">
                  <Bell className="h-3 w-3 text-flame-500" />
                  {s.alert_frequency === 'immediate' ? 'Live' : s.alert_frequency === 'daily_digest' ? 'Daily' : 'Weekly'}
                </Badge>
              )}
              <button
                onClick={() => handleToggleAlerts(s)}
                disabled={toggling === s.id}
                className="rounded p-1.5 text-brand-400 hover:bg-brand-50 hover:text-flame-500"
                title={s.alerts_enabled ? 'Disable alerts' : 'Enable alerts'}
              >
                {toggling === s.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : s.alerts_enabled ? (
                  <Bell className="h-4 w-4 text-flame-500" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => { setEditingId(s.id); setEditName(s.search_name); }}
                className="rounded p-1.5 text-brand-400 hover:bg-brand-50 hover:text-brand-700"
                title="Rename"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="rounded p-1.5 text-brand-400 hover:bg-brand-50 hover:text-error"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}