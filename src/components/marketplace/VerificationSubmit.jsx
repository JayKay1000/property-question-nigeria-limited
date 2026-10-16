import { useState, useRef } from 'react';
import { Loader2, Upload, X, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { IDENTITY_DOCUMENT_TYPES, ADDRESS_DOCUMENT_TYPES } from '@/lib/marketplace-utils';

const ACCEPT = '.pdf,.jpg,.jpeg,.png';
const MAX_SIZE = 10 * 1024 * 1024;

export default function VerificationSubmit({ type, onDone, onCancel }) {
  const [docType, setDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const docTypes = type === 'identity' ? IDENTITY_DOCUMENT_TYPES : ADDRESS_DOCUMENT_TYPES;

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
    if (!docType) { setError('Please select a document type.'); return; }
    if (!uploaded?.uri) { setError('Please upload your document.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await base44.functions.invoke('submitMarketplaceVerification', {
        verification_type: type,
        document_type: docType,
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
    <div className="mt-3 rounded-xl border border-border bg-brand-50/30 p-4">
      <Select value={docType || '__none__'} onValueChange={(v) => setDocType(v === '__none__' ? '' : v)}>
        <SelectTrigger className="h-9 border-input bg-white text-sm">
          <SelectValue placeholder="Select document type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Select…</SelectItem>
          {docTypes.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="mt-3">
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

      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-brand-50 p-2">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
        <p className="text-[10px] leading-relaxed text-muted-foreground">Your document is stored privately and reviewed only by authorized PQNL staff. It is never published publicly.</p>
      </div>

      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      <div className="mt-3 flex gap-2">
        <Button onClick={onCancel} variant="ghost" size="sm" className="text-muted-foreground">Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting || uploading} size="sm" className="flex-1 bg-flame-500 text-white hover:bg-flame-600">
          {submitting ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Submitting…</> : 'Submit for Review'}
        </Button>
      </div>
    </div>
  );
}