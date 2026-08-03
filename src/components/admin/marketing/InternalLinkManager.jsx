import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Link2, LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { linkTypeLabels, formatDate } from '@/lib/seo-utils';

export default function InternalLinkManager() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setLinks(await base44.entities.InternalLink.list('-created_date', 200)); }
    catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.InternalLink.delete(id); toast({ title: 'Link removed' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filtered = links.filter(l => !query || l.anchor_text?.toLowerCase().includes(query.toLowerCase()) || l.source_url?.toLowerCase().includes(query.toLowerCase()) || l.target_url?.toLowerCase().includes(query.toLowerCase()));
  const activeCount = links.filter(l => l.status === 'active').length;
  const brokenCount = links.filter(l => l.status === 'broken').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Link2 className="w-5 h-5 text-flame-500" /> Internal Links ({links.length})</h2>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="bg-success/10 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> {activeCount} Active</Badge>
          {brokenCount > 0 && <Badge variant="secondary" className="bg-error/10 text-error border-0"><XCircle className="w-3 h-3 mr-1" /> {brokenCount} Broken</Badge>}
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-40" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Link</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No internal links tracked.</Card>}
        {!loading && filtered.map(l => (
          <Card key={l.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-flame-600">"{l.anchor_text}"</span>
                <Badge variant="outline" className="capitalize">{linkTypeLabels[l.link_type]}</Badge>
                {l.is_dofollow ? <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0">Do-Follow</Badge> : <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">No-Follow</Badge>}
                {l.status === 'broken' && <Badge variant="secondary" className="bg-error/10 text-error border-0">Broken</Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{l.source_title || l.source_url}</span>
                <LinkIcon className="w-3 h-3 shrink-0" />
                <span className="truncate">{l.target_title || l.target_url}</span>
              </div>
              {l.last_checked && <p className="text-xs text-muted-foreground mt-0.5">Checked {formatDate(l.last_checked)}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <LinkEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function LinkEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => { setForm(record ? { ...record } : { link_type: 'contextual', is_dofollow: true, status: 'active' }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.source_url || !form.target_url || !form.anchor_text) { toast({ title: 'Source, target and anchor text required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, last_checked: new Date().toISOString() };
      if (record?.id) { await base44.entities.InternalLink.update(record.id, payload); toast({ title: 'Link updated' }); }
      else { await base44.entities.InternalLink.create(payload); toast({ title: 'Link added' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Internal Link' : 'Add Internal Link'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Anchor Text *</Label><Input value={form.anchor_text || ''} placeholder="luxury apartments in Lagos" onChange={e => set('anchor_text', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Source URL *</Label><Input value={form.source_url || ''} placeholder="/blog/lagos-market" onChange={e => set('source_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Source Title</Label><Input value={form.source_title || ''} onChange={e => set('source_title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Target URL *</Label><Input value={form.target_url || ''} placeholder="/properties" onChange={e => set('target_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Target Title</Label><Input value={form.target_title || ''} onChange={e => set('target_title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Link Type</Label>
            <Select value={form.link_type || 'contextual'} onValueChange={v => set('link_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(linkTypeLabels).map(k => <SelectItem key={k} value={k}>{linkTypeLabels[k]}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status || 'active'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="broken">Broken</SelectItem><SelectItem value="removed">Removed</SelectItem></SelectContent></Select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="dofollow" checked={!!form.is_dofollow} onChange={e => set('is_dofollow', e.target.checked)} className="h-4 w-4 rounded border-input accent-flame-500" />
            <Label htmlFor="dofollow">Do-Follow</Label>
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