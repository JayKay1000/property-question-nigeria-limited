import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, HeartHandshake, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { csrCategoryLabels, slugify, formatDate } from '@/lib/marketing-utils';

const CATEGORIES = Object.keys(csrCategoryLabels);
const STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const emptyForm = {
  title: '', slug: '', description: '', csr_category: 'community',
  impact_summary: '', beneficiary_count: '', location: '', image_url: '',
  start_date: '', end_date: '', status: 'ongoing',
  is_active: true, sort_order: 0,
};

export default function CSRProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CSRProject.list('sort_order', 100);
      setProjects(data);
    } catch (e) {
      toast({ title: 'Failed to load CSR initiatives', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      description: p.description || '',
      csr_category: p.csr_category || 'community',
      impact_summary: p.impact_summary || '',
      beneficiary_count: p.beneficiary_count ?? '',
      location: p.location || '',
      image_url: p.image_url || '',
      start_date: p.start_date || '',
      end_date: p.end_date || '',
      status: p.status || 'ongoing',
      is_active: p.is_active !== false,
      sort_order: p.sort_order ?? 0,
    });
    setOpen(true);
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update('image_url', file_url);
      toast({ title: 'Image uploaded' });
    } catch (e) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim() || !form.csr_category) {
      toast({ title: 'Title and category are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      description: form.description.trim(),
      csr_category: form.csr_category,
      impact_summary: form.impact_summary.trim(),
      beneficiary_count: form.beneficiary_count ? Number(form.beneficiary_count) : 0,
      location: form.location.trim(),
      image_url: form.image_url.trim() || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      status: form.status,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editing) {
        await base44.entities.CSRProject.update(editing.id, payload);
        toast({ title: 'CSR initiative updated' });
      } else {
        await base44.entities.CSRProject.create(payload);
        toast({ title: 'CSR initiative created' });
      }
      setOpen(false);
      load();
    } catch (e) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
    setSaving(false);
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await base44.entities.CSRProject.delete(p.id);
      toast({ title: 'CSR initiative deleted' });
      load();
    } catch (e) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-flame-500" /> CSR Initiatives
          </h1>
          <p className="text-sm text-muted-foreground">Create, edit, and remove CSR projects shown on the CSR page.</p>
        </div>
        <Button onClick={openCreate} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
          <Plus className="w-4 h-4" /> Add Initiative
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-flame-500" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <HeartHandshake className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No CSR initiatives yet.</p>
          <Button onClick={openCreate} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            <Plus className="w-4 h-4" /> Create your first initiative
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold truncate">{p.title}</h3>
                    <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">
                      {csrCategoryLabels[p.csr_category] || p.csr_category}
                    </Badge>
                    <Badge variant={p.status === 'ongoing' ? 'default' : 'outline'}
                      className={p.status === 'ongoing' ? 'bg-success text-white border-0' : ''}>
                      {p.status}
                    </Badge>
                    {!p.is_active && <Badge variant="outline" className="text-muted-foreground">hidden</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {p.location && <span>{p.location}</span>}
                    {p.beneficiary_count > 0 && <span>{p.beneficiary_count.toLocaleString()} beneficiaries</span>}
                    {p.start_date && <span>Started: {formatDate(p.start_date)}</span>}
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-error hover:text-error" onClick={() => remove(p)}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Initiative' : 'New Initiative'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. School Renovation Project" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="auto-generated if blank" />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.csr_category} onValueChange={(v) => update('csr_category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{csrCategoryLabels[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Lagos, Nigeria" />
              </div>
              <div className="space-y-1.5">
                <Label>Beneficiary Count</Label>
                <Input type="number" value={form.beneficiary_count} onChange={(e) => update('beneficiary_count', e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Summary shown on the CSR card" />
            </div>
            <div className="space-y-1.5">
              <Label>Impact Summary</Label>
              <Textarea rows={3} value={form.impact_summary} onChange={(e) => update('impact_summary', e.target.value)} placeholder="Brief impact statement" />
            </div>

            <div className="space-y-1.5">
              <Label>Cover Image</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('csr-image-upload').click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload Image
                </Button>
                <Input
                  value={form.image_url}
                  onChange={(e) => update('image_url', e.target.value)}
                  placeholder="Paste image URL or upload"
                  className="flex-1 min-w-[200px]"
                />
                <input
                  id="csr-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = '';
                  }}
                />
              </div>
              {form.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border w-40 h-24">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => update('is_active', v)} id="csr-active" />
              <Label htmlFor="csr-active">Visible on CSR page</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Initiative'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}