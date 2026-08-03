import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Droplet, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { watermarkPositionLabels, applyToLabels } from '@/lib/enterprise-ops-utils';

export default function WatermarkManager() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setConfigs(await base44.entities.WatermarkConfig.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.WatermarkConfig.delete(id); toast({ title: 'Watermark config removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const toggle = async (c) => { try { await base44.entities.WatermarkConfig.update(c.id, { status: c.status === 'active' ? 'inactive' : 'active' }); toast({ title: `Watermark ${c.status === 'active' ? 'disabled' : 'enabled'}` }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Droplet className="w-5 h-5 text-flame-500" /> Watermark Configs ({configs.length})</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Config</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <Card className="p-8 text-center text-muted-foreground md:col-span-2">Loading…</Card>}
        {!loading && configs.length === 0 && <Card className="p-8 text-center text-muted-foreground md:col-span-2">No watermark configs.</Card>}
        {!loading && configs.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-heading font-semibold truncate">{c.name}</h3>
                  {c.status === 'active' ? <Badge variant="secondary" className="bg-success/10 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge> : <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">Inactive</Badge>}
                </div>
                {c.watermark_text && <p className="text-sm font-medium mb-1.5 truncate">"{c.watermark_text}"</p>}
                <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                  <span>{watermarkPositionLabels[c.position]}</span>
                  <span>Opacity {c.opacity || 70}%</span>
                  <span>Scale {c.scale || 30}%</span>
                  <span className="capitalize">{applyToLabels[c.apply_to]}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Preview:</span>
                  <span className="px-2 py-1 rounded text-xs font-medium" style={{ color: c.text_color || '#fff', backgroundColor: 'rgba(0,26,61,0.7)', opacity: (c.opacity || 70) / 100 }}>{c.watermark_text || 'Watermark'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => toggle(c)} title={c.status === 'active' ? 'Disable' : 'Enable'}><CheckCircle2 className={`w-4 h-4 ${c.status === 'active' ? 'text-success' : 'text-muted-foreground'}`} /></Button>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <WatermarkEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function WatermarkEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => { setForm(record ? { ...record } : { position: 'bottom-right', opacity: 70, scale: 30, text_color: '#FFFFFF', font_size: 24, apply_to: 'all', status: 'active' }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, config_code: form.config_code || `WM-${Date.now().toString(36).toUpperCase()}` };
      if (record?.id) { await base44.entities.WatermarkConfig.update(record.id, payload); toast({ title: 'Config updated' }); }
      else { await base44.entities.WatermarkConfig.create(payload); toast({ title: 'Config created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Watermark Config' : 'New Watermark Config'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name || ''} placeholder="Default Brand Watermark" onChange={e => set('name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Watermark Text</Label><Input value={form.watermark_text || ''} placeholder="Property Question NG" onChange={e => set('watermark_text', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Position</Label><Select value={form.position || 'bottom-right'} onValueChange={v => set('position', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(watermarkPositionLabels).map(m => <SelectItem key={m} value={m}>{watermarkPositionLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Apply To</Label><Select value={form.apply_to || 'all'} onValueChange={v => set('apply_to', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(applyToLabels).map(m => <SelectItem key={m} value={m}>{applyToLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Opacity (%)</Label><Input type="number" min={0} max={100} value={form.opacity ?? 70} onChange={e => set('opacity', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Scale (%)</Label><Input type="number" min={0} max={100} value={form.scale ?? 30} onChange={e => set('scale', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Text Color</Label><Input value={form.text_color || '#FFFFFF'} onChange={e => set('text_color', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Font Size</Label><Input type="number" value={form.font_size ?? 24} onChange={e => set('font_size', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'active'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Logo URL</Label><Input value={form.logo_url || ''} onChange={e => set('logo_url', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}