import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Send, Check, X, PenTool } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { signatureStatusConfig, documentTypeLabels, formatDate, formatDateTime } from '@/lib/enterprise-ops-utils';

export default function SignatureRequestManager() {
  const [sigs, setSigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setSigs(await base44.entities.ESignature.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.ESignature.delete(id); toast({ title: 'Request removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const send = async (s) => { try { await base44.entities.ESignature.update(s.id, { status: 'sent' }); toast({ title: 'Signature request sent' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const markSigned = async (s) => { try { await base44.entities.ESignature.update(s.id, { status: 'signed', signed_at: new Date().toISOString() }); toast({ title: 'Marked as signed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };

  const filtered = sigs.filter(s => (!statusFilter || statusFilter === 'all' || s.status === statusFilter) && (!query || s.document_title?.toLowerCase().includes(query.toLowerCase()) || s.signer_name?.toLowerCase().includes(query.toLowerCase())));

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><PenTool className="w-5 h-5 text-flame-500" /> Signature Requests ({sigs.length})</h2>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{Object.keys(signatureStatusConfig).map(s => <SelectItem key={s} value={s}>{signatureStatusConfig[s].label}</SelectItem>)}</SelectContent></Select>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-40" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Request</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No signature requests.</Card>}
        {!loading && filtered.map(s => (
          <Card key={s.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-heading font-semibold truncate">{s.document_title}</h3>
                <Badge variant="secondary" className={signatureStatusConfig[s.status]?.className || ''}>{signatureStatusConfig[s.status]?.label || s.status}</Badge>
                <Badge variant="outline" className="capitalize">{documentTypeLabels[s.document_type]}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                <span>Signer: {s.signer_name}</span>
                {s.signer_email && <span className="truncate">{s.signer_email}</span>}
                {s.requester_name && <span>By: {s.requester_name}</span>}
                {s.expiry_date && <span>Expires {formatDate(s.expiry_date)}</span>}
                {s.signed_at && <span className="text-success">Signed {formatDateTime(s.signed_at)}</span>}
                {s.reminders_sent > 0 && <span>{s.reminders_sent} reminders</span>}
              </div>
              {s.message && <p className="text-xs text-muted-foreground mt-1 truncate">"{s.message}"</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {s.status === 'draft' && <Button size="sm" variant="outline" className="h-8" onClick={() => send(s)}><Send className="w-3.5 h-3.5 mr-1" /> Send</Button>}
              {(s.status === 'sent' || s.status === 'viewed') && <Button size="sm" variant="outline" className="h-8 text-success border-success/30" onClick={() => markSigned(s)}><Check className="w-3.5 h-3.5 mr-1" /> Mark Signed</Button>}
              <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <SignatureEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function SignatureEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => { setForm(record ? { ...record } : { document_type: 'contract', status: 'draft', reminders_sent: 0 }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.document_title || !form.signer_name) { toast({ title: 'Document title and signer name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, signature_code: form.signature_code || `SIG-${Date.now().toString(36).toUpperCase()}` };
      if (record?.id) { await base44.entities.ESignature.update(record.id, payload); toast({ title: 'Request updated' }); }
      else { await base44.entities.ESignature.create(payload); toast({ title: 'Request created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Signature Request' : 'New Signature Request'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Document Title *</Label><Input value={form.document_title || ''} placeholder="Property Sale Agreement - Plot 24" onChange={e => set('document_title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Document Type</Label><Select value={form.document_type || 'contract'} onValueChange={v => set('document_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(documentTypeLabels).map(m => <SelectItem key={m} value={m}>{documentTypeLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'draft'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(signatureStatusConfig).map(m => <SelectItem key={m} value={m}>{signatureStatusConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Document URL</Label><Input value={form.document_url || ''} placeholder="https://…" onChange={e => set('document_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Signer Name *</Label><Input value={form.signer_name || ''} onChange={e => set('signer_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Signer Email</Label><Input value={form.signer_email || ''} onChange={e => set('signer_email', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Signer Phone</Label><Input value={form.signer_phone || ''} onChange={e => set('signer_phone', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Requester Name</Label><Input value={form.requester_name || ''} onChange={e => set('requester_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date || ''} onChange={e => set('expiry_date', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Requester Email</Label><Input value={form.requester_email || ''} onChange={e => set('requester_email', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Message to Signer</Label><Textarea value={form.message || ''} rows={2} onChange={e => set('message', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}