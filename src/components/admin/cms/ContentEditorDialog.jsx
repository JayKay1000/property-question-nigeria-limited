import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { fieldConfigs, slugify, entityLabels, getRecordTitle } from '@/lib/cms-utils';
import { loadContent, saveContent } from '@/lib/content-storage';
import MediaUploadField from './MediaUploadField';
import RichTextEditor from './RichTextEditor';

export default function ContentEditorDialog({ open, onClose, entityType, record, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  // For existing records, the form hydrates asynchronously (offloaded content
  // is fetched back as HTML). Rich text editors must mount only after that
  // resolves — ReactQuill won't reflect a value that arrives after mount.
  const [ready, setReady] = useState(!record);
  const { toast } = useToast();
  const fields = fieldConfigs[entityType] || [];

  useEffect(() => {
    let active = true;
    setReady(!record);
    (async () => {
      const initial = record ? { ...record } : {};
      // Hydrate any offloaded richtext content back to HTML for editing.
      if (entityType === 'BlogPost') {
        for (const f of fields) {
          if (f.type === 'richtext' && initial[f.key]) {
            try { initial[f.key] = await loadContent(initial[f.key]); } catch { /* leave as-is */ }
          }
        }
      }
      if (active) { setForm(initial); setReady(true); }
    })();
    return () => { active = false; };
  }, [record, open, entityType]);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const missing = fields.filter(f => f.required && !form[f.key]);
    if (missing.length) {
      toast({ title: 'Required fields missing', description: missing.map(f => f.label).join(', '), variant: 'destructive' });
      return;
    }
    // Auto-slugify if slug field exists and is empty but title is present
    const payload = { ...form };
    if ('slug' in payload && payload.title) payload.slug = slugify(payload.slug || payload.title);
    // New blog posts default to published so they appear publicly; stamp the
    // publish date when publishing for the first time.
    if (entityType === 'BlogPost') {
      if (!payload.status) payload.status = 'published';
      if (payload.status === 'published' && !payload.published_date) payload.published_date = new Date().toISOString();
    }
    // Offload large richtext content to a file so it fits the field size limit.
    if (entityType === 'BlogPost') {
      for (const f of fields) {
        if (f.type === 'richtext' && payload[f.key]) {
          try { payload[f.key] = await saveContent(payload[f.key]); } catch { /* leave inline */ }
        }
      }
    }

    setSaving(true);
    try {
      let saved;
      if (record?.id) {
        saved = await base44.entities[entityType].update(record.id, payload);
        toast({ title: 'Updated', description: `${entityLabels[entityType]} updated successfully.` });
      } else {
        saved = await base44.entities[entityType].create(payload);
        toast({ title: 'Created', description: `${entityLabels[entityType]} created successfully.` });
      }
      // Version snapshot
      try {
        await base44.entities.ContentVersion.create({
          entity_name: entityType,
          record_id: saved.id,
          record_title: getRecordTitle(entityType, payload),
          version_number: (record?.version_number || 0) + 1,
          snapshot: payload,
          change_note: record?.id ? 'Content updated' : 'Content created',
          status: payload.status || 'draft',
          is_current: true,
        });
      } catch { /* version logging is best-effort */ }
      onSaved?.();
      onClose();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to save content.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const renderField = (field) => {
    const value = form[field.key];
    const colSpan = field.span === 2 ? 'sm:col-span-2' : '';
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label htmlFor={field.key}>{field.label}{field.required ? ' *' : ''}</Label>
            <Textarea id={field.key} value={value || ''} rows={3}
              placeholder={field.placeholder} onChange={e => setField(field.key, e.target.value)} />
          </div>
        );
      case 'richtext':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label>{field.label}{field.required ? ' *' : ''}</Label>
            {ready
              ? <RichTextEditor key={`${field.key}-${record?.id || 'new'}`} value={value || ''} onChange={v => setField(field.key, v)} placeholder={field.placeholder} />
              : <div className="h-[280px] rounded-lg border border-input bg-white animate-pulse" />}
          </div>
        );
      case 'select':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label>{field.label}{field.required ? ' *' : ''}</Label>
            <Select value={value || ''} onValueChange={v => setField(field.key, v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {field.options.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'tags':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input id={field.key} value={Array.isArray(value) ? value.join(', ') : (value || '')}
              placeholder={field.placeholder} onChange={e => setField(field.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </div>
        );
      case 'boolean':
        return (
          <div key={field.key} className={`flex items-center gap-2 ${colSpan} sm:self-end pb-2`}>
            <input type="checkbox" id={field.key} checked={!!value} onChange={e => setField(field.key, e.target.checked)}
              className="h-4 w-4 rounded border-input accent-flame-500" />
            <Label htmlFor={field.key} className="cursor-pointer">{field.label}</Label>
          </div>
        );
      case 'number':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input id={field.key} type="number" value={value ?? ''} onChange={e => setField(field.key, e.target.value === '' ? null : Number(e.target.value))} />
          </div>
        );
      case 'datetime':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input id={field.key} type="datetime-local" value={value ? new Date(value).toISOString().slice(0, 16) : ''}
              onChange={e => setField(field.key, e.target.value ? new Date(e.target.value).toISOString() : null)} />
          </div>
        );
      case 'image':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label>{field.label}{field.required ? ' *' : ''}</Label>
            <MediaUploadField type="image" value={value || ''} onChange={v => setField(field.key, v)} />
          </div>
        );
      case 'gallery':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label>{field.label}</Label>
            <MediaUploadField type="gallery" value={value || []} onChange={v => setField(field.key, v)} />
          </div>
        );
      case 'videos':
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label>{field.label}</Label>
            <MediaUploadField type="videos" value={value || []} onChange={v => setField(field.key, v)} />
          </div>
        );
      default:
        return (
          <div key={field.key} className={`space-y-1.5 ${colSpan}`}>
            <Label htmlFor={field.key}>{field.label}{field.required ? ' *' : ''}</Label>
            <Input id={field.key} value={value || ''} placeholder={field.placeholder}
              onChange={e => setField(field.key, e.target.value)} />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record?.id ? `Edit ${entityLabels[entityType]}` : `New ${entityLabels[entityType]}`}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {fields.map(renderField)}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            {saving ? 'Saving…' : (record?.id ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}