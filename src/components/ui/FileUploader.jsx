import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUploader({
  onUpload,
  accept = '*',
  multiple = true,
  label = 'Upload Files',
  hint,
}) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    async (fileList) => {
      const newItems = Array.from(fileList).map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        status: 'uploading',
        url: null,
      }));
      setFiles((prev) => [...prev, ...newItems]);

      for (const item of newItems) {
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'done', url: file_url } : f)),
          );
          onUpload?.(file_url);
        } catch {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'error' } : f)),
          );
        }
      }
    },
    [onUpload],
  );

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragging ? 'border-flame-400 bg-flame-50' : 'border-border hover:border-flame-300 hover:bg-flame-50/50',
        )}
      >
        <Upload className="h-8 w-8 text-flame-500" />
        <p className="mt-2 text-sm font-medium text-brand-900">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag &amp; drop or <span className="text-flame-600 underline">browse</span>
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-white p-3"
            >
              {item.status === 'done' ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-success" />
              ) : item.status === 'error' ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-error" />
              ) : (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-flame-500" />
              )}
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-900">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(item.size)}
                  {item.status === 'error' && ' — Upload failed'}
                </p>
              </div>
              <button
                onClick={() => removeFile(item.id)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-error"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}