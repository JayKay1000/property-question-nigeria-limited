import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, Bell, BellOff, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function SavedSearches({ currentQuery, currentFilters, userId }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [alertsToggling, setAlertsToggling] = useState(null);

  const load = async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const results = await base44.entities.SavedSearch.filter({ user_id: userId }, '-created_date', 20);
      setSavedSearches(results);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [userId]);

  const handleSave = async () => {
    if (!name.trim() || !userId) return;
    setSaving(true);
    try {
      await base44.entities.SavedSearch.create({
        user_id: userId,
        search_name: name.trim(),
        search_query: currentQuery || '',
        filters: currentFilters || {},
        result_type: 'all',
        alerts_enabled: false,
      });
      toast({ title: 'Search saved!', description: 'You\'ll be notified of new matching properties.' });
      setName('');
      load();
    } catch { toast({ title: 'Failed to save', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.SavedSearch.delete(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch { /* silent */ }
  };

  const toggleAlerts = async (search) => {
    setAlertsToggling(search.id);
    try {
      await base44.entities.SavedSearch.update(search.id, { alerts_enabled: !search.alerts_enabled });
      load();
    } catch { /* silent */ }
    finally { setAlertsToggling(null); }
  };

  const runSearch = (search) => {
    const params = new URLSearchParams();
    if (search.search_query) params.set('q', search.search_query);
    navigate(`/search?${params.toString()}`);
  };

  if (!userId) return null;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Save className="h-4 w-4 text-flame-500" /> Saved Searches</h3>

      {/* Save current search */}
      {currentQuery && (
        <div className="mt-3 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name this search..." className="h-9 bg-ice-50 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
          <Button onClick={handleSave} disabled={saving || !name.trim()} size="sm" className="shrink-0 bg-flame-500 hover:bg-flame-600">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="mt-3 flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-brand-300" /></div>
      ) : savedSearches.length > 0 ? (
        <div className="mt-3 space-y-2">
          {savedSearches.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg border border-brand-100 bg-ice-50 p-3">
              <button onClick={() => runSearch(s)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-brand-900">{s.search_name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.search_query || 'All properties'} {s.last_match_count > 0 && `• ${s.last_match_count} matches`}</p>
              </button>
              <button onClick={() => toggleAlerts(s)} disabled={alertsToggling === s.id} className="rounded p-1.5 text-brand-400 hover:bg-white hover:text-flame-500" title={s.alerts_enabled ? 'Disable alerts' : 'Enable alerts'}>
                {s.alerts_enabled ? <Bell className="h-4 w-4 text-flame-500" /> : <BellOff className="h-4 w-4" />}
              </button>
              <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-brand-400 hover:bg-white hover:text-error" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center py-4 text-center">
          <SearchIcon className="h-6 w-6 text-brand-200" />
          <p className="mt-1 text-xs text-muted-foreground">No saved searches yet</p>
        </div>
      )}
    </div>
  );
}