import { useState } from 'react';
import { Grid3x3, ZoomIn, ZoomOut, Download, Compass } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function FloorPlanViewer({ floorPlans = [] }) {
  const [activePlan, setActivePlan] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (floorPlans.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-ice-50 text-center">
        <Grid3x3 className="h-8 w-8 text-brand-200" />
        <p className="mt-2 text-sm text-muted-foreground">No floor plans available yet</p>
      </div>
    );
  }

  const plan = floorPlans[activePlan];

  return (
    <div>
      {/* Plan type tabs */}
      {floorPlans.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {floorPlans.map((fp, i) => (
            <button key={fp.id || i} onClick={() => { setActivePlan(i); setZoom(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${i === activePlan ? 'bg-flame-500 text-white' : 'bg-ice-100 text-brand-700 hover:bg-ice-200'}`}>
              {fp.title || fp.plan_type?.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Floor plan display */}
      <div className="relative overflow-hidden rounded-xl border border-brand-100 bg-ice-50">
        <div className="aspect-[4/3] w-full overflow-hidden" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
          <Image src={plan.file_url} alt={plan.title || 'Floor plan'} fittingType="fit" className="h-full w-full" />
        </div>

        {/* Controls */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brand-700 shadow hover:bg-white" aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brand-700 shadow hover:bg-white" aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom(1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brand-700 shadow hover:bg-white" aria-label="Reset">
            <Compass className="h-4 w-4" />
          </button>
        </div>

        {/* Download */}
        <a href={plan.file_url} download target="_blank" rel="noopener noreferrer"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-brand-700 shadow hover:bg-white">
          <Download className="h-3.5 w-3.5" /> Download
        </a>

        {/* Plan info */}
        {plan.description && (
          <div className="absolute bottom-3 left-3 max-w-[60%] rounded-lg bg-white/80 p-2 text-xs text-brand-700 backdrop-blur-sm">
            {plan.description}
          </div>
        )}
      </div>

      {/* Plan metadata */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span><strong className="text-brand-700">Type:</strong> {plan.plan_type?.replace(/_/g, ' ')}</span>
        {plan.version && <span><strong className="text-brand-700">Version:</strong> {plan.version}</span>}
        {plan.approval_status && <span><strong className="text-brand-700">Status:</strong> {plan.approval_status}</span>}
      </div>
    </div>
  );
}