import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Megaphone, TrendingUp, MousePointerClick, DollarSign, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { campaignStatusConfig, campaignTypeLabels, buildUtmUrl, calcRoas, calcCtr, calcConversionRate, calcCpc, formatCurrency, formatNumber, formatDate } from '@/lib/seo-utils';

export default function UTMCampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setCampaigns(await base44.entities.UTMCampaign.list('-created_date', 200)); }
    catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await base44.entities.UTMCampaign.delete(id); toast({ title: 'Campaign removed' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filtered = campaigns.filter(c => !query || c.campaign_name?.toLowerCase().includes(query.toLowerCase()) || c.utm_source?.toLowerCase().includes(query.toLowerCase()));
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalValue = campaigns.reduce((s, c) => s + (c.conversion_value || 0), 0);
  const avgRoas = totalSpend > 0 ? (totalValue / totalSpend).toFixed(2) : '0';

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Megaphone className="w-5 h-5 text-flame-500" /> UTM Campaigns ({campaigns.length})</h2>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="bg-success/10 text-success border-0">{activeCount} Active</Badge>
          <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0">₦{formatNumber(totalSpend)} Spend</Badge>
          <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">{totalConversions} Conv · {avgRoas}x ROAS</Badge>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-40" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Campaign</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No campaigns yet.</Card>}
        {!loading && filtered.map(c => {
          const roas = calcRoas(c.spend, c.conversion_value);
          const ctr = calcCtr(c.clicks, c.impressions);
          const convRate = calcConversionRate(c.conversions, c.clicks);
          return (
            <Card key={c.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading font-semibold truncate">{c.campaign_name}</h3>
                  <Badge variant="secondary" className={campaignStatusConfig[c.status]?.className || ''}>{campaignStatusConfig[c.status]?.label || c.status}</Badge>
                  <Badge variant="outline" className="capitalize">{campaignTypeLabels[c.campaign_type]}</Badge>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground flex-wrap mt-1">
                  <span className="font-mono">{c.utm_source} / {c.utm_medium}</span>
                  {c.clicks > 0 && <span className="flex items-center gap-0.5"><MousePointerClick className="w-3 h-3" /> {formatNumber(c.clicks)} clicks</span>}
                  {c.impressions > 0 && <span>{formatNumber(c.impressions)} impr</span>}
                  <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {ctr}% CTR</span>
                  <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" /> {formatCurrency(c.spend)} spent</span>
                  <span>{c.conversions || 0} conv ({convRate}%)</span>
                  {roas > 0 && <span className="text-success font-medium">{roas}x ROAS</span>}
                </div>
                {c.start_date && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(c.start_date)} → {c.end_date ? formatDate(c.end_date) : 'ongoing'}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                {c.full_url && <CopyUrlButton url={c.full_url} />}
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
      <CampaignEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function CopyUrlButton({ url }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true); toast({ title: 'UTM URL copied' });
    setTimeout(() => setCopied(false), 2000);
  };
  return <Button size="icon" variant="ghost" onClick={copy} title="Copy UTM URL">{copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}</Button>;
}

function CampaignEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => { setForm(record ? { ...record } : { campaign_type: 'social', status: 'draft', budget: 0, spend: 0, clicks: 0, impressions: 0, conversions: 0, conversion_value: 0 }); }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const previewUrl = buildUtmUrl(form.destination_url || '', { source: form.utm_source, medium: form.utm_medium, campaign: form.utm_campaign, term: form.utm_term, content: form.utm_content });

  const save = async () => {
    if (!form.campaign_name || !form.utm_source || !form.utm_medium || !form.utm_campaign) { toast({ title: 'Campaign name and UTM source/medium/campaign required', variant: 'destructive' }); return; }
    const payload = { ...form, full_url: previewUrl, ctr: calcCtr(form.clicks, form.impressions), conversion_rate: calcConversionRate(form.conversions, form.clicks), cpc: calcCpc(form.spend, form.clicks), roas: calcRoas(form.spend, form.conversion_value) };
    setSaving(true);
    try {
      if (record?.id) { await base44.entities.UTMCampaign.update(record.id, payload); toast({ title: 'Campaign updated' }); }
      else { await base44.entities.UTMCampaign.create(payload); toast({ title: 'Campaign created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Campaign' : 'New UTM Campaign'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Campaign Name *</Label><Input value={form.campaign_name || ''} onChange={e => set('campaign_name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Campaign Type</Label>
            <Select value={form.campaign_type || 'social'} onValueChange={v => set('campaign_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(campaignTypeLabels).map(k => <SelectItem key={k} value={k}>{campaignTypeLabels[k]}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status || 'draft'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(campaignStatusConfig).map(k => <SelectItem key={k} value={k}>{campaignStatusConfig[k].label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Destination / Landing Page URL</Label><Input value={form.destination_url || ''} placeholder="https://pqn.com/buy2flip" onChange={e => set('destination_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>UTM Source *</Label><Input value={form.utm_source || ''} placeholder="google, facebook, newsletter" onChange={e => set('utm_source', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>UTM Medium *</Label><Input value={form.utm_medium || ''} placeholder="cpc, email, social" onChange={e => set('utm_medium', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>UTM Campaign *</Label><Input value={form.utm_campaign || ''} placeholder="lagos_summer_launch_2026" onChange={e => set('utm_campaign', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>UTM Term</Label><Input value={form.utm_term || ''} onChange={e => set('utm_term', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>UTM Content</Label><Input value={form.utm_content || ''} placeholder="banner_a, cta_v2" onChange={e => set('utm_content', e.target.value)} /></div>
          {previewUrl && <div className="space-y-1.5 sm:col-span-2"><Label>Generated UTM URL</Label><div className="rounded-md bg-muted p-3 text-xs font-mono text-muted-foreground break-all">{previewUrl}</div></div>}
          <div className="space-y-1.5"><Label>Budget (₦)</Label><Input type="number" value={form.budget ?? 0} onChange={e => set('budget', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Spend (₦)</Label><Input type="number" value={form.spend ?? 0} onChange={e => set('spend', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Impressions</Label><Input type="number" value={form.impressions ?? 0} onChange={e => set('impressions', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Clicks</Label><Input type="number" value={form.clicks ?? 0} onChange={e => set('clicks', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Conversions</Label><Input type="number" value={form.conversions ?? 0} onChange={e => set('conversions', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Conversion Value (₦)</Label><Input type="number" value={form.conversion_value ?? 0} onChange={e => set('conversion_value', Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}