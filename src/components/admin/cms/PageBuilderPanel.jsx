import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, LayoutTemplate, Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { statusConfig, formatDate, slugify } from '@/lib/cms-utils';

export default function PageBuilderPanel() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setPages(await base44.entities.LandingPage.list('-created_date', 100)); }
    catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.LandingPage.delete(id); toast({ title: 'Page deleted' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-flame-500" /> Landing Pages ({pages.length})</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Page</Button>
      </div>
      <div className="space-y-3">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && pages.length === 0 && <Card className="p-8 text-center text-muted-foreground">No landing pages yet.</Card>}
        {!loading && pages.map(p => (
          <Card key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-heading font-semibold truncate">{p.page_name}</h3>
                <Badge variant="secondary" className={statusConfig[p.status]?.className || ''}>{statusConfig[p.status]?.label || p.status}</Badge>
                <Badge variant="outline" className="capitalize">{(p.page_type || '').replace(/_/g, ' ')}</Badge>
              </div>
              {p.headline && <p className="text-sm text-muted-foreground truncate">{p.headline}</p>}
              <div className="flex gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                <span className="font-mono">/{p.slug}</span>
                {p.published_at && <span>Published {formatDate(p.published_at)}</span>}
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views || 0} views</span>
                <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {p.conversions || 0} conversions</span>
                {p.conversion_rate != null && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {p.conversion_rate}% conv.</span>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              {p.url && <Button size="icon" variant="ghost" asChild><a href={p.url} target="_blank" rel="noreferrer"><Eye className="w-4 h-4" /></a></Button>}
              <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <PageEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function PageEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setForm(record ? { ...record } : { page_type: 'lead_capture', status: 'draft' });
  }, [record, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.page_name) { toast({ title: 'Page name required', variant: 'destructive' }); return; }
    const payload = { ...form, slug: form.slug || slugify(form.page_name) };
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.LandingPage.update(record.id, payload); toast({ title: 'Page updated' }); }
      else { await base44.entities.LandingPage.create(payload); toast({ title: 'Page created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Landing Page' : 'New Landing Page'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Page Name *</Label><Input value={form.page_name || ''} onChange={e => set('page_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug || ''} placeholder="auto-generated" onChange={e => set('slug', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Page Type</Label>
            <Select value={form.page_type || 'lead_capture'} onValueChange={v => set('page_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['property_launch', 'buy2flip', 'lead_capture', 'event', 'newsletter_signup', 'promotional', 'informational'].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Headline</Label><Input value={form.headline || ''} onChange={e => set('headline', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Hero Image URL</Label><Input value={form.hero_image_url || ''} onChange={e => set('hero_image_url', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={form.description || ''} rows={3} onChange={e => set('description', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Conversion Goal</Label><Input value={form.conversion_goal || ''} placeholder="Form submit" onChange={e => set('conversion_goal', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status || 'draft'} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['draft', 'published', 'unpublished', 'archived'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>SEO Title</Label><Input value={form.seo_title || ''} onChange={e => set('seo_title', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>SEO Description</Label><Textarea value={form.seo_description || ''} rows={2} onChange={e => set('seo_description', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}