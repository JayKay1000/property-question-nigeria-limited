import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { slotStatusConfig, resourceTypeLabels, formatDateTime, formatCurrency } from '@/lib/platform-utils';

export default function AvailabilityManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setSlots(await base44.entities.BookingSlot.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.BookingSlot.delete(id); toast({ title: 'Slot removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const filtered = slots.filter(s => !query || s.resource_name?.toLowerCase().includes(query.toLowerCase()) || s.title?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-flame-500" /> Availability Slots ({slots.length})</h2>
        <div className="flex gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-40" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Slot</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No slots configured.</Card>}
        {!loading && filtered.map(s => (
          <Card key={s.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-heading font-semibold truncate">{s.title || `${resourceTypeLabels[s.resource_type]} slot`}</h3>
                <Badge variant="secondary" className={slotStatusConfig[s.status]?.className || ''}>{slotStatusConfig[s.status]?.label || s.status}</Badge>
                <Badge variant="outline" className="capitalize">{resourceTypeLabels[s.resource_type]}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                <span>{s.resource_name || 'General'}</span>
                <span>{formatDateTime(s.start_time)} → {formatDateTime(s.end_time)}</span>
                <span>Booked {s.booked_count || 0}/{s.capacity || 1}</span>
                {s.location && <span>{s.location}</span>}
                {s.agent_name && <span>Agent: {s.agent_name}</span>}
                {s.price > 0 && <span className="text-flame-600 font-medium">{formatCurrency(s.price)}</span>}
                {s.recurring && <span className="text-ice-600">Recurring</span>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <SlotEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function SlotEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => { setForm(record ? { ...record } : { resource_type: 'consultation', status: 'available', capacity: 1, booked_count: 0, price: 0, recurring: false }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.start_time || !form.end_time) { toast({ title: 'Start and end times required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, slot_code: form.slot_code || `SLOT-${Date.now().toString(36).toUpperCase()}`, day_of_week: form.day_of_week || (form.start_time ? new Date(form.start_time).toLocaleDateString('en-NG', { weekday: 'long' }) : '') };
      if (record?.id) { await base44.entities.BookingSlot.update(record.id, payload); toast({ title: 'Slot updated' }); }
      else { await base44.entities.BookingSlot.create(payload); toast({ title: 'Slot created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Slot' : 'Add Slot'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Title</Label><Input value={form.title || ''} placeholder="Morning Tour Slot" onChange={e => set('title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Resource Type</Label><Select value={form.resource_type || 'consultation'} onValueChange={v => set('resource_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(resourceTypeLabels).map(m => <SelectItem key={m} value={m}>{resourceTypeLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Resource Name</Label><Input value={form.resource_name || ''} onChange={e => set('resource_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Start Time *</Label><Input type="datetime-local" value={form.start_time ? form.start_time.slice(0, 16) : ''} onChange={e => set('start_time', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
          <div className="space-y-1.5"><Label>End Time *</Label><Input type="datetime-local" value={form.end_time ? form.end_time.slice(0, 16) : ''} onChange={e => set('end_time', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
          <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" min={1} value={form.capacity ?? 1} onChange={e => set('capacity', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'available'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(slotStatusConfig).map(m => <SelectItem key={m} value={m}>{slotStatusConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Agent</Label><Input value={form.agent_name || ''} onChange={e => set('agent_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Location</Label><Input value={form.location || ''} onChange={e => set('location', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Price (₦)</Label><Input type="number" value={form.price ?? 0} onChange={e => set('price', Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" id="recurring" checked={!!form.recurring} onChange={e => set('recurring', e.target.checked)} className="h-4 w-4 rounded border-input accent-flame-500" /><Label htmlFor="recurring">Recurring weekly</Label></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Notes</Label><Textarea value={form.notes || ''} rows={2} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}