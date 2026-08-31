import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image as OptimizedImage } from '@/components/ui/image';
import { cn } from '@/lib/utils';

const ACCEPT = { image: 'image/*', gallery: 'image/*', videos: 'video/*' };

/**
 * File-upload field for CMS content.
 * type: "image" (single image), "gallery" (multiple images), "videos" (multiple videos).
 * Uploads via the Core.UploadFile integration and returns stored URLs to onChange.
 */
export default function MediaUploadField({ type = 'image', value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const isMulti = type === 'gallery' || type === 'videos';
  const items = isMulti ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      onChange(isMulti ? [...items, ...uploaded] : uploaded[0]);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const removeAt = (idx) => {
    onChange(isMulti ? items.filter((_, i) => i !== idx) : '');
  };

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-flame-400 hover:bg-flame-50/50 transition-colors">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-flame-500" /> : <Upload className="w-4 h-4 text-flame-500" />}
        <span>{uploading ? 'Uploading…' : isMulti ? `Add ${type === 'videos' ? 'videos' : 'images'}` : 'Upload image'}</span>
        <input
          type="file"
          accept={ACCEPT[type]}
          multiple={isMulti}
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </label>

      {items.length > 0 && (
        <div className={cn('grid gap-2', isMulti ? 'grid-cols-3' : 'grid-cols-1')}>
          {items.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-border bg-muted">
              {type === 'videos' ? (
                <video src={url} preload="metadata" controls className="w-full h-24 object-cover" />
              ) : (
                <OptimizedImage src={url} fittingType="fill" className="w-full h-24" />
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 rounded-full bg-brand-900/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}