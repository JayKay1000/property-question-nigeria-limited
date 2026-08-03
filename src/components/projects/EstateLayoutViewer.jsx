import { useState, useMemo } from 'react';
import { Grid3x3, X, MapPin, Maximize, Compass, CheckCircle2, Navigation } from 'lucide-react';
import { PLOT_STATUS_CONFIG, formatPrice, formatPlotSize } from '@/lib/project-utils';

export default function EstateLayoutViewer({ plots = [], blocks = [] }) {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [filterBlock, setFilterBlock] = useState('__all__');
  const [filterStatus, setFilterStatus] = useState('__all__');

  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      if (filterBlock !== '__all__' && p.block_name !== filterBlock) return false;
      if (filterStatus !== '__all__' && p.status !== filterStatus) return false;
      return true;
    });
  }, [plots, filterBlock, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = {};
    plots.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [plots]);

  const uniqueBlocks = [...new Set(plots.map((p) => p.block_name).filter(Boolean))];

  const statusColors = {
    available: '#22c55e', reserved: '#FF7A00', sold: '#ef4444',
    allocated: '#3b82f6', not_available: '#cbd5e1',
    pending_payment: '#94a3b8', under_documentation: '#94a3b8',
    under_construction: '#94a3b8', completed: '#001A3D',
  };

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(PLOT_STATUS_CONFIG).filter(([k]) => statusCounts[k]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: statusColors[key] }} />
            <span className="font-medium text-brand-700">{cfg.label}</span>
            <span className="text-muted-foreground">({statusCounts[key]})</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}
          className="h-9 rounded-lg border border-brand-200 bg-white px-3 text-sm">
          <option value="__all__">All Blocks</option>
          {uniqueBlocks.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-brand-200 bg-white px-3 text-sm">
          <option value="__all__">All Statuses</option>
          {Object.entries(PLOT_STATUS_CONFIG).filter(([k]) => statusCounts[k]).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <span className="flex items-center text-sm text-muted-foreground">
          <Grid3x3 className="mr-1.5 h-4 w-4" /> Showing {filteredPlots.length} plots
        </span>
      </div>

      {/* Plot grid */}
      {filteredPlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {filteredPlots.map((plot) => {
            const cfg = PLOT_STATUS_CONFIG[plot.status] || PLOT_STATUS_CONFIG.available;
            return (
              <button key={plot.id} onClick={() => setSelectedPlot(plot)}
                className={`group relative aspect-square rounded-lg border-2 p-1.5 text-center transition hover:scale-105 hover:shadow-md ${selectedPlot?.id === plot.id ? 'ring-2 ring-flame-500 ring-offset-1' : ''}`}
                style={{ backgroundColor: statusColors[plot.status] + '20', borderColor: statusColors[plot.status] }}
                title={`${plot.plot_number} — ${cfg.label}`}>
                <span className="block text-xs font-bold text-brand-900">{plot.plot_number}</span>
                {plot.corner_piece && <span className="absolute right-0.5 top-0.5 text-[8px] text-flame-600">★</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-ice-50 text-center">
          <Grid3x3 className="h-10 w-10 text-brand-200" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No plot inventory available yet</p>
          <p className="text-xs text-muted-foreground">Plots will appear here once the estate layout is published</p>
        </div>
      )}

      {/* Plot detail panel */}
      {selectedPlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4" onClick={() => setSelectedPlot(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-premium-lg sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-brand-900">Plot {selectedPlot.plot_number}</h3>
                <p className="text-sm text-muted-foreground">{selectedPlot.block_name ? `Block ${selectedPlot.block_name}` : ''} {selectedPlot.phase_name ? `· ${selectedPlot.phase_name}` : ''}</p>
              </div>
              <button onClick={() => setSelectedPlot(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-ice-50 p-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${(PLOT_STATUS_CONFIG[selectedPlot.status] || PLOT_STATUS_CONFIG.available).bg} ${(PLOT_STATUS_CONFIG[selectedPlot.status] || PLOT_STATUS_CONFIG.available).text}`}>
                  {(PLOT_STATUS_CONFIG[selectedPlot.status] || PLOT_STATUS_CONFIG.available).label}
                </span>
              </div>
              <InfoRow icon={Maximize} label="Size" value={formatPlotSize(selectedPlot.plot_size, selectedPlot.measurement_unit)} />
              <InfoRow icon={Compass} label="Facing" value={selectedPlot.facing_direction?.replace('_', ' ') || '—'} />
              <InfoRow icon={MapPin} label="Corner Plot" value={selectedPlot.corner_piece ? 'Yes' : 'No'} />
              <InfoRow icon={Navigation} label="Road Access" value={selectedPlot.road_access !== false ? 'Yes' : 'No'} />
              {selectedPlot.price_ngn != null && (
                <div className="flex items-center justify-between rounded-lg bg-flame-50 p-3">
                  <span className="text-sm font-semibold text-brand-900">Price</span>
                  <span className="font-heading text-lg font-bold text-flame-600">{formatPrice(selectedPlot.price_ngn)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-semibold capitalize text-brand-900">{value}</span>
    </div>
  );
}