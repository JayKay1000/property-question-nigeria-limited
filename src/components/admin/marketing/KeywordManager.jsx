import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { searchIntentLabels, competitionLabels, keywordStatusConfig, difficultyColor, formatNumber } from '@/lib/seo-utils';

export default function KeywordManager() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setKeywords(await base44.entities.SEOKeyword.list('-created_date', 200)); }
    catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.SEOKeyword.delete(id); toast({ title: 'Keyword removed' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filtered = keywords.filter(k => !query || k.keyword?.toLowerCase().includes(query.toLowerCase()) || k.category?.toLowerCase().includes(query.toLowerCase()));

  const RankChange = ({ current, previous }) => {
    if (current == null) return <span className="text-muted-foreground text-xs">—</span>;
    if (previous == null) return <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0">New</Badge>;
    const diff = previous - current;
    if (diff === 0) return <span className="flex items-center text-muted-foreground text-xs"><Minus className="w-3 h-3" /> Same</span>;
    if (diff > 0) return <span className="flex items-center text-success text-xs font-medium"><TrendingUp className="w-3 h-3 mr-0.5" /> +{diff}</span>;
    return <span className="flex items-center text-error text-xs font-medium"><TrendingDown className="w-3 h-3 mr-0.5" /> {diff}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold">Keywords ({keywords.length})</h2>
        <div className="flex gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search keywords…" className="pl-9 w-48" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Keyword</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No keywords tracked yet.</Card>}
        {!loading && filtered.map(k => (
          <Card key={k.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-heading font-semibold truncate">{k.keyword}</h3>
                <Badge variant="secondary" className={keywordStatusConfig[k.status]?.className || ''}>{keywordStatusConfig[k.status]?.label || k.status}</Badge>
                {k.category && <Badge variant="outline" className="capitalize">{k.category}</Badge>}
                <Badge variant="outline" className="capitalize">{searchIntentLabels[k.search_intent]}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                <span>Volume: <span className="font-medium text-foreground">{formatNumber(k.search_volume)}</span></span>
                <span>Difficulty: <span className={`font-medium ${difficultyColor(k.keyword_difficulty)}`}>{k.keyword_difficulty ?? '—'}</span></span>
                <span>Competition: <span className="font-medium capitalize">{competitionLabels[k.competition]}</span></span>
                {k.cpc != null && <span>CPC: ₦{k.cpc}</span>}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center"><p className="text-xs text-muted-foreground">Position</p><p className="font-heading font-bold text-lg">{k.current_ranking ? `#${k.current_ranking}` : '—'}</p></div>
              <div className="text-center min-w-[70px]"><p className="text-xs text-muted-foreground">Change</p><div className="mt-1"><RankChange current={k.current_ranking} previous={k.previous_ranking} /></div></div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(k); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(k.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <KeywordEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function KeywordEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => { setForm(record ? { ...record } : { search_intent: 'informational', competition: 'medium', status: 'tracking' }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.keyword) { toast({ title: 'Keyword required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.SEOKeyword.update(record.id, form); toast({ title: 'Keyword updated' }); }
      else { await base44.entities.SEOKeyword.create({ ...form, last_checked: new Date().toISOString() }); toast({ title: 'Keyword added' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Keyword' : 'Add Keyword'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Keyword / Phrase *</Label><Input value={form.keyword || ''} onChange={e => set('keyword', e.target.value)} placeholder="lagos luxury apartments" /></div>
          <div className="space-y-1.5"><Label>Search Intent</Label>
            <Select value={form.search_intent || 'informational'} onValueChange={v => set('search_intent', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(searchIntentLabels).map(k => <SelectItem key={k} value={k}>{searchIntentLabels[k]}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Competition</Label>
            <Select value={form.competition || 'medium'} onValueChange={v => set('competition', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(competitionLabels).map(k => <SelectItem key={k} value={k}>{competitionLabels[k]}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Search Volume (monthly)</Label><Input type="number" value={form.search_volume ?? ''} onChange={e => set('search_volume', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Keyword Difficulty (0-100)</Label><Input type="number" min={0} max={100} value={form.keyword_difficulty ?? ''} onChange={e => set('keyword_difficulty', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Current Ranking Position</Label><Input type="number" value={form.current_ranking ?? ''} onChange={e => set('current_ranking', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Previous Ranking Position</Label><Input type="number" value={form.previous_ranking ?? ''} onChange={e => set('previous_ranking', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Target URL</Label><Input value={form.target_url || ''} placeholder="/properties" onChange={e => set('target_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Category</Label><Input value={form.category || ''} placeholder="property, project, location" onChange={e => set('category', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CPC (₦)</Label><Input type="number" value={form.cpc ?? ''} onChange={e => set('cpc', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status || 'tracking'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(keywordStatusConfig).map(k => <SelectItem key={k} value={k}>{keywordStatusConfig[k].label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}