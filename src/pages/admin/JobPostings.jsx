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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Briefcase, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { departmentLabels, slugify, formatDate } from '@/lib/marketing-utils';

const DEPARTMENTS = Object.keys(departmentLabels);
const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];
const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' },
  { value: 'filled', label: 'Filled' },
];

const emptyForm = {
  job_title: '', slug: '', department: 'sales', job_type: 'full_time',
  location: '', description: '', requirements: '', responsibilities: '',
  benefits: '', salary_range_min: '', salary_range_max: '',
  experience_level: 'mid', application_deadline: '', status: 'active',
  is_active: true, sort_order: 0,
};

const jobTypeLabels = Object.fromEntries(JOB_TYPES.map((j) => [j.value, j.label]));

function toLines(value) {
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'string') return value;
  return '';
}
function fromLines(value) {
  return String(value || '').split('\n').map((s) => s.trim()).filter(Boolean);
}

export default function JobPostings() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.JobPosting.list('-posted_date', 100);
      setJobs(data);
    } catch (e) {
      toast({ title: 'Failed to load job postings', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (job) => {
    setEditing(job);
    setForm({
      job_title: job.job_title || '',
      slug: job.slug || '',
      department: job.department || 'sales',
      job_type: job.job_type || 'full_time',
      location: job.location || '',
      description: job.description || '',
      requirements: toLines(job.requirements),
      responsibilities: toLines(job.responsibilities),
      benefits: toLines(job.benefits),
      salary_range_min: job.salary_range_min ?? '',
      salary_range_max: job.salary_range_max ?? '',
      experience_level: job.experience_level || 'mid',
      application_deadline: job.application_deadline || '',
      status: job.status || 'active',
      is_active: job.is_active !== false,
      sort_order: job.sort_order ?? 0,
    });
    setOpen(true);
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const save = async () => {
    if (!form.job_title.trim() || !form.department) {
      toast({ title: 'Job title and department are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      job_title: form.job_title.trim(),
      slug: form.slug.trim() || slugify(form.job_title),
      department: form.department,
      job_type: form.job_type,
      location: form.location.trim(),
      description: form.description.trim(),
      requirements: fromLines(form.requirements),
      responsibilities: fromLines(form.responsibilities),
      benefits: fromLines(form.benefits),
      salary_range_min: form.salary_range_min ? Number(form.salary_range_min) : undefined,
      salary_range_max: form.salary_range_max ? Number(form.salary_range_max) : undefined,
      experience_level: form.experience_level,
      application_deadline: form.application_deadline || undefined,
      status: form.status,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    if (!editing) payload.posted_date = new Date().toISOString();

    try {
      if (editing) {
        await base44.entities.JobPosting.update(editing.id, payload);
        toast({ title: 'Job posting updated' });
      } else {
        await base44.entities.JobPosting.create(payload);
        toast({ title: 'Job posting created' });
      }
      setOpen(false);
      loadJobs();
    } catch (e) {
      toast({ title: 'Failed to save job posting', variant: 'destructive' });
    }
    setSaving(false);
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.job_title}"? This cannot be undone.`)) return;
    try {
      await base44.entities.JobPosting.delete(job.id);
      toast({ title: 'Job posting deleted' });
      loadJobs();
    } catch (e) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-flame-500" /> Careers — Open Positions
          </h1>
          <p className="text-sm text-muted-foreground">Create, edit, and remove job openings shown on the Careers page.</p>
        </div>
        <Button onClick={openCreate} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
          <Plus className="w-4 h-4" /> Add Position
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-flame-500" />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No job postings yet.</p>
          <Button onClick={openCreate} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            <Plus className="w-4 h-4" /> Create your first posting
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold truncate">{job.job_title}</h3>
                    <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">
                      {departmentLabels[job.department] || job.department}
                    </Badge>
                    <Badge variant={job.status === 'active' ? 'default' : 'outline'}
                      className={job.status === 'active' ? 'bg-success text-white border-0' : ''}>
                      {job.status}
                    </Badge>
                    {!job.is_active && <Badge variant="outline" className="text-muted-foreground">hidden</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {job.location && <span>{job.location}</span>}
                    <span>{jobTypeLabels[job.job_type]}</span>
                    {job.application_deadline && <span>Deadline: {formatDate(job.application_deadline)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(job)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-error hover:text-error" onClick={() => remove(job)}>
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
            <DialogTitle>{editing ? 'Edit Position' : 'New Position'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Job Title *</Label>
                <Input value={form.job_title} onChange={(e) => update('job_title', e.target.value)} placeholder="e.g. Sales Executive" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="auto-generated if blank" />
              </div>
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select value={form.department} onValueChange={(v) => update('department', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{departmentLabels[d]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Job Type</Label>
                <Select value={form.job_type} onValueChange={(v) => update('job_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((j) => <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Lagos, Nigeria" />
              </div>
              <div className="space-y-1.5">
                <Label>Experience Level</Label>
                <Select value={form.experience_level} onValueChange={(v) => update('experience_level', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Salary Min (NGN)</Label>
                <Input type="number" value={form.salary_range_min} onChange={(e) => update('salary_range_min', e.target.value)} placeholder="optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Salary Max (NGN)</Label>
                <Input type="number" value={form.salary_range_max} onChange={(e) => update('salary_range_max', e.target.value)} placeholder="optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Application Deadline</Label>
                <Input type="date" value={form.application_deadline} onChange={(e) => update('application_deadline', e.target.value)} />
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
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short summary shown on the listing card" />
            </div>
            <div className="space-y-1.5">
              <Label>Requirements (one per line)</Label>
              <Textarea rows={4} value={form.requirements} onChange={(e) => update('requirements', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Responsibilities (one per line)</Label>
              <Textarea rows={4} value={form.responsibilities} onChange={(e) => update('responsibilities', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Benefits (one per line)</Label>
              <Textarea rows={3} value={form.benefits} onChange={(e) => update('benefits', e.target.value)} />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => update('is_active', v)} id="job-active" />
              <Label htmlFor="job-active">Visible on Careers page</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Position'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}