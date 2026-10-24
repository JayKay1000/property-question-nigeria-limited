import { Compass } from 'lucide-react';

/** Branded header for the GIS discovery page, with the live result counters. */
export default function GisMapHeader({ stats = [] }) {
  return (
    <div className="border-b border-brand-100 bg-brand-900">
      <div className="container-wide section-pad py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-white">
              <Compass className="h-6 w-6 text-flame-500" /> GIS Location Intelligence
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Explore properties on the map, see what is nearby, and plan a route before you travel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <stat.icon className="h-4 w-4 text-flame-400" />
                <span className="text-sm font-semibold text-white">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}