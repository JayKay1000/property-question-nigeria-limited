import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Loader2, Save, FileText, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link', 'blockquote'],
    ['clean'],
  ],
};

export default function ProjectDescriptionEditor({ project, onSaved }) {
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDescription(project?.description || '');
    setShortDescription(project?.short_description || '');
    setSeoTitle(project?.seo_title || '');
    setSaved(false);
  }, [project?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await base44.entities.Project.update(project.id, {
        description,
        short_description: shortDescription,
        seo_title: seoTitle,
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-flame-500" />
        <h3 className="font-heading text-lg font-bold text-brand-900">Project Description</h3>
        {saved && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Short Description
            <span className="ml-1 font-normal normal-case text-muted-foreground/70">— appears on cards & previews</span>
          </label>
          <Textarea
            value={shortDescription}
            onChange={(e) => { setShortDescription(e.target.value); setSaved(false); }}
            rows={2}
            maxLength={300}
            placeholder="A brief one-line summary of this project..."
            className="border-brand-200 bg-ice-50"
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">{shortDescription.length}/300</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            SEO Title <span className="ml-1 font-normal normal-case text-muted-foreground/70">— optional, for search engines</span>
          </label>
          <Input
            value={seoTitle}
            onChange={(e) => { setSeoTitle(e.target.value); setSaved(false); }}
            placeholder="SEO title for this project page..."
            className="border-brand-200 bg-ice-50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Detailed Description <span className="ml-1 font-normal normal-case text-muted-foreground/70">— full rich-text shown on the project page</span>
          </label>
          <div className="rounded-lg border border-brand-200 bg-white">
            <ReactQuill
              theme="snow"
              value={description}
              onChange={(v) => { setDescription(v); setSaved(false); }}
              modules={QUILL_MODULES}
              placeholder="Write a comprehensive description of this project — overview, location highlights, features, infrastructure, title documents, pricing, why invest, etc..."
              style={{ minHeight: '240px' }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Description'}
          </Button>
        </div>
      </div>
    </div>
  );
}