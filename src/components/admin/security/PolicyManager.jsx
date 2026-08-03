import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { policyCategoryLabels, policyFrameworkLabels, policyStatusConfig, complianceLevelConfig, formatDate } from '@/lib/enterprise-ops-utils';

export default function PolicyManager() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setPolicies(await base44.entities.SecurityPolicy.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.SecurityPolicy.delete(id); toast({ title: 'Policy removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-flame-500" /> Security Policies ({policies.length})</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Policy</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <Card className="p-8 text-center text-muted-foreground md:col-span-2">Loading…</Card>}
        {!loading && policies.length === 0 && <Card className="p-8 text-center text-muted-foreground md:col-span-2">No policies defined.</Card>}
        {!loading && policies.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-heading font-semibold truncate">{p.title}</h3>
                  <Badge variant="secondary" className={policyStatusConfig[p.status]?.className || ''}>{policyStatusConfig[p.status]?.label || p.status}</Badge>
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className="capitalize">{policyCategoryLabels[p.category]}</Badge>
                  <Badge variant="outline">{policyFrameworkLabels[p.framework]}</Badge>
                  <Badge variant="secondary" className={complianceLevelConfig[p.compliance_level]?.className || ''}>{complianceLevelConfig[p.compliance_level]?.label || p.compliance_level}</Badge>
                </div>
                {p.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{p.description}</p>}
                {p.requirements && p.requirements.length > 0 && (
                  <div className="mb-2"><p className="text-xs font-medium text-muted-foreground mb-1">Requirements:</p><ul className="text-xs text-muted-foreground space-y-0.5">{p.requirements.slice(0, 3).map((r, i) => <li key={i} className="flex gap-1.5"><span className="text-flame-500">•</span><span>{r}</span></li>)}{p.requirements.length > 3 && <li className="text-xs text-muted-foreground">+{p.requirements.length - 3} more…</li>}</ul></div>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                  {p.owner_name && <span>Owner: {p.owner_name}</span>}
                  {p.last_reviewed && <span>Reviewed {formatDate(p.last_reviewed)}</span>}
                  {p.next_review && <span>Next {formatDate(p.next_review)}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <PolicyEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function PolicyEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [reqInput, setReqInput] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => {
    setForm(record ? { ...record } : { category: 'access_control', framework: 'custom', status: 'draft', compliance_level: 'not_assessed', requirements: [] });
    setReqInput(record?.requirements ? record.requirements.join('\n') : '');
  }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, policy_code: form.policy_code || `POL-${Date.now().toString(36).toUpperCase()}`, requirements: reqInput.split('\n').map(t => t.trim()).filter(Boolean) };
      if (record?.id) { await base44.entities.SecurityPolicy.update(record.id, payload); toast({ title: 'Policy updated' }); }
      else { await base44.entities.SecurityPolicy.create(payload); toast({ title: 'Policy created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Policy' : 'New Security Policy'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Title *</Label><Input value={form.title || ''} placeholder="Data Protection Policy" onChange={e => set('title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Category</Label><Select value={form.category || 'access_control'} onValueChange={v => set('category', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(policyCategoryLabels).map(m => <SelectItem key={m} value={m}>{policyCategoryLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Framework</Label><Select value={form.framework || 'custom'} onValueChange={v => set('framework', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(policyFrameworkLabels).map(m => <SelectItem key={m} value={m}>{policyFrameworkLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'draft'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(policyStatusConfig).map(m => <SelectItem key={m} value={m}>{policyStatusConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Compliance Level</Label><Select value={form.compliance_level || 'not_assessed'} onValueChange={v => set('compliance_level', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(complianceLevelConfig).map(m => <SelectItem key={m} value={m}>{complianceLevelConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Owner</Label><Input value={form.owner_name || ''} onChange={e => set('owner_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Last Reviewed</Label><Input type="date" value={form.last_reviewed || ''} onChange={e => set('last_reviewed', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Next Review</Label><Input type="date" value={form.next_review || ''} onChange={e => set('next_review', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={form.description || ''} rows={2} onChange={e => set('description', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Requirements (one per line)</Label><Textarea value={reqInput} rows={4} onChange={e => setReqInput(e.target.value)} placeholder="MFA required for all admin access" /></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}