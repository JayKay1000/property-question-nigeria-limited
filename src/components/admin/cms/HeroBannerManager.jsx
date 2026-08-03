import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { statusConfig, formatDate, truncate } from '@/lib/cms-utils';

export default function HeroBannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SiteContent.filter({ content_type: 'banner' }, 'sort_order', 50);
      setBanners(data);
    } catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.SiteContent.delete(id); toast({ title: 'Banner removed' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Image className="w-5 h-5 text-flame-500" /> Hero Banners ({banners.length})</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Banner</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <Card className="p-8 text-center text-muted-foreground md:col-span-2">Loading…</Card>}
        {!loading && banners.length === 0 && <Card className="p-8 text-center text-muted-foreground md:col-span-2">No hero banners configured.</Card>}
        {!loading && banners.map(b => (
          <Card key={b.id} className="overflow-hidden">
            <div className="aspect-[16/6] bg-brand-100 relative">
              {b.metadata?.image_url ? (
                <img src={b.metadata.image_url} alt={b.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Image className="w-10 h-10" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-heading font-bold text-lg">{b.title || 'Untitled Banner'}</h3>
                {b.content && <p className="text-white/80 text-sm truncate">{truncate(b.content, 80)}</p>}
              </div>
              {b.status && <Badge variant="secondary" className={`absolute top-3 right-3 ${statusConfig[b.status]?.className || ''}`}>{statusConfig[b.status]?.label || b.status}</Badge>}
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span className="font-mono">{b.content_key}</span> · Updated {formatDate(b.updated_date)}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <BannerEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function BannerEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setForm(record ? { ...record, metadata: record.metadata || {} } : { content_type: 'banner', status: 'published', metadata: {} });
  }, [record, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setMeta = (k, v) => setForm(p => ({ ...p, metadata: { ...p.metadata, [k]: v } }));

  const save = async () => {
    if (!form.content_key) { toast({ title: 'Content key required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.SiteContent.update(record.id, form); toast({ title: 'Banner updated' }); }
      else { await base44.entities.SiteContent.create(form); toast({ title: 'Banner created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Banner' : 'New Hero Banner'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5"><Label>Content Key *</Label><Input value={form.content_key || ''} placeholder="home_hero" onChange={e => set('content_key', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status || 'published'} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Heading / Title</Label><Input value={form.title || ''} onChange={e => set('title', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Subtext</Label><Textarea value={form.content || ''} rows={2} onChange={e => set('content', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Background Image URL</Label><Input value={form.metadata?.image_url || ''} placeholder="https://…" onChange={e => setMeta('image_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CTA Button Label</Label><Input value={form.metadata?.cta_label || ''} placeholder="Browse Properties" onChange={e => setMeta('cta_label', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CTA Button URL</Label><Input value={form.metadata?.cta_url || ''} placeholder="/properties" onChange={e => setMeta('cta_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', Number(e.target.value))} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}