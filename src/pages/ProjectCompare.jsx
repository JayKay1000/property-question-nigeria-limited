import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, GitCompare, X, Grid3x3, MapPin, Maximize, TrendingUp, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { formatPrice, formatNumber, buildShortLocation, getProjectImage, PROJECT_STATUS_CONFIG, PROJECT_CATEGORY_LABELS } from '@/lib/project-utils';
import { Image } from '@/components/ui/image';

export default function ProjectCompare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => base44.entities.Project.get(id).catch(() => null)))
      .then((results) => setProjects(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const removeProject = (id) => {
    const remaining = ids.filter((pid) => pid !== id);
    window.location.href = remaining.length === 0 ? '/projects' : `/projects/compare?ids=${remaining.join(',')}`;
  };

  const compareRows = [
    { label: 'Location', getValue: (p) => buildShortLocation(p) || '—' },
    { label: 'Status', getValue: (p) => PROJECT_STATUS_CONFIG[p.status]?.label || '—' },
    { label: 'Category', getValue: (p) => PROJECT_CATEGORY_LABELS[p.project_category] || p.project_type || '—' },
    { label: 'Starting Price', getValue: (p) => p.budget_ngn ? formatPrice(p.budget_ngn) : '—', highlight: true },
    { label: 'Total Plots', getValue: (p) => formatNumber(p.total_units) },
    { label: 'Available Plots', getValue: (p) => formatNumber(p.units_available) },
    { label: 'Sold Plots', getValue: (p) => formatNumber(p.units_sold) },
    { label: 'Estate Area', getValue: (p) => p.total_land_area_sqm ? `${formatNumber(p.total_land_area_sqm)} sqm` : '—' },
    { label: 'Completion', getValue: (p) => `${p.progress_percentage || 0}%` },
    { label: 'Developer', getValue: (p) => p.developer_name || '—' },
    { label: 'Launch Date', getValue: (p) => p.launch_date ? new Date(p.launch_date).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—' },
    { label: 'Est. Completion', getValue: (p) => p.estimated_completion_date ? new Date(p.estimated_completion_date).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—' },
    { label: 'Reference', getValue: (p) => p.reference_number || '—' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ice-50 pt-24">
        <GitCompare className="h-16 w-16 text-brand-200" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">No Projects to Compare</h1>
        <p className="mt-2 text-sm text-muted-foreground">Select projects from the listings page to compare them side by side.</p>
        <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
          <Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Browse Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50 pb-16 pt-20">
      <div className="container-wide section-pad">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-brand-900 sm:text-3xl">
              <GitCompare className="h-6 w-6 text-flame-500" /> Compare Projects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Side-by-side comparison of {projects.length} estate developments</p>
          </div>
          <Button asChild variant="outline" className="border-brand-200">
            <Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="w-40 p-4 text-left text-sm font-semibold text-muted-foreground">Project</th>
                {projects.map((p) => (
                  <th key={p.id} className="p-4 text-left align-top">
                    <div className="relative">
                      <button onClick={() => removeProject(p.id)} aria-label="Remove"
                        className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <Link to={`/projects/${p.id}`} className="block">
                        <div className="mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-brand-50">
                          {getProjectImage(p) ? (
                            <Image src={getProjectImage(p)} alt={p.name} fittingType="fill" className="h-full w-full" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-brand-200"><Building2 className="h-8 w-8" /></div>
                          )}
                        </div>
                        <h3 className="line-clamp-2 font-heading text-sm font-bold text-brand-900 hover:text-flame-600">{p.name}</h3>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className={row.highlight ? 'bg-flame-50/50' : i % 2 === 0 ? 'bg-ice-50/50' : ''}>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">{row.label}</td>
                  {projects.map((p) => (
                    <td key={p.id} className={`p-4 text-sm ${row.highlight ? 'font-heading text-lg font-bold text-flame-600' : 'text-brand-900'}`}>
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Highlights row */}
              <tr className="bg-ice-50/50">
                <td className="p-4 text-sm font-semibold text-muted-foreground">Highlights</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.highlights || []).slice(0, 4).map((h, i) => (
                        <span key={i} className="rounded-full bg-ice-100 px-2 py-0.5 text-xs text-brand-700">{h}</span>
                      ))}
                      {!p.highlights?.length && <span className="text-sm text-muted-foreground">—</span>}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4"></td>
                {projects.map((p) => (
                  <td key={p.id} className="p-4">
                    <Button asChild size="sm" className="w-full bg-flame-500 hover:bg-flame-600">
                      <Link to={`/projects/${p.id}`}>View Details</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}