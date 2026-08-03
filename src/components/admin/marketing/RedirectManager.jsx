import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, GitFork, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { redirectTypeConfig, formatDate } from '@/lib/seo-utils';

export default function RedirectManager() {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setRedirects(await base44.entities.URLRedirect.list('-created_date', 200)); }
    catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.URLRedirect.delete(id); toast({ title: 'Redirect removed' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filtered = redirects.filter(r => !query || r.source_url?.toLowerCase().includes(query.toLowerCase()) || r.target_url?.toLowerCase().includes(query.toLowerCase()));
  const activeCount = redirects.filter(r => r.status === 'active').length;
  const totalHits = redirects.reduce((sum, r) => sum + (r.hit_count || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><GitFork className="w-5 h-5 text-flame-500" /> URL Redirects ({redirects.length})</h2>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="bg-success/10 text-success border-0">{activeCount} Active</Badge>
          <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0">{totalHits.toLocaleString()} Total Hits</Badge>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-40" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Redirect</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No redirects configured.</Card>}
        {!loading && filtered.map(r => (
          <Card key={r.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="secondary" className={redirectTypeConfig[r.redirect_type]?.className || ''}>{redirectTypeConfig[r.redirect_type]?.label || r.redirect_type}</Badge>
                {r.status === 'active' ? <Badge variant="secondary" className="bg-success/10 text-success border-0">Active</Badge> : <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">{r.status}</Badge>}
              </div>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="font-mono text-error line-through">{r.source_url}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-success">{r.target_url}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span>{(r.hit_count || 0).toLocaleString()} hits</span>
                {r.last_hit && <span>Last hit {formatDate(r.last_hit)}</span>}
                {r.expires_at && <span>Expires {formatDate(r.expires_at)}</span>}
                {r.notes && <span className="truncate">· {r.notes}</span>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <RedirectEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function RedirectEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => { setForm(record ? { ...record } : { redirect_type: '301', status: 'active' }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.source_url || !form.target_url) { toast({ title: 'Source and target URLs required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.URLRedirect.update(record.id, form); toast({ title: 'Redirect updated' }); }
      else { await base44.entities.URLRedirect.create(form); toast({ title: 'Redirect created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Redirect' : 'Add Redirect'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Source URL (old) *</Label><Input value={form.source_url || ''} placeholder="/old-page" onChange={e => set('source_url', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Target URL (new) *</Label><Input value={form.target_url || ''} placeholder="/new-page" onChange={e => set('target_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Redirect Type</Label>
            <Select value={form.redirect_type || '301'} onValueChange={v => set('redirect_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(redirectTypeConfig).map(k => <SelectItem key={k} value={k}>{redirectTypeConfig[k].label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status || 'active'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Notes</Label><Textarea value={form.notes || ''} rows={2} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}