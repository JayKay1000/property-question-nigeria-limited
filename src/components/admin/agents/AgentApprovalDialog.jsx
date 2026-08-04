import React, { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import AgentDocumentsPanel from '@/components/admin/superadmin/AgentDocumentsPanel';

export default function AgentApprovalDialog({ agent, onClose, onDecided }) {
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!agent) return null;

  const updateAgent = async (patch) => {
    setBusy(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      const now = new Date().toISOString();
      const payload = { ...patch, verified_at: now };
      if (me?.id) payload.verified_by = me.id;
      if (patch.status === 'active' && !agent.agent_code) {
        payload.agent_code = `PQ-AGT-${Date.now().toString().slice(-6)}`;
      }
      if (reason && patch.verification_status === 'rejected') {
        payload.metadata = { ...(agent.metadata || {}), rejection_reason: reason };
      }
      await base44.entities.Agent.update(agent.id, payload);
      onDecided();
    } catch (err) {
      console.error('Agent update failed:', err);
      setBusy(false);
    }
  };

  const handleApprove = () => updateAgent({ status: 'active', verification_status: 'verified' });
  const handleReject = () => updateAgent({ status: 'inactive', verification_status: 'rejected' });
  const handleUnderReview = () => updateAgent({ status: 'under_review' });

  return (
    <Dialog open={!!agent} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Application Review</DialogTitle>
        </DialogHeader>

        {/* Profile */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-100">
            {agent.photo_url ? (
              <Image src={agent.photo_url} alt={agent.full_name} fittingType="fill" className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-700">
                {agent.full_name?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-bold text-foreground">{agent.full_name}</h3>
            {agent.agent_code && <p className="text-xs text-muted-foreground">{agent.agent_code}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {agent.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{agent.email}</span>}
              {agent.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{agent.phone}</span>}
              {agent.specialization && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{agent.specialization}</span>}
            </div>
            {agent.service_areas?.length > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {agent.service_areas.join(', ')}
              </div>
            )}
            <div className="mt-2">
              <Badge variant="secondary" className="capitalize">{(agent.status || 'pending').replace('_', ' ')}</Badge>
            </div>
          </div>
        </div>

        {agent.bio && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">{agent.bio}</p>
          </div>
        )}

        {/* Documents */}
        <AgentDocumentsPanel agentId={agent.id} />

        {/* Rejection reason */}
        {rejectOpen && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <label className="text-xs font-medium text-rose-700">Reason for rejection (optional)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-1 bg-white" placeholder="e.g. Documents unclear, incomplete application…" />
          </div>
        )}

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={handleUnderReview} disabled={busy || agent.status === 'under_review'}>
            <Clock className="mr-1 h-4 w-4" /> Mark Under Review
          </Button>
          {rejectOpen ? (
            <Button variant="destructive" onClick={handleReject} disabled={busy} className="flex-1">
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
              Confirm Reject
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={busy} className="flex-1">
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          )}
          <Button onClick={handleApprove} disabled={busy || agent.status === 'active'} className="flex-1 bg-success hover:bg-success/90">
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
            Approve Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}