import { useState, useEffect } from 'react';
import { Loader2, Trash2, FileText, Map, Plane, Video, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CONTENT_CATEGORIES } from '@/components/admin/projects/ProjectContentUpload';

const CATEGORY_META = {
  image: { label: 'Images', icon: ImageIcon },
  video: { label: 'Videos', icon: Video },
  drone_video: { label: 'Drone Videos', icon: Plane },
  brochure: { label: 'Brochures', icon: FileText },
  survey_plan: { label: 'Survey Plans', icon: Map },
};

export default function ProjectContentList({ projectId, refreshKey, onDeleted }) {
  const [media, setMedia] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!projectId) { setMedia([]); setDocuments([]); return; }
    setLoading(true);
    const [m, d] = await Promise.all([
      base44.entities.ProjectMedia.filter({ project_id: projectId }, 'display_order', 200).catch(() => []),
      base44.entities.ProjectDocument.filter({ project_id: projectId }, '-created_date', 200).catch(() => []),
    ]);
    setMedia(m);
    setDocuments(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, [projectId, refreshKey]);

  const handleDelete = async (item, type) => {
    if (!window.confirm(`Delete "${item.title || item.document_name}"? This removes it from the public site.`)) return;
    if (type === 'media') await base44.entities.ProjectMedia.delete(item.id).catch(() => {});
    else await base44.entities.ProjectDocument.delete(item.id).catch(() => {});
    onDeleted?.();
    load();
  };

  if (!projectId) return null;
  if (loading) return (
    <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-flame-500" /></div>
  );

  const groups = CONTENT_CATEGORIES.map((cat) => {
    if (cat.entity === 'media') {
      return { ...cat, items: media.filter((m) => m.media_type === cat.media_type) };
    }
    return { ...cat, items: documents.filter((d) => d.document_type === cat.document_type) };
  }).filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center">
        <FileText className="h-10 w-10 text-brand-200" />
        <p className="mt-3 text-sm font-medium text-brand-900">No content uploaded yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Uploaded brochures, survey plans, images and videos will appear here and go live on the project page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.value}>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-900">
              <Icon className="h-4 w-4 text-flame-500" /> {group.label} <span className="text-muted-foreground">({group.items.length})</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((item) => {
                const url = item.media_url || item.document_url;
                const isImage = group.value === 'image';
                const isVideo = group.value === 'video' || group.value === 'drone_video';
                const isDoc = group.value === 'brochure' || group.value === 'survey_plan';
                return (
                  <div key={item.id} className="overflow-hidden rounded-xl border border-brand-100 bg-white">
                    <div className="relative aspect-video bg-brand-100">
                      {isImage ? (
                        <img src={url} alt={item.title} className="h-full w-full object-cover" />
                      ) : isVideo ? (
                        <video src={url} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Icon className="h-8 w-8 text-brand-300" /></div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold text-brand-900">{item.title || item.document_name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-flame-600"><ExternalLink className="h-3.5 w-3.5" /></a>
                        <button onClick={() => handleDelete(item, group.entity === 'media' ? 'media' : 'document')}
                          className="text-muted-foreground hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}