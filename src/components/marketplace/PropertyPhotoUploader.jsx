import { useState, useRef } from 'react';
import { Loader2, Upload, X, Star, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { optimizeImageFile } from '@/lib/image-optimize';

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';
// Hard ceiling on the raw file — large phone photos are auto-optimized down
// before upload, but we reject anything above this so uploads stay bounded.
const MAX_SIZE = 10 * 1024 * 1024;

export default function PropertyPhotoUploader({ images = [], onChange, maxImages = 20, coverIndex = 0, onCoverChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const safeCover = Math.min(Math.max(coverIndex, 0), Math.max(images.length - 1, 0));
  const setCover = (idx) => onCoverChange?.(idx);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError('');
    const remaining = maxImages - images.length;
    if (remaining <= 0) { setError(`Maximum ${maxImages} images.`); return; }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of toUpload) {
        if (file.size > MAX_SIZE) { setError(`${file.name} is too large (max 10MB).`); continue; }
        if (!file.type.startsWith('image/')) { setError(`${file.name} is not an image.`); continue; }
        // Shrink and re-encode before upload for fast loading on slow connections.
        const optimized = await optimizeImageFile(file);
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: optimized });
        uploaded.push(file_url);
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    // Keep cover pointing at a valid image; if we removed the cover, fall back to 0
    if (idx === safeCover) {
      setCover(Math.min(idx, Math.max(next.length - 1, 0)));
    } else if (idx < safeCover) {
      setCover(safeCover - 1);
    }
  };

  const moveImage = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    const next = [...images];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
    // Track cover through the swap
    if (idx === safeCover) setCover(newIdx);
    else if (newIdx === safeCover) setCover(idx);
  };

  return (
    <div>
      {/* Upload area */}
      <div
        onClick={() => images.length < maxImages && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
          images.length < maxImages ? 'border-brand-200 hover:border-flame-400 hover:bg-flame-50' : 'border-border opacity-50'
        }`}
      >
        {uploading ? (
          <><Loader2 className="h-6 w-6 animate-spin text-flame-500" /><p className="mt-2 text-sm text-muted-foreground">Optimizing & uploading…</p></>
        ) : (
          <><Upload className="h-6 w-6 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">Click or drag to upload property photos</p><p className="text-xs text-muted-foreground/60">JPG, PNG or WebP — auto-optimized for fast loading (max 10MB each, up to {maxImages})</p></>
        )}
        <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((url, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-brand-50">
              <Image src={url} alt={`Photo ${idx + 1}`} fittingType="fill" className="h-full w-full" />
              {/* Cover badge */}
              {idx === safeCover && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-flame-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" /> Cover
                </span>
              )}
              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-brand-950/0 opacity-0 transition-all group-hover:bg-brand-950/40 group-hover:opacity-100">
                <button onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-700 disabled:opacity-30" title="Move left">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-700 disabled:opacity-30" title="Move right">
                  <ChevronRight className="h-4 w-4" />
                </button>
                {idx !== safeCover && (
                  <button onClick={() => setCover(idx)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-flame-600" title="Set as cover">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => removeImage(idx)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-error" title="Remove">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" /> No photos uploaded yet. Upload photos, then tap the star on any photo to set it as the cover.
        </div>
      )}
    </div>
  );
}