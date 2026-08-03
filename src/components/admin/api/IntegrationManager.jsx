import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Plug, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { integrationStatusConfig, integrationHealthConfig, integrationCategoryLabels, environmentLabels, formatDateTime } from '@/lib/platform-utils';

export default function IntegrationManager() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setIntegrations(await base44.entities.IntegrationConfig.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.IntegrationConfig.delete(id); toast({ title: 'Integration removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const syncNow = async (i) => { try { await base44.entities.IntegrationConfig.update(i.id, { last_sync: new Date().toISOString(), health: 'healthy' }); toast({ title: `${i.name} synced` }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const filtered = integrations.filter(i => !query || i.name?.toLowerCase().includes(query.toLowerCase()) || i.provider?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Plug className="w-5 h-5 text-flame-500" /> Integrations ({integrations.length})</h2>
        <div className="flex gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-44" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Integration</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <Card className="p-8 text-center text-muted-foreground md:col-span-2">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground md:col-span-2">No integrations configured.</Card>}
        {!loading && filtered.map(i => {
          const h = integrationHealthConfig[i.health] || integrationHealthConfig.unknown;
          return (
            <Card key={i.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-heading font-semibold truncate">{i.name}</h3>
                    <Badge variant="secondary" className={integrationStatusConfig[i.status]?.className || ''}>{integrationStatusConfig[i.status]?.label || i.status}</Badge>
                    <Badge variant="secondary" className={h.className}><span className={`inline-block w-2 h-2 rounded-full ${h.dot} mr-1.5`} />{h.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{i.provider} · {integrationCategoryLabels[i.category]} · {environmentLabels[i.environment]}</p>
                  {i.base_url && <p className="text-xs font-mono text-muted-foreground truncate mt-1">{i.base_url}</p>}
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1"><span>{i.endpoints_count || 0} endpoints</span>{i.last_sync && <span>Synced {formatDateTime(i.last_sync)}</span>}{i.version && <span>v{i.version}</span>}</div>
                  {i.last_error && <p className="text-xs text-error mt-1 truncate">{i.last_error}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => syncNow(i)} title="Sync now"><RefreshCw className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(i.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <IntegrationEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function IntegrationEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => { setForm(record ? { ...record } : { auth_type: 'api_key', category: 'general', status: 'pending', health: 'unknown', environment: 'production', endpoints_count: 0 }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.integration_code || !form.name || !form.provider) { toast({ title: 'Code, name and provider required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.IntegrationConfig.update(record.id, form); toast({ title: 'Integration updated' }); }
      else { await base44.entities.IntegrationConfig.create(form); toast({ title: 'Integration added' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Integration' : 'Add Integration'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5"><Label>Integration Code *</Label><Input value={form.integration_code || ''} placeholder="google_maps" onChange={e => set('integration_code', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name || ''} placeholder="Google Maps" onChange={e => set('name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Provider *</Label><Input value={form.provider || ''} placeholder="google" onChange={e => set('provider', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Category</Label><Select value={form.category || 'general'} onValueChange={v => set('category', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(integrationCategoryLabels).map(m => <SelectItem key={m} value={m}>{integrationCategoryLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Auth Type</Label><Select value={form.auth_type || 'api_key'} onValueChange={v => set('auth_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="api_key">API Key</SelectItem><SelectItem value="oauth">OAuth</SelectItem><SelectItem value="basic">Basic</SelectItem><SelectItem value="webhook">Webhook</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'pending'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(integrationStatusConfig).map(m => <SelectItem key={m} value={m}>{integrationStatusConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Health</Label><Select value={form.health || 'unknown'} onValueChange={v => set('health', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(integrationHealthConfig).map(m => <SelectItem key={m} value={m}>{integrationHealthConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Environment</Label><Select value={form.environment || 'production'} onValueChange={v => set('environment', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(environmentLabels).map(m => <SelectItem key={m} value={m}>{environmentLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Base URL</Label><Input value={form.base_url || ''} placeholder="https://api.example.com/v1" onChange={e => set('base_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Version</Label><Input value={form.version || ''} onChange={e => set('version', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Endpoints Count</Label><Input type="number" value={form.endpoints_count ?? 0} onChange={e => set('endpoints_count', Number(e.target.value))} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={form.description || ''} rows={2} onChange={e => set('description', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}