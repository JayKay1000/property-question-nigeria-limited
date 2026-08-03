import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ClipboardCheck, Check, X, MessageSquare, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { approvalStatusConfig, priorityConfig, formatDate } from '@/lib/cms-utils';

export default function ApprovalQueuePanel() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [deciding, setDeciding] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setApprovals(await base44.entities.ContentApproval.list('-created_date', 100)); }
    catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDecide = async (decision) => {
    const { id, comments } = deciding;
    try {
      await base44.entities.ContentApproval.update(id, {
        status: decision,
        comments: comments || '',
        decided_at: new Date().toISOString(),
      });
      toast({ title: decision === 'approved' ? 'Approved' : 'Rejected', description: 'Decision recorded.' });
      setDeciding(null);
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const filtered = statusFilter === 'all' ? approvals : approvals.filter(a => a.status === statusFilter);
  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-flame-500" /> Approval Queue ({pendingCount} pending)</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {['pending', 'approved', 'rejected', 'all'].map(s => (
              <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
                className={statusFilter === s ? 'bg-brand-900 text-white border-0 capitalize' : 'capitalize'}
                onClick={() => setStatusFilter(s)}>{s === 'all' ? 'All' : s}</Button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No {statusFilter} approvals.</Card>}
        {!loading && filtered.map(a => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="capitalize">{a.content_type}</Badge>
                  <span className="font-medium truncate">{a.record_title || 'Untitled'}</span>
                  <Badge variant="secondary" className={approvalStatusConfig[a.status]?.className || ''}>{approvalStatusConfig[a.status]?.label || a.status}</Badge>
                  <Badge variant="secondary" className={priorityConfig[a.priority] || ''}>{a.priority || 'normal'}</Badge>
                </div>
                {a.change_summary && <p className="text-sm text-muted-foreground">{a.change_summary}</p>}
                {a.comments && <p className="text-sm mt-1 italic text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {a.comments}</p>}
                <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                  <span>Requested by {a.requested_by_name || '—'}</span>
                  <span>{formatDate(a.requested_at || a.created_date)}</span>
                  {a.reviewer_name && <span>Reviewed by {a.reviewer_name}</span>}
                </div>
              </div>
              {a.status === 'pending' && (
                <Button size="sm" variant="outline" onClick={() => setDeciding({ ...a, comments: '' })} className="shrink-0"><ClipboardCheck className="w-3.5 h-3.5 mr-1" /> Review</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!deciding} onOpenChange={o => !o && setDeciding(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Review: {deciding?.record_title}</DialogTitle></DialogHeader>
          {deciding?.change_summary && <p className="text-sm text-muted-foreground">{deciding.change_summary}</p>}
          <div className="space-y-1.5">
            <Label htmlFor="comments">Reviewer Comments</Label>
            <Textarea id="comments" value={deciding?.comments || ''} rows={3}
              onChange={e => setDeciding(d => ({ ...d, comments: e.target.value }))} placeholder="Add feedback for the content author…" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeciding(null)}>Cancel</Button>
            <Button onClick={() => handleDecide('rejected')} className="bg-error text-white border-0 hover:bg-error/90"><X className="w-4 h-4 mr-1" /> Reject</Button>
            <Button onClick={() => handleDecide('approved')} className="bg-success text-white border-0 hover:bg-success/90"><Check className="w-4 h-4 mr-1" /> Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}