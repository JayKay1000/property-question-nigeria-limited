import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, X, FileUp, Save, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { documentTypeOptions, documentTypeLabels, confidentialityOptions, docVisibilityOptions, relatedModuleOptions, formatBytes } from '@/lib/upload-utils';

export default function DocumentUploadForm() {
  const [form, setForm] = useState({
    document_type: 'other', confidentiality_level: 'internal', sensitivity: 'internal',
    visibility: 'authenticated', status: 'draft', approval_status: 'not_submitted',
    related_module: 'properties', current_version: 1, version: 1, is_current_version: true,
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const { toast } = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title) { toast({ title: 'Document title is required', variant: 'destructive' }); return; }
    if (!file) { toast({ title: 'Please select a file to upload', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploading(false);
      const ref = `PQ-DOC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
      const payload = {
        ...form,
        document_reference: ref,
        file_url,
        file_name: file.name,
        original_filename: file.name,
        file_size_bytes: file.size,
        content_type: file.type,
        file_extension: ext,
      };
      const created = await base44.entities.Document.create(payload);
      setSaved(created);
      toast({ title: 'Document uploaded successfully', description: ref });
      setForm({ document_type: 'other', confidentiality_level: 'internal', sensitivity: 'internal', visibility: 'authenticated', status: 'draft', approval_status: 'not_submitted', related_module: 'properties', current_version: 1, version: 1, is_current_version: true });
      setFile(null);
    } catch (e) { toast({ title: 'Error uploading document', description: e.message, variant: 'destructive' }); setUploading(false); }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {saved && (
        <Card className="p-4 border-success/30 bg-success/5 flex items-center justify-between">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" /><div><p className="font-medium">{saved.title}</p><p className="text-xs text-muted-foreground">Reference {saved.document_reference}</p></div></div>
          <Button size="sm" variant="outline" onClick={() => setSaved(null)}>Upload another</Button>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">File</h3>
        {file ? (
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-8 h-8 text-flame-500 shrink-0" />
              <div className="min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {file.type || 'unknown'}</p></div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setFile(null)}><X className="w-4 h-4" /></Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-flame-500 hover:bg-flame-50/50 transition-colors">
            <FileUp className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to select a file</p>
            <p className="text-xs text-muted-foreground">PDF, images, documents — any file type</p>
            <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          </label>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">Document Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2"><Label>Title *</Label><Input value={form.title || ''} placeholder="Survey Plan - Plot 24 Lekki" onChange={e => set('title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Document Type *</Label><Select value={form.document_type} onValueChange={v => set('document_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{documentTypeOptions.map(o => <SelectItem key={o} value={o}>{documentTypeLabels[o] || o}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Category</Label><Input value={form.category || ''} placeholder="Legal / Property / Identity" onChange={e => set('category', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Related Module</Label><Select value={form.related_module} onValueChange={v => set('related_module', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{relatedModuleOptions.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Related Entity ID</Label><Input value={form.related_entity_id || ''} placeholder="Property/Project ID (optional)" onChange={e => set('related_entity_id', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Confidentiality</Label><Select value={form.confidentiality_level} onValueChange={v => set('confidentiality_level', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{confidentialityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Visibility</Label><Select value={form.visibility} onValueChange={v => set('visibility', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{docVisibilityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Issue Date</Label><Input type="date" value={form.issue_date || ''} onChange={e => set('issue_date', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date || ''} onChange={e => set('expiry_date', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={form.description || ''} rows={2} placeholder="Notes about this document…" onChange={e => set('description', e.target.value)} /></div>
        </div>
      </Card>

      <div className="flex justify-end gap-2 sticky bottom-4">
        <Button onClick={save} disabled={saving || !file} className="bg-flame-500 hover:bg-flame-600 text-white border-0 shadow-lg">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {uploading ? 'Uploading file…' : 'Saving…'}</> : <><Upload className="w-4 h-4 mr-2" /> Upload Document</>}
        </Button>
      </div>
    </div>
  );
}