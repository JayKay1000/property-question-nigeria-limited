import { useState, useRef } from 'react';
import { Loader2, Upload, X, CheckCircle2, FileText, ShieldCheck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const ACCEPT = '.pdf,.jpg,.jpeg,.png';
const MAX_SIZE = 10 * 1024 * 1024;

const EVIDENCE_TYPES = [
  { value: 'ownership_document', label: 'Evidence of ownership or property interest' },
  { value: 'authority_to_market', label: 'Evidence of authority to advertise/market' },
  { value: 'title_document', label: 'Title or transaction document' },
  { value: 'other_supporting_evidence', label: 'Other supporting evidence' },
];

export default function PropertyVerificationSubmit({ listing, onDone, onCancel }) {
  const [evidenceType, setEvidenceType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (file.size > MAX_SIZE) { setError('File too large (max 10MB).'); return; }
    const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
    if (!ext || !['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) { setError('Only PDF, JPG, and PNG files are accepted.'); return; }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setUploaded({ uri: file_uri, name: file.name, size: file.size });
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!evidenceType) { setError('Please select an evidence type.'); return; }
    if (!uploaded?.uri) { setError('Please upload your evidence document.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await base44.functions.invoke('submitPropertyVerification', {
        property_id: listing.id,
        evidence_type: evidenceType,
        evidence_description: description.trim(),
        document_file_uri: uploaded.uri,
        document_filename: uploaded.name,
      });
      onDone?.();
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-brand-50/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Home className="h-4 w-4 text-brand-700" />
        <p className="text-sm font-semibold text-brand-900">Request Property Verification</p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Submit evidence (e.g. ownership documents, authority to market) for review by PQNL staff.
        Property verification is separate from your agent identity verification and does not constitute
        a guarantee of title or ownership.
      </p>

      <div className="space-y-3">
        <div>
          <Label className="mb-1.5 text-xs font-semibold text-brand-900">Evidence type *</Label>
          <Select value={evidenceType || '__none__'} onValueChange={(v) => setEvidenceType(v === '__none__' ? '' : v)}>
            <SelectTrigger className="h-9 border-input bg-white text-sm">
              <SelectValue placeholder="Select evidence type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Select…</SelectItem>
              {EVIDENCE_TYPES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 text-xs font-semibold text-brand-900">Description (optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this evidence demonstrates..."
            rows={2}
            className="text-sm"
          />
        </div>

        <div>
          {!uploaded ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand-200 bg-white p-4 text-center transition hover:border-flame-400 hover:bg-flame-50"
            >
              {uploading ? (
                <><Loader2 className="h-5 w-5 animate-spin text-flame-500" /><p className="mt-1.5 text-xs text-muted-foreground">Uploading…</p></>
              ) : (
                <><Upload className="h-5 w-5 text-muted-foreground" /><p className="mt-1.5 text-xs text-muted-foreground">Click or drag to upload</p><p className="text-[10px] text-muted-foreground/60">PDF, JPG, PNG (max 10MB)</p></>
              )}
              <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg border border-success/20 bg-white p-2.5">
              <FileText className="h-5 w-5 shrink-0 text-brand-700" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-brand-900">{uploaded.name}</p>
                <p className="flex items-center gap-1 text-[10px] text-success"><CheckCircle2 className="h-3 w-3" /> Uploaded (stored privately)</p>
              </div>
              <button onClick={() => setUploaded(null)} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-error/10 hover:text-error">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-1.5 rounded-lg bg-brand-50 p-2">
          <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Your document is stored privately and reviewed only by authorized PQNL staff.
            Property verification confirms that evidence was reviewed under the stated scope —
            it does not constitute a land registry search, title confirmation, or legal ownership guarantee.
          </p>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={onCancel} variant="ghost" size="sm" className="text-muted-foreground">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || uploading} size="sm" className="flex-1 bg-flame-500 text-white hover:bg-flame-600">
            {submitting ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Submitting…</> : 'Submit for Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}