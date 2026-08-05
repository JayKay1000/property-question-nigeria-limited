import React from 'react';
import { Download, FolderArchive, FileText, Film, Image as ImageIcon, MapPin, ExternalLink } from 'lucide-react';
import { downloadAll, fileNameFromUrl } from '@/lib/media-download';

const STATUS_TONE = {
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-amber-100 text-amber-700',
  poa_requested: 'bg-amber-100 text-amber-700',
  poa_signed: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

function Thumb({ url, kind, onPreview }) {
  return (
    <button
      type="button"
      onClick={() => onPreview({ url, name: fileNameFromUrl(url) })}
      className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted"
    >
      {kind === 'image' ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : kind === 'video' ? (
        <div className="flex h-full w-full items-center justify-center"><Film className="h-5 w-5 text-blue-500" /></div>
      ) : (
        <div className="flex h-full w-full items-center justify-center"><FileText className="h-5 w-5 text-emerald-500" /></div>
      )}
    </button>
  );
}

function FileRow({ url, kind, onPreview, onDownload }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-xs">
      <button type="button" onClick={() => onPreview({ url, name: fileNameFromUrl(url) })} className="flex min-w-0 items-center gap-2 text-left">
        {kind === 'video' ? <Film className="h-3.5 w-3.5 shrink-0 text-blue-500" /> : <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        <span className="truncate">{fileNameFromUrl(url)}</span>
      </button>
      <button type="button" onClick={() => onDownload(url)} className="ml-2 shrink-0 text-muted-foreground hover:text-foreground">
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function SubmissionMediaCard({ item, onPreview, onDownloadOne }) {
  const images = [item.featured_image_url, ...(item.image_urls || []), ...(item.photo_urls || [])].filter(Boolean);
  const videos = (item.video_urls || []).filter(Boolean);
  const docs = (item.document_urls || []).filter(Boolean);
  const all = [...images, ...videos, ...docs];
  const base = item.reference_number || (item.property_title || 'submission').replace(/\s+/g, '-');

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-heading text-sm font-bold text-foreground">{item.property_title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${STATUS_TONE[item.status] || 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {item.property_address || [item.address_line, item.city, item.state].filter(Boolean).join(', ') || '—'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.submitter_type || 'homeowner'} • {item.owner_name || item.owner_email || '—'} {item.reference_number ? `• ${item.reference_number}` : ''}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5 text-flame-500" /> {images.length}</span>
            <span className="inline-flex items-center gap-1"><Film className="h-3.5 w-3.5 text-blue-500" /> {videos.length}</span>
            <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-emerald-500" /> {docs.length}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => downloadAll(all, base)}
            disabled={!all.length}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-800 disabled:opacity-50"
          >
            <FolderArchive className="h-3.5 w-3.5" /> Download All ({all.length})
          </button>
          <a
            href="/admin/property-review"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Approval
          </a>
        </div>
      </div>

      {all.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">No media uploaded for this submission.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((u, i) => <Thumb key={`img-${i}`} url={u} kind="image" onPreview={onPreview} />)}
            </div>
          )}
          {(videos.length > 0 || docs.length > 0) && (
            <div className="flex flex-col gap-1">
              {videos.map((u, i) => <FileRow key={`vid-${i}`} url={u} kind="video" onPreview={onPreview} onDownload={onDownloadOne} />)}
              {docs.map((u, i) => <FileRow key={`doc-${i}`} url={u} kind="document" onPreview={onPreview} onDownload={onDownloadOne} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}