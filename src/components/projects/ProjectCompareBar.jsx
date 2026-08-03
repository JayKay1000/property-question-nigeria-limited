import { Link } from 'react-router-dom';
import { GitCompare, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { getProjectImage } from '@/lib/project-utils';

export default function ProjectCompareBar({ projects = [], onRemove, onClear }) {
  if (projects.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-200 bg-white/95 backdrop-blur-md shadow-premium-lg">
      <div className="container-wide section-pad py-3">
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <GitCompare className="h-5 w-5 text-flame-500" />
            <span className="font-heading text-sm font-bold text-brand-900">Compare ({projects.length}/4)</span>
          </div>
          <div className="flex flex-1 gap-2 overflow-x-auto">
            {projects.map((p) => (
              <div key={p.id} className="flex shrink-0 items-center gap-2 rounded-lg border border-brand-100 bg-ice-50 p-2">
                <div className="h-10 w-10 overflow-hidden rounded bg-brand-100">
                  {getProjectImage(p) ? (
                    <Image src={getProjectImage(p)} alt={p.name} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-300"><GitCompare className="h-4 w-4" /></div>
                  )}
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-brand-900">{p.name}</span>
                <button onClick={() => onRemove(p.id)} className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear} className="hidden sm:flex">Clear</Button>
            <Button asChild size="sm" className="bg-flame-500 hover:bg-flame-600" disabled={projects.length < 2}>
              <Link to={`/projects/compare?ids=${projects.map((p) => p.id).join(',')}`}>
                Compare Now <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}