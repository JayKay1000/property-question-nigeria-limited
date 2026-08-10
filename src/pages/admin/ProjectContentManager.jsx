import { useState, useEffect } from 'react';
import { Loader2, FolderOpen, Building2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from '@/components/ui/image';
import ProjectContentUpload from '@/components/admin/projects/ProjectContentUpload';
import ProjectContentList from '@/components/admin/projects/ProjectContentList';
import ProjectDescriptionEditor from '@/components/admin/projects/ProjectDescriptionEditor';

const QUICK_PROJECTS = ['Colony Enclave', 'Otunba Heritage Gardens', 'Hillcrest Oaks Gardens'];

export default function ProjectContentManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    base44.entities.Project.filter({ visibility: 'public' }, 'name', 200)
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = projects.find((p) => p.id === selectedId);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-24 lg:pt-28">
      <section className="relative overflow-hidden bg-brand-900 pb-10 pt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div className="container-wide section-pad relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500/20 px-3 py-1 text-xs font-semibold text-flame-300">
            <FolderOpen className="h-3 w-3" /> Project Content Manager
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Upload Per-Project Content</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Manually upload brochures, survey plans, images, videos and drone videos for each estate project. Uploaded content goes live immediately on the public project page.
          </p>
        </div>
      </section>

      <section className="container-wide section-pad mt-8">
        {/* Project selector */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Project</label>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-flame-500" /> Loading projects...</div>
          ) : (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-11 border-brand-200 bg-ice-50"><SelectValue placeholder="Choose a project to manage its content" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {/* Quick select */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROJECTS.map((name) => {
                const match = projects.find((p) => p.name?.toLowerCase() === name.toLowerCase());
                const active = selected?.name?.toLowerCase() === name.toLowerCase();
                return (
                  <button key={name} disabled={!match} onClick={() => match && setSelectedId(match.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active ? 'border-flame-500 bg-flame-500 text-white' : match ? 'border-brand-200 bg-white text-brand-700 hover:border-flame-300 hover:bg-flame-50' : 'border-border bg-muted text-muted-foreground opacity-50'
                    }`}>
                    {match && <ChevronRight className="h-3 w-3" />} {name}
                  </button>
                );
              })}
            </div>
            {QUICK_PROJECTS.some((n) => !projects.find((p) => p.name?.toLowerCase() === n.toLowerCase())) && (
              <p className="mt-2 text-xs text-muted-foreground">Tip: ensure each estate exists as a Project record with a matching name to enable quick select.</p>
            )}
          </div>
        </div>

        {selected ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Project summary */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                  {selected.featured_image_url ? (
                    <Image src={selected.featured_image_url} alt={selected.name} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><Building2 className="h-6 w-6 text-brand-300" /></div>
                  )}
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-brand-900">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">{selected.location_city ? `${selected.location_city}, ` : ''}{selected.location_state || 'Nigeria'}</p>
                  {selected.short_description && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{selected.short_description}</p>}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <ProjectDescriptionEditor project={selected} onSaved={refresh} />
            </div>
            <div className="lg:col-span-1">
              <ProjectContentUpload projectId={selected.id} projectName={selected.name} onUploaded={refresh} />
            </div>
            <div className="lg:col-span-2">
              <ProjectContentList projectId={selected.id} refreshKey={refreshKey} onDeleted={refresh} />
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
            <FolderOpen className="h-12 w-12 text-brand-200" />
            <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">Select a project to begin</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Choose a project above to upload and manage its brochures, survey plans, images, videos and drone videos.</p>
          </div>
        )}
      </section>
    </div>
  );
}