import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Mail, Phone, MessageSquare, Trash2, Loader2, Inbox, Search, Filter, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const INQUIRY_LABELS = {
  consultation: 'Consultation',
  inspection: 'Inspection',
  general: 'General',
  partnership: 'Partnership',
  career: 'Career',
  press: 'Press',
  complaint: 'Complaint',
};

const STATUS_CONFIG = {
  new: { label: 'New', className: 'bg-flame-50 text-flame-700 border-0' },
  contacted: { label: 'Contacted', className: 'bg-ice-50 text-ice-700 border-0' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success border-0' },
  converted: { label: 'Converted', className: 'bg-success text-white border-0' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-0' },
};

const STATUSES = Object.keys(STATUS_CONFIG);

function formatDateTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return value; }
}

export default function ContactSubmissions() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detailForm, setDetailForm] = useState({ status: 'new', assigned_to_name: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ContactSubmission.list('-created_date', 200);
      setSubmissions(data);
    } catch (e) {
      toast({ title: 'Failed to load submissions', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = (s) => {
    setSelected(s);
    setDetailForm({
      status: s.status || 'new',
      assigned_to_name: s.assigned_to_name || '',
      notes: s.notes || '',
    });
  };

  const updateStatus = async (s, newStatus) => {
    try {
      await base44.entities.ContactSubmission.update(s.id, { status: newStatus });
      toast({ title: `Marked as ${STATUS_CONFIG[newStatus].label}` });
      load();
    } catch (e) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const saveDetail = async () => {
    setSaving(true);
    try {
      await base44.entities.ContactSubmission.update(selected.id, {
        status: detailForm.status,
        assigned_to_name: detailForm.assigned_to_name.trim(),
        notes: detailForm.notes.trim(),
      });
      toast({ title: 'Submission updated' });
      setSelected(null);
      load();
    } catch (e) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
    setSaving(false);
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete submission from "${s.full_name}"? This cannot be undone.`)) return;
    try {
      await base44.entities.ContactSubmission.delete(s.id);
      toast({ title: 'Submission deleted' });
      if (selected?.id === s.id) setSelected(null);
      load();
    } catch (e) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch = !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = STATUSES.reduce((acc, st) => {
    acc[st] = submissions.filter((s) => s.status === st).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Inbox className="w-6 h-6 text-flame-500" /> Contact Submissions
        </h1>
        <p className="text-sm text-muted-foreground">View, assign, and respond to enquiries from the Contact page.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-heading font-bold">{submissions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </Card>
        {STATUSES.map((st) => (
          <Card key={st} className="p-4 text-center cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => setStatusFilter(st)}>
            <p className="text-2xl font-heading font-bold">{counts[st] || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{STATUS_CONFIG[st].label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or subject..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((st) => (
              <SelectItem key={st} value={st}>{STATUS_CONFIG[st].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-flame-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No submissions found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-5 hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => openDetail(s)}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold truncate">{s.full_name}</h3>
                    <Badge className={STATUS_CONFIG[s.status]?.className || ''}>
                      {STATUS_CONFIG[s.status]?.label || s.status}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {INQUIRY_LABELS[s.inquiry_type] || s.inquiry_type}
                    </Badge>
                    {s.assigned_to_name && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Assigned: {s.assigned_to_name}
                      </Badge>
                    )}
                  </div>
                  {s.subject && <p className="text-sm font-medium mb-0.5 truncate">{s.subject}</p>}
                  <p className="text-sm text-muted-foreground line-clamp-1">{s.message}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                    {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                    <span>{formatDateTime(s.created_date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Select value={s.status} onValueChange={(v) => updateStatus(s, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>{STATUS_CONFIG[st].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => openDetail(s)}>
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-error hover:text-error" onClick={() => remove(s)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-flame-500" />
                  {selected.subject || 'Contact Submission'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">From</p>
                    <p className="font-medium">{selected.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Inquiry Type</p>
                    <p className="font-medium">{INQUIRY_LABELS[selected.inquiry_type] || selected.inquiry_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-sm font-medium text-flame-600 hover:underline flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {selected.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    {selected.phone ? (
                      <a href={`tel:${selected.phone}`} className="text-sm font-medium text-flame-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {selected.phone}
                      </a>
                    ) : <p className="text-sm text-muted-foreground">—</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Preferred Contact</p>
                    <p className="text-sm font-medium capitalize">{selected.preferred_contact_method || 'email'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Received</p>
                    <p className="text-sm font-medium">{formatDateTime(selected.created_date)}</p>
                  </div>
                </div>

                {/* Message */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-2">Message</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Admin controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={detailForm.status} onValueChange={(v) => setDetailForm((f) => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{STATUS_CONFIG[st].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assigned To</Label>
                    <Input
                      value={detailForm.assigned_to_name}
                      onChange={(e) => setDetailForm((f) => ({ ...f, assigned_to_name: e.target.value }))}
                      placeholder="Staff member name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Admin Notes</Label>
                  <Textarea
                    rows={3}
                    value={detailForm.notes}
                    onChange={(e) => setDetailForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Internal notes about this enquiry..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="text-error hover:text-error" onClick={() => remove(selected)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Button onClick={saveDetail} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
                  {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}