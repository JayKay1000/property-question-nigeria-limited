import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Play, Eye, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import HeroTaglineRotator from '@/components/home/HeroTaglineRotator';

const STYLES = [
  { value: 'fade', label: 'Fade' },
  { value: 'typing', label: 'Typing' },
  { value: 'word_by_word', label: 'Word-by-word' },
  { value: 'slide', label: 'Slide' },
  { value: 'blur', label: 'Blur transition' },
];

export default function HeroTaglineManager() {
  const { toast } = useToast();
  const [taglines, setTaglines] = useState([]);
  const [settings, setSettings] = useState({ animation_style: 'fade' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [tl, st] = await Promise.all([
        base44.entities.HeroTagline.list('sort_order', 100),
        base44.entities.SiteContent.filter({ content_key: 'hero_tagline_settings' }, '-updated_date', 1),
      ]);
      setTaglines(Array.isArray(tl) ? tl : []);
      if (Array.isArray(st) && st[0]) {
        setSettings(st[0].metadata || { animation_style: 'fade' });
        setSettings((s) => ({ ...s, _id: st[0].id }));
      }
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async (style) => {
    const next = { ...settings, animation_style: style };
    setSettings(next);
    try {
      if (settings._id) {
        await base44.entities.SiteContent.update(settings._id, { metadata: { animation_style: style } });
      } else {
        const rec = await base44.entities.SiteContent.create({
          content_key: 'hero_tagline_settings',
          content_type: 'settings',
          title: 'Hero Tagline Settings',
          metadata: { animation_style: style },
          status: 'published',
        });
        setSettings((s) => ({ ...s, _id: rec.id }));
      }
      toast({ title: 'Default animation updated' });
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    try { await base44.entities.HeroTagline.delete(id); toast({ title: 'Tagline removed' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const toggleEnabled = async (t) => {
    try { await base44.entities.HeroTagline.update(t.id, { is_enabled: !t.is_enabled }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const onDragEnd = async (res) => {
    if (!res.destination || res.destination.index === res.source.index) return;
    const reordered = Array.from(taglines);
    const [moved] = reordered.splice(res.source.index, 1);
    reordered.splice(res.destination.index, 0, moved);
    setTaglines(reordered);
    try {
      await base44.entities.HeroTagline.bulkUpdate(
        reordered.map((t, i) => ({ id: t.id, sort_order: i + 1 }))
      );
    } catch { toast({ title: 'Reorder failed', variant: 'destructive' }); load(); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-flame-500" /> Hero Taglines ({taglines.length})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Default animation</Label>
            <Select value={settings.animation_style} onValueChange={saveSettings}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPreview(true)}><Eye className="w-4 h-4 mr-1" /> Preview</Button>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0 h-9"><Plus className="w-4 h-4 mr-1" /> New Tagline</Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Drag to reorder. Each tagline can override the default animation and set its own display duration. Mark a tagline as <span className="font-medium text-flame-600">special</span> for the distinctive brand finale (glow, underline, longer hold, CTA highlight).
      </p>

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading…</Card>
      ) : taglines.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No taglines yet. Add your first hero tagline.</Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="taglines">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {taglines.map((t, i) => (
                  <Draggable key={t.id} draggableId={t.id} index={i}>
                    {(p, snap) => (
                      <Card
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className={`p-3 flex items-start gap-3 ${snap.isDragging ? 'shadow-card-hover ring-2 ring-flame-400' : ''} ${!t.is_enabled ? 'opacity-60' : ''}`}>
                        <button {...p.dragHandleProps} className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
                          <GripVertical className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t.tagline_text}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="capitalize">{t.animation_style === 'default' ? `${settings.animation_style} (default)` : t.animation_style}</Badge>
                            <Badge variant="outline">{t.display_duration}s</Badge>
                            {t.is_special && <Badge className="bg-flame-500 text-white border-0">Special finale</Badge>}
                            <Switch checked={t.is_enabled} onCheckedChange={() => toggleEnabled(t)} />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <TaglineEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} count={taglines.length} />
      <PreviewDialog open={preview} onClose={() => setPreview(false)} taglines={taglines} defaultStyle={settings.animation_style} />
    </div>
  );
}

function TaglineEditor({ open, onClose, record, onSaved, count }) {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(record ? {
      tagline_text: record.tagline_text || '',
      display_duration: record.display_duration ?? 5,
      animation_style: record.animation_style || 'default',
      is_special: !!record.is_special,
      is_enabled: record.is_enabled !== false,
      sort_order: record.sort_order ?? count + 1,
    } : {
      tagline_text: '', display_duration: 5, animation_style: 'default',
      is_special: false, is_enabled: true, sort_order: count + 1,
    });
  }, [record, open, count]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.tagline_text?.trim()) { toast({ title: 'Tagline text is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.HeroTagline.update(record.id, form); toast({ title: 'Tagline updated' }); }
      else { await base44.entities.HeroTagline.create(form); toast({ title: 'Tagline created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Tagline' : 'New Hero Tagline'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Tagline text *</Label>
            <Textarea value={form.tagline_text || ''} rows={2} onChange={(e) => set('tagline_text', e.target.value)} placeholder="The Future of Nigerian Real Estate" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display duration (seconds)</Label>
              <Input type="number" min={2} max={20} value={form.display_duration} onChange={(e) => set('display_duration', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Animation style</Label>
              <Select value={form.animation_style || 'default'} onValueChange={(v) => set('animation_style', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (use global)</SelectItem>
                  {STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Special finale tagline</Label>
              <p className="text-xs text-muted-foreground">Glow, underline, longer hold, CTA highlight</p>
            </div>
            <Switch checked={form.is_special} onCheckedChange={(v) => set('is_special', v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="cursor-pointer">Enabled</Label>
            <Switch checked={form.is_enabled} onCheckedChange={(v) => set('is_enabled', v)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({ open, onClose, taglines, defaultStyle }) {
  const active = taglines.filter((t) => t.is_enabled).sort((a, b) => a.sort_order - b.sort_order);
  const [i, setI] = useState(0);
  const current = active[i % Math.max(active.length, 1)];

  useEffect(() => { if (open) setI(0); }, [open]);

  useEffect(() => {
    if (!open || !current) return;
    const dur = (current.is_special ? Math.max(current.display_duration, 9) : current.display_duration || 5) * 1000;
    const id = setTimeout(() => setI((x) => (x + 1) % Math.max(active.length, 1)), dur);
    return () => clearTimeout(id);
  }, [i, open, current, active.length]);

  const style = current?.animation_style && current.animation_style !== 'default' ? current.animation_style : defaultStyle;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Play className="w-4 h-4 text-flame-500" /> Live Preview</DialogTitle></DialogHeader>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-10 min-h-[220px] flex items-center justify-center">
          <div className="absolute -right-16 top-10 h-48 w-48 rounded-full bg-ice-400/20 blur-3xl" />
          {current ? (
            <div className="relative text-center">
              <h2 className={`font-heading text-2xl sm:text-3xl font-extrabold leading-tight ${current.is_special ? 'bg-gradient-to-r from-flame-400 via-flame-500 to-ice-300 bg-clip-text text-transparent' : 'text-white'}`} style={current.is_special ? { textShadow: '0 0 30px rgba(255,122,0,0.4)' } : undefined}>
                {current.tagline_text}
              </h2>
              {current.is_special && <div className="mt-3 mx-auto h-[3px] w-40 origin-left rounded-full bg-gradient-to-r from-flame-400 to-ice-300" style={{ boxShadow: '0 0 16px rgba(255,122,0,0.6)' }} />}
              <p className="mt-4 text-xs text-white/50 capitalize">{style} · {current.display_duration}s{current.is_special ? ' · special' : ''}</p>
            </div>
          ) : <p className="text-white/60">No enabled taglines to preview.</p>}
        </div>
        <p className="text-sm text-muted-foreground text-center">This preview cycles your enabled taglines with the configured durations.</p>
      </DialogContent>
    </Dialog>
  );
}