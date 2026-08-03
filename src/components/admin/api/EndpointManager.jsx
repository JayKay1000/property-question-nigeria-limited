import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Server } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { httpMethodConfig, endpointCategoryLabels, authTypeLabels, endpointStatusConfig, formatNumber, formatDateTime } from '@/lib/platform-utils';

export default function EndpointManager() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setEndpoints(await base44.entities.APIEndpoint.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.APIEndpoint.delete(id); toast({ title: 'Endpoint removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const filtered = endpoints.filter(e => !query || e.name?.toLowerCase().includes(query.toLowerCase()) || e.path?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Server className="w-5 h-5 text-flame-500" /> API Endpoints ({endpoints.length})</h2>
        <div className="flex gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-44" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Endpoint</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No endpoints registered.</Card>}
        {!loading && filtered.map(e => (
          <Card key={e.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="secondary" className={`font-mono ${httpMethodConfig[e.method]?.className || ''}`}>{e.method}</Badge>
                <span className="font-mono text-sm truncate font-medium">{e.path}</span>
                <Badge variant="outline" className="capitalize">{endpointCategoryLabels[e.category]}</Badge>
                <Badge variant="secondary" className={endpointStatusConfig[e.status]?.className || ''}>{endpointStatusConfig[e.status]?.label || e.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{e.name} · Auth: {authTypeLabels[e.auth_type]} · v{e.version || '1'}{e.integration_name ? ` · ${e.integration_name}` : ''}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1"><span>{formatNumber(e.request_count || 0)} calls</span><span>{e.avg_response_ms || 0}ms avg</span><span className={e.error_count > 0 ? 'text-error' : ''}>{e.error_count || 0} errors</span>{e.last_called && <span>Last {formatDateTime(e.last_called)}</span>}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(e); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <EndpointEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function EndpointEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => { setForm(record ? { ...record } : { method: 'GET', auth_type: 'jwt', category: 'general', status: 'active', version: 'v1', rate_limit: 100, is_public: false }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.endpoint_code || !form.name || !form.path) { toast({ title: 'Code, name and path required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.APIEndpoint.update(record.id, form); toast({ title: 'Endpoint updated' }); }
      else { await base44.entities.APIEndpoint.create({ ...form, last_called: new Date().toISOString() }); toast({ title: 'Endpoint added' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Endpoint' : 'Add Endpoint'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5"><Label>Endpoint Code *</Label><Input value={form.endpoint_code || ''} placeholder="properties_list" onChange={e => set('endpoint_code', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name || ''} placeholder="List Properties" onChange={e => set('name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Path *</Label><Input value={form.path || ''} placeholder="/api/properties" onChange={e => set('path', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Method</Label><Select value={form.method || 'GET'} onValueChange={v => set('method', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(httpMethodConfig).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Auth Type</Label><Select value={form.auth_type || 'jwt'} onValueChange={v => set('auth_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(authTypeLabels).map(m => <SelectItem key={m} value={m}>{authTypeLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Category</Label><Select value={form.category || 'general'} onValueChange={v => set('category', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(endpointCategoryLabels).map(m => <SelectItem key={m} value={m}>{endpointCategoryLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'active'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(endpointStatusConfig).map(m => <SelectItem key={m} value={m}>{endpointStatusConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Rate Limit (req/min)</Label><Input type="number" value={form.rate_limit ?? ''} onChange={e => set('rate_limit', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Integration</Label><Input value={form.integration_name || ''} onChange={e => set('integration_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Version</Label><Input value={form.version || 'v1'} onChange={e => set('version', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={form.description || ''} rows={2} onChange={e => set('description', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}