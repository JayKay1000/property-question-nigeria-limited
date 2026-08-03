import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Film, Cpu, CheckCircle2, XCircle, Droplet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { transcodeStatusConfig, outputFormatLabels, sourceTypeLabels, formatDateTime, formatNumber } from '@/lib/enterprise-ops-utils';

export default function TranscodeJobManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => { setLoading(true); try { setJobs(await base44.entities.MediaTranscodeJob.list('-created_date', 200)); } catch { /* */ } setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => { try { await base44.entities.MediaTranscodeJob.delete(id); toast({ title: 'Job removed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const startJob = async (j) => { try { await base44.entities.MediaTranscodeJob.update(j.id, { status: 'processing', started_at: new Date().toISOString(), progress: 5 }); toast({ title: 'Transcode job started' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const completeJob = async (j) => { try { await base44.entities.MediaTranscodeJob.update(j.id, { status: 'completed', completed_at: new Date().toISOString(), progress: 100 }); toast({ title: 'Job completed' }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); } };
  const filtered = jobs.filter(j => !query || j.source_name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Film className="w-5 h-5 text-flame-500" /> Transcode Jobs ({jobs.length})</h2>
        <div className="flex gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-44" /></div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Job</Button>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No transcode jobs.</Card>}
        {!loading && filtered.map(j => (
          <Card key={j.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-heading font-semibold truncate">{j.source_name}</h3>
                <Badge variant="secondary" className={transcodeStatusConfig[j.status]?.className || ''}>{transcodeStatusConfig[j.status]?.label || j.status}</Badge>
                <Badge variant="outline">{outputFormatLabels[j.output_format]}</Badge>
                <Badge variant="outline" className="capitalize">{sourceTypeLabels[j.source_type]}</Badge>
                {j.watermark_applied && <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0"><Droplet className="w-3 h-3 mr-1" />Watermarked</Badge>}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                {j.resolution && <span>{j.resolution}</span>}
                {j.video_bitrate && <span>{j.video_bitrate}</span>}
                {j.file_size_mb != null && <span>{j.file_size_mb} MB</span>}
                {j.duration_seconds != null && <span>{Math.round(j.duration_seconds)}s</span>}
                {j.started_at && <span>Started {formatDateTime(j.started_at)}</span>}
              </div>
              {j.status === 'processing' && <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-flame-500" style={{ width: `${j.progress || 0}%` }} /></div>}
              {j.ai_tags && j.ai_tags.length > 0 && <div className="flex gap-1 flex-wrap mt-1.5">{j.ai_tags.slice(0, 5).map((t, i) => <Badge key={i} variant="secondary" className="bg-brand-50 text-brand-600 border-0 text-xs">{t}</Badge>)}</div>}
              {j.error_message && <p className="text-xs text-error mt-1 truncate">{j.error_message}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {j.status === 'queued' && <Button size="sm" variant="outline" className="h-8" onClick={() => startJob(j)}><Cpu className="w-3.5 h-3.5 mr-1" /> Start</Button>}
              {j.status === 'processing' && <Button size="sm" variant="outline" className="h-8 text-success border-success/30" onClick={() => completeJob(j)}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete</Button>}
              <Button size="icon" variant="ghost" onClick={() => { setEditing(j); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(j.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <TranscodeEditor open={open} onClose={() => setOpen(false)} record={editing} onSaved={load} />
    </div>
  );
}

function TranscodeEditor({ open, onClose, record, onSaved }) {
  const [form, setForm] = useState({});
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  React.useEffect(() => {
    setForm(record ? { ...record } : { source_type: 'video', output_format: 'mp4', status: 'queued', progress: 0, watermark_applied: false, ai_tags: [] });
    setTagsInput(record?.ai_tags ? record.ai_tags.join(', ') : '');
  }, [record, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.source_name) { toast({ title: 'Source name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, job_code: form.job_code || `TC-${Date.now().toString(36).toUpperCase()}`, ai_tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) };
      if (record?.id) { await base44.entities.MediaTranscodeJob.update(record.id, payload); toast({ title: 'Job updated' }); }
      else { await base44.entities.MediaTranscodeJob.create(payload); toast({ title: 'Job created' }); }
      onSaved?.(); onClose();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit Transcode Job' : 'New Transcode Job'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Source Name *</Label><Input value={form.source_name || ''} placeholder="property_tour_video.mp4" onChange={e => set('source_name', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Source URL</Label><Input value={form.source_url || ''} placeholder="https://…" onChange={e => set('source_url', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Source Type</Label><Select value={form.source_type || 'video'} onValueChange={v => set('source_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(sourceTypeLabels).map(m => <SelectItem key={m} value={m}>{sourceTypeLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Output Format</Label><Select value={form.output_format || 'mp4'} onValueChange={v => set('output_format', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(outputFormatLabels).map(m => <SelectItem key={m} value={m}>{outputFormatLabels[m]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status || 'queued'} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(transcodeStatusConfig).map(m => <SelectItem key={m} value={m}>{transcodeStatusConfig[m].label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Resolution</Label><Input value={form.resolution || ''} placeholder="1080p" onChange={e => set('resolution', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Video Bitrate</Label><Input value={form.video_bitrate || ''} placeholder="2500k" onChange={e => set('video_bitrate', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Audio Bitrate</Label><Input value={form.audio_bitrate || ''} placeholder="128k" onChange={e => set('audio_bitrate', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Duration (s)</Label><Input type="number" value={form.duration_seconds ?? ''} onChange={e => set('duration_seconds', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>File Size (MB)</Label><Input type="number" value={form.file_size_mb ?? ''} onChange={e => set('file_size_mb', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Output URL</Label><Input value={form.output_url || ''} onChange={e => set('output_url', e.target.value)} /></div>
          <div className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" id="watermark" checked={!!form.watermark_applied} onChange={e => set('watermark_applied', e.target.checked)} className="h-4 w-4 rounded border-input accent-flame-500" /><Label htmlFor="watermark">Apply watermark</Label></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>AI Tags (comma-separated)</Label><Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="exterior, garden, pool" /></div>
          {form.error_message && <div className="space-y-1.5 sm:col-span-2"><Label>Error Message</Label><Textarea value={form.error_message || ''} rows={2} onChange={e => set('error_message', e.target.value)} /></div>}
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}