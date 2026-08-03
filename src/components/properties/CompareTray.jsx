import { Link } from 'react-router-dom';
import { GitCompare, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { getPrimaryImage, formatPrice } from '@/lib/property-utils';

export default function CompareTray({ properties, onRemove, onClear }) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl shadow-premium-lg">
      <div className="container-wide section-pad py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-flame-500" />
            <span className="font-heading text-sm font-bold text-brand-900">
              Compare ({properties.length}/4)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              {properties.map((p) => (
                <div key={p.id} className="relative">
                  <div className="h-12 w-16 overflow-hidden rounded-lg border border-border">
                    {getPrimaryImage(p) ? (
                      <Image src={getPrimaryImage(p)} alt={p.title} fittingType="fill" className="h-full w-full" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-200 text-xs">
                        {p.title?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button onClick={() => onRemove(p.id)} aria-label="Remove"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-md">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <Link to={`/properties/compare?ids=${properties.map((p) => p.id).join(',')}`}>
              <Button size="sm" className="bg-flame-500 hover:bg-flame-600">
                Compare Now <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}