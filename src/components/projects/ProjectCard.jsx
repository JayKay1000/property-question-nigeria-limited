import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, Share2, Eye, TrendingUp, Maximize, Grid3x3, CheckCircle2, Download } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice, formatNumber, buildShortLocation, getProjectImage, PROJECT_STATUS_CONFIG } from '@/lib/project-utils';

export default function ProjectCard({ project, onSave, isSaved, onCompare, isCompared }) {
  const status = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.draft;
  const completion = project.progress_percentage || 0;
  const available = project.units_available || 0;
  const sold = project.units_sold || 0;
  const total = project.total_units || (available + sold) || 0;

  const handleSave = (e) => { e.preventDefault(); e.stopPropagation(); onSave?.(project); };
  const handleCompare = (e) => { e.preventDefault(); e.stopPropagation(); onCompare?.(project); };
  const handleBrochure = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleShare = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (navigator.share) navigator.share({ title: project.name, url: window.location.origin + '/projects/' + project.id });
  };

  return (
    <Link to={`/projects/${project.id}`} className="group block overflow-hidden rounded-2xl border border-brand-100 bg-ice-50 shadow-card transition-all hover:shadow-card-hover hover:border-flame-200">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        {getProjectImage(project) ? (
          <Image src={getProjectImage(project)} alt={project.name} fittingType="fill"
            className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950">
            <Grid3x3 className="h-12 w-12 text-brand-400" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
          {project.is_featured && (
            <span className="flex items-center gap-1 rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white">
              <Star className="h-3 w-3 fill-white" /> Featured
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button onClick={handleSave} aria-label="Save"
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${isSaved ? 'bg-flame-500 text-white' : 'bg-white/80 text-brand-700 hover:bg-white'}`}>
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
          <button onClick={handleShare} aria-label="Share"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brand-700 backdrop-blur-md transition hover:bg-white">
            <Share2 className="h-4 w-4" />
          </button>
          {project.brochure_url && (
            <a href={project.brochure_url} target="_blank" rel="noopener noreferrer" download
              onClick={handleBrochure} aria-label="Download brochure"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-flame-500 text-white backdrop-blur-md transition hover:bg-flame-600">
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
        {completion > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-950/90 to-transparent p-3">
            <div className="flex items-center gap-2 text-xs text-white">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-semibold">{completion}% Complete</span>
              <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-flame-500" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-base font-bold leading-tight text-brand-900 group-hover:text-flame-600 line-clamp-1">
          {project.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{buildShortLocation(project) || 'Nigeria'}</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white p-2">
            <p className="text-lg font-bold text-brand-900">{formatNumber(total)}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Plots</p>
          </div>
          <div className="rounded-lg bg-success/10 p-2">
            <p className="text-lg font-bold text-success">{formatNumber(available)}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Available</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-2">
            <p className="text-lg font-bold text-destructive">{formatNumber(sold)}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sold</p>
          </div>
        </div>

        {project.total_land_area_sqm != null && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Maximize className="h-3.5 w-3.5" />
            <span>{formatNumber(project.total_land_area_sqm)} sqm estate area</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            {project.budget_ngn != null ? (
              <>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Starting from</p>
                <p className="font-heading text-lg font-bold text-flame-600">{formatPrice(project.budget_ngn)}</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground">Price on request</p>
            )}
          </div>
          <button onClick={handleCompare} aria-label="Compare"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${isCompared ? 'bg-flame-500 text-white' : 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50'}`}>
            <CheckCircle2 className="h-3.5 w-3.5" /> {isCompared ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
    </Link>
  );
}