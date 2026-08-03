import { useState } from 'react';
import { Scale, Info, Check, AlertCircle, Upload, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';

export default function PowerOfAttorneyPanel({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const set = (key, value) => onChange?.({ ...data, [key]: value });

  const handleUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('poa_uploaded_url', file_url);
    } catch { setUploadError('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Legal notice */}
      <div className="flex gap-3 rounded-xl border border-info/20 bg-info/5 p-4">
        <Info className="h-5 w-5 shrink-0 text-info" />
        <div className="text-sm text-brand-900">
          <p className="font-semibold">Important Legal Notice</p>
          <p className="mt-1 text-muted-foreground">
            This module facilitates the preparation, collection, and review of Power of Attorney documents. Submitting information here does <strong>not</strong> constitute a legally binding execution of a Power of Attorney. Any legally required execution steps and jurisdiction-specific formalities are handled through the company's legal process.
          </p>
        </div>
      </div>

      {/* PoA explanation */}
      <div className="rounded-xl border border-brand-100 bg-ice-50 p-5">
        <h4 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <Scale className="h-4 w-4 text-flame-500" /> What is a Power of Attorney?
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A Power of Attorney (PoA) is a legal document that authorises another person to act on your behalf in specified matters. In the context of property submission, granting a PoA to Property Question Nigeria Limited allows our team to handle documentation, negotiations, and regulatory processes on your behalf, streamlining the sale, lease, or management of your property.
        </p>
      </div>

      {/* PoA draft template preview */}
      <div className="rounded-xl border border-brand-100 bg-white p-5">
        <h4 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <FileText className="h-4 w-4 text-brand-700" /> Draft Power of Attorney Template
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">Review the draft template below. The final document will be prepared by our legal team based on your information.</p>
        <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-brand-100 bg-ice-50 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-brand-900">POWER OF ATTORNEY</p>
          <p className="mt-2">I, [OWNER NAME], of [ADDRESS], hereby appoint Property Question Nigeria Limited as my lawful attorney to act on my behalf for the purpose of [SPECIFIED SERVICES] relating to my property located at [PROPERTY ADDRESS]...</p>
          <p className="mt-2">This Power of Attorney shall remain valid until [EXPIRY DATE] or until formally revoked in writing...</p>
        </div>
      </div>

      {/* Decision */}
      <div className="rounded-xl border border-brand-100 bg-white p-5">
        <h4 className="mb-3 font-heading text-sm font-bold text-brand-900">Do you wish to proceed with a Power of Attorney?</h4>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-100 p-3 transition hover:bg-ice-50">
            <Checkbox checked={data?.poa_wishes_to_proceed === true} onCheckedChange={(c) => set('poa_wishes_to_proceed', c || false)} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand-900">Yes, I want a Power of Attorney prepared</p>
              <p className="text-xs text-muted-foreground">Our legal team will prepare the PoA based on your information and contact you for execution.</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-100 p-3 transition hover:bg-ice-50">
            <Checkbox checked={data?.poa_wishes_to_proceed === false && data?.poa_decision_made === true} onCheckedChange={(c) => { set('poa_wishes_to_proceed', false); set('poa_decision_made', c || false); }} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand-900">No, I will handle matters directly</p>
              <p className="text-xs text-muted-foreground">You retain full control and will interact with our team for all documentation.</p>
            </div>
          </label>
        </div>
      </div>

      {/* PoA information collection */}
      {data?.poa_wishes_to_proceed && (
        <div className="space-y-4 rounded-xl border border-flame-200 bg-flame-50/50 p-5">
          <h4 className="font-heading text-sm font-bold text-brand-900">Information for PoA Preparation</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Identification Type</Label>
              <Input value={data?.poa_id_type || ''} onChange={(e) => set('poa_id_type', e.target.value)} placeholder="e.g. National ID, Driver's License" className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Identification Number</Label>
              <Input value={data?.poa_id_number || ''} onChange={(e) => set('poa_id_number', e.target.value)} placeholder="ID number" className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Scope of Authority</Label>
              <Input value={data?.poa_scope || ''} onChange={(e) => set('poa_scope', e.target.value)} placeholder="e.g. Sale and documentation only" className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Validity Period</Label>
              <Input value={data?.poa_validity || ''} onChange={(e) => set('poa_validity', e.target.value)} placeholder="e.g. 12 months" className="bg-white" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Additional Notes</Label>
            <Textarea value={data?.poa_notes || ''} onChange={(e) => set('poa_notes', e.target.value)} placeholder="Any specific instructions or limitations..." rows={2} className="bg-white" />
          </div>
        </div>
      )}

      {/* Upload existing PoA */}
      <div className="rounded-xl border border-brand-100 bg-white p-5">
        <h4 className="mb-1 font-heading text-sm font-bold text-brand-900">Upload Existing Power of Attorney (if any)</h4>
        <p className="mb-3 text-xs text-muted-foreground">If you already have a signed and executed PoA, upload it here for our legal review.</p>
        {data?.poa_uploaded_url ? (
          <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <span className="flex-1 text-sm text-brand-900">PoA document uploaded</span>
            <button onClick={() => set('poa_uploaded_url', '')} className="text-xs text-error hover:underline">Remove</button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-ice-50 p-5 text-center transition hover:border-flame-400 hover:bg-flame-50">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-flame-500" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
            <p className="mt-2 text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload signed PoA (PDF, JPG, PNG)'}</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
          </label>
        )}
        {uploadError && <p className="mt-1 text-xs text-error">{uploadError}</p>}
      </div>

      {/* Review notice */}
      {data?.poa_uploaded_url && (
        <div className="flex gap-3 rounded-xl border border-warning/20 bg-warning/5 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-xs text-muted-foreground">Your uploaded PoA will undergo internal legal review before it becomes effective. You will be notified of the review outcome.</p>
        </div>
      )}
    </div>
  );
}