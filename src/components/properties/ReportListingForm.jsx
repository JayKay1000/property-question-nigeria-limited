import { useState } from 'react';
import { Flag, Loader2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const REPORT_REASONS = [
  { value: 'scam_impersonation', label: 'Suspected scam or impersonation' },
  { value: 'incorrect_details', label: 'Incorrect price or property details' },
  { value: 'duplicate', label: 'Suspected duplicate advertisement' },
  { value: 'no_longer_available', label: 'No longer available' },
  { value: 'unauthorized_advertising', label: 'Unauthorized advertising' },
  { value: 'suspicious_payment', label: 'Suspicious payment request' },
  { value: 'other', label: 'Other concern' },
];

export default function ReportListingForm({ property, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason for your report.'); return; }
    if (description.trim().length < 10) { setError('Please describe your concern (at least 10 characters).'); return; }
    setError('');
    setSubmitting(true);
    try {
      await base44.functions.invoke('submitListingReport', {
        property_id: property.id,
        report_reason: reason,
        description: description.trim(),
        reporter_name: reporterName.trim() || undefined,
        reporter_email: reporterEmail.trim() || undefined,
        reporter_phone: reporterPhone.trim() || undefined,
      });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit report. Please try again.');
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-success/20 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 font-heading text-lg font-bold text-brand-900">Report Submitted</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you. Our team will review your report. If we need more information, we may contact you using the details you provided.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4 border-brand-200">Close</Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-error" />
          <h3 className="font-heading text-base font-bold text-brand-900">Report This Listing</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        Help keep the marketplace safe. Report listings that seem suspicious, contain incorrect information, or violate our policies.
        Your contact details are optional and kept private.
      </p>

      <div className="space-y-3">
        <div>
          <Label className="mb-1.5 text-xs font-semibold text-brand-900">Reason *</Label>
          <Select value={reason || '__none__'} onValueChange={(v) => setReason(v === '__none__' ? '' : v)}>
            <SelectTrigger className="h-9 border-input bg-white text-sm">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Select…</SelectItem>
              {REPORT_REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 text-xs font-semibold text-brand-900">Describe your concern *</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about your concern..."
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Your name (optional)</Label>
            <Input value={reporterName} onChange={(e) => setReporterName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Email (optional)</Label>
            <Input type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Phone (optional)</Label>
            <Input value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex gap-2 pt-1">
          {onClose && <Button onClick={onClose} variant="ghost" size="sm" className="text-muted-foreground">Cancel</Button>}
          <Button onClick={handleSubmit} disabled={submitting} size="sm" className="flex-1 bg-error text-white hover:bg-error/90">
            {submitting ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Submitting…</> : <><Flag className="mr-1.5 h-3.5 w-3.5" /> Submit Report</>}
          </Button>
        </div>
      </div>
    </div>
  );
}