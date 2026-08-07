import React, { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Upload equirectangular 360° panorama images and manage the stored URL list.
 * `value` is string[] of panorama image URLs; onChange(string[]).
 */
export default function PanoramaUploader({ value = [], onChange }) {
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        if (file_url) urls.push(file_url);
      }
      onChange([...value, ...urls]);
    } catch (e) {
      console.error("Panorama upload failed:", e);
    } finally {
      setBusy(false);
    }
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground hover:border-flame-400 hover:text-flame-600">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? "Uploading 360° panoramas…" : "Upload 360° panorama images (equirectangular)"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative h-16 w-24 overflow-hidden rounded-lg border border-border">
              <img src={url} alt={`360-${i}`} className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-brand-900/70 px-1 text-[9px] font-semibold text-white">360°</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive p-0.5 text-white"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Use full 360° equirectangular images (2:1 ratio) for the best virtual tour experience.</p>
    </div>
  );
}