import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const ACCEPT_TYPES = '.pdf,.jpg,.jpeg,.png';

export default function DocumentUploader({ label, required, onUploaded, accept = ACCEPT_TYPES }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploaded({ url: file_url, name: file.name, size: file.size });
      onUploaded?.(file_url, file.name);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setUploaded(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onUploaded?.(null);
  };

  const isImage = uploaded?.url?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-900">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {!uploaded ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-ice-50 p-5 text-center transition hover:border-flame-400 hover:bg-flame-50"
        >
          {uploading ? (
            <><Loader2 className="h-6 w-6 animate-spin text-flame-500" /><p className="mt-2 text-xs text-muted-foreground">Uploading...</p></>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Click or drag to upload</p>
              <p className="text-[10px] text-muted-foreground/60">PDF, JPG, PNG (max 10MB)</p>
            </>
          )}
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
            {isImage ? <ImageIcon className="h-5 w-5 text-info" /> : <FileText className="h-5 w-5 text-brand-700" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-900">{uploaded.name}</p>
            <p className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" /> Uploaded</p>
          </div>
          <button onClick={handleRemove} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-error/10 hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}