import { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon, Video, Plane, FileText, Map } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const CONTENT_CATEGORIES = [
  { value: 'image', label: 'Images', accept: 'image/*', icon: ImageIcon, entity: 'media', media_type: 'image' },
  { value: 'video', label: 'Videos', accept: 'video/*', icon: Video, entity: 'media', media_type: 'video' },
  { value: 'drone_video', label: 'Drone Videos', accept: 'video/*', icon: Plane, entity: 'media', media_type: 'drone_video' },
  { value: 'brochure', label: 'Brochures', accept: 'application/pdf,image/*', icon: FileText, entity: 'media', media_type: 'brochure' },
  { value: 'survey_plan', label: 'Survey Plans', accept: 'application/pdf,image/*', icon: Map, entity: 'document', document_type: 'survey_plan' },
];

export default function ProjectContentUpload({ projectId, projectName, onUploaded }) {
  const [category, setCategory] = useState('image');
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const config = CONTENT_CATEGORIES.find((c) => c.value === category);

  const handleUpload = async () => {
    if (!projectId) { alert('Please select a project first.'); return; }
    if (!files.length) { alert('Please choose files to upload.'); return; }
    setUploading(true);
    let success = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (!file_url) throw new Error(`Upload failed for ${file.name}`);
        const label = title || file.name;
        if (config.entity === 'media') {
          await base44.entities.ProjectMedia.create({
            project_id: projectId,
            project_name: projectName,
            media_type: config.media_type,
            media_url: file_url,
            title: label,
            visibility: 'public',
            display_order: 0,
          });
        } else {
          await base44.entities.ProjectDocument.create({
            project_id: projectId,
            project_name: projectName,
            document_name: label,
            document_type: config.document_type,
            document_url: file_url,
            version: '1.0',
          });
        }
        success++;
      } catch (err) {
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    setUploading(false);
    setProgress('');
    setFiles([]);
    setTitle('');
    if (success > 0) {
      onUploaded?.();
      alert(`${success} file(s) uploaded successfully and are now live.`);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-brand-900">
        <Upload className="h-4 w-4 text-flame-500" /> Upload Content
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content Type</label>
          <Select value={category} onValueChange={(v) => { setCategory(v); setFiles([]); }}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTENT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="flex items-center gap-2"><c.icon className="h-4 w-4" /> {c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title / Label (optional)</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${config.label} – ${projectName || 'Project'}`}
            className="h-10 border-brand-200 bg-ice-50" />
          <p className="mt-1 text-xs text-muted-foreground">Leave blank to use the file name.</p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Files</label>
          <div className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            "border-border hover:border-flame-300 hover:bg-flame-50/50"
          )}>
            <config.icon className="h-7 w-7 text-flame-500" />
            <p className="mt-2 text-sm font-medium text-brand-900">Choose {config.label.toLowerCase()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Accepts: {config.accept.replace('image/', '').replace('video/', '').replace('application/', '')}</p>
            <input type="file" multiple accept={config.accept} className="hidden" id="content-file-input"
              onChange={(e) => setFiles(Array.from(e.target.files))} />
            <label htmlFor="content-file-input" className="mt-3 cursor-pointer text-sm font-semibold text-flame-600 underline">Browse files</label>
          </div>
          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs">
                  <config.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-brand-900">{f.name}</span>
                  <span className="ml-auto text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleUpload} disabled={uploading || !files.length} className="w-full bg-flame-500 hover:bg-flame-600">
          {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {progress || 'Uploading...'}</> : <><Upload className="mr-2 h-4 w-4" /> Upload {files.length > 0 ? `${files.length} file(s)` : 'Files'}</>}
        </Button>
      </div>
    </div>
  );
}