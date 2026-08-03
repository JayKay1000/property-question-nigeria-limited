import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Menu as MenuIcon, GripVertical, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const LOCATIONS = ['header', 'footer', 'mobile', 'sidebar', 'mega_menu'];

export default function MenuManager() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setMenus(await base44.entities.CMSMenu.list('sort_order', 50)); }
    catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.CMSMenu.delete(id); toast({ title: 'Menu deleted' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><MenuIcon className="w-5 h-5 text-flame-500" /> Menus & Footer ({menus.length})</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Menu</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <Card className="p-8 text-center text-muted-foreground md:col-span-2">Loading…</Card>}
        {!loading && menus.length === 0 && <Card className="p-8 text-center text-muted-foreground md:col-span-2">No menus configured.</Card>}
        {!loading && menus.map(m => (
          <Card key={m.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold">{m.menu_name}</h3>
                <Badge variant="outline" className="capitalize">{m.menu_location}</Badge>
                {!m.is_active && <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">Inactive</Badge>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="space-y-1">
              {(m.items || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md hover:bg-muted/50">
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="font-medium">{item.label}</span>
                  {item.url && <span className="text-muted-foreground text-xs flex items-center gap-0.5"><ArrowRight className="w-3 h-3" />{item.url}</span>}
                  {item.children?.length > 0 && <Badge variant="secondary" className="ml-auto bg-ice-50 text-ice-700 border-0">{item.children.length} sub</Badge>}
                </div>
              ))}
              {(!m.items || m.items.length === 0) && <p className="text-sm text-muted-foreground py-2">No menu items.</p>}
            </div>
          </Card>
        ))}
      </div>
      <MenuEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function MenuEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({ items: [] });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setForm(record ? { ...record, items: record.items || [] } : { items: [], menu_location: 'header', is_active: true });
  }, [record, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateItem = (i, key, val) => setForm(p => {
    const items = [...p.items];
    items[i] = { ...items[i], [key]: val };
    return { ...p, items };
  });

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { label: '', url: '/', sort_order: p.items.length, target: 'internal' }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.menu_name) { toast({ title: 'Menu name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.CMSMenu.update(record.id, form); toast({ title: 'Menu updated' }); }
      else { await base44.entities.CMSMenu.create(form); toast({ title: 'Menu created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Menu' : 'New Menu'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5"><Label>Menu Name *</Label><Input value={form.menu_name || ''} onChange={e => set('menu_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Location</Label>
            <Select value={form.menu_location || 'header'} onValueChange={v => set('menu_location', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l} className="capitalize">{l.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="menu-active" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} className="h-4 w-4 rounded border-input accent-flame-500" />
            <Label htmlFor="menu-active">Active</Label>
          </div>
          <div className="sm:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <Label>Menu Items</Label>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Add Item</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center p-2 rounded-lg border border-border">
                  <Input value={item.label || ''} placeholder="Label" onChange={e => updateItem(i, 'label', e.target.value)} className="flex-1" />
                  <Input value={item.url || ''} placeholder="/path" onChange={e => updateItem(i, 'url', e.target.value)} className="flex-1" />
                  <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              {form.items.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">No items. Click "Add Item".</p>}
            </div>
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