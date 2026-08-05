import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Images, LayoutGrid, Film, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaReviewStats from '@/components/admin/media/MediaReviewStats';
import SubmissionMediaCard from '@/components/admin/media/SubmissionMediaCard';
import MediaPreviewDialog from '@/components/admin/media/MediaPreviewDialog';
import { downloadFile, fileNameFromUrl } from '@/lib/media-download';

export default function MediaReviewCenter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitter, setSubmitter] = useState('all');
  const [status, setStatus] = useState('all');
  const [mediaType, setMediaType] = useState('all');
  const [view, setView] = useState('submissions');
  const [preview, setPreview] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PropertyListing.list('-created_date', 500);
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const onDownloadOne = (url) => downloadFile(url, fileNameFromUrl(url));

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (submitter !== 'all' && (s.submitter_type || 'homeowner') !== submitter) return false;
      if (status !== 'all' && s.status !== status) return false;
      if (mediaType !== 'all') {
        const hasImages = (s.image_urls?.length || 0) + (s.photo_urls?.length || 0) + (s.featured_image_url ? 1 : 0) > 0;
        const hasVideos = (s.video_urls?.length || 0) > 0;
        const hasDocs = (s.document_urls?.length || 0) > 0;
        if (mediaType === 'images' && !hasImages) return false;
        if (mediaType === 'videos' && !hasVideos) return false;
        if (mediaType === 'documents' && !hasDocs) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${s.property_title || ''} ${s.owner_name || ''} ${s.owner_email || ''} ${s.reference_number || ''} ${s.property_address || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, submitter, status, mediaType]);

  const flatMedia = useMemo(() => {
    const list = [];
    filtered.forEach((s) => {
      [s.featured_image_url, ...(s.image_urls || []), ...(s.photo_urls || [])].filter(Boolean).forEach((u) => list.push({ url: u, type: 'image', sub: s }));
      (s.video_urls || []).filter(Boolean).forEach((u) => list.push({ url: u, type: 'video', sub: s }));
      (s.document_urls || []).filter(Boolean).forEach((u) => list.push({ url: u, type: 'document', sub: s }));
    });
    return list;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Media Review Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and download all images, videos, and documents uploaded with property submissions before final approval.</p>
      </div>

      <MediaReviewStats submissions={items} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, submitter, ref…" className="pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={submitter} onValueChange={setSubmitter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Submitter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All submitters</SelectItem>
              <SelectItem value="homeowner">Homeowner</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="submitted">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={mediaType} onValueChange={setMediaType}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Media" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All media</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
            </SelectContent>
          </Select>
          <div className="inline-flex rounded-md border border-border">
            <button type="button" onClick={() => setView('submissions')} className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${view === 'submissions' ? 'bg-brand-700 text-white' : 'text-foreground hover:bg-muted'}`}><LayoutGrid className="h-3.5 w-3.5" /> By Submission</button>
            <button type="button" onClick={() => setView('all')} className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${view === 'all' ? 'bg-brand-700 text-white' : 'text-foreground hover:bg-muted'}`}><Images className="h-3.5 w-3.5" /> All Media</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          <p className="mt-3 text-sm text-muted-foreground">Loading submissions…</p>
        </div>
      ) : view === 'submissions' ? (
        filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No submissions match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <SubmissionMediaCard key={item.id} item={item} onPreview={setPreview} onDownloadOne={onDownloadOne} />
            ))}
          </div>
        )
      ) : flatMedia.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No media matches your filters.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {flatMedia.map((m, i) => (
            <button key={i} type="button" onClick={() => setPreview({ url: m.url, name: fileNameFromUrl(m.url) })} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              {m.type === 'image' ? <img src={m.url} alt="" className="h-full w-full object-cover" /> : m.type === 'video' ? <div className="flex h-full w-full items-center justify-center"><Film className="h-6 w-6 text-blue-500" /></div> : <div className="flex h-full w-full items-center justify-center"><FileText className="h-6 w-6 text-emerald-500" /></div>}
              <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">{m.sub.property_title}</span>
            </button>
          ))}
        </div>
      )}

      <MediaPreviewDialog media={preview} onClose={() => setPreview(null)} />
    </div>
  );
}