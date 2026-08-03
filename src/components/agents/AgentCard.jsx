import { Link } from 'react-router-dom';
import { MapPin, Star, Building2, TrendingUp, Phone } from 'lucide-react';
import { Image } from '@/components/ui/image';
import AgentBadge from '@/components/agents/AgentBadge';
import { formatRating, AGENT_STATUS_CONFIG } from '@/lib/agent-utils';

export default function AgentCard({ agent }) {
  const photo = agent.photo_url;
  const status = AGENT_STATUS_CONFIG[agent.status] || AGENT_STATUS_CONFIG.pending;

  return (
    <Link to={`/agents/${agent.id}`}
      className="group block overflow-hidden rounded-2xl border border-brand-100 bg-ice-50 shadow-card transition-all hover:shadow-card-hover hover:border-flame-200">
      <div className="flex flex-col">
        {/* Photo */}
        <div className="relative aspect-square overflow-hidden bg-brand-100">
          {photo ? (
            <Image src={photo} alt={agent.full_name} fittingType="fill" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950">
              <span className="font-heading text-3xl font-bold text-white/30">{agent.full_name?.charAt(0) || 'A'}</span>
            </div>
          )}
          <div className="absolute left-2 top-2">
            {agent.verification_status === 'verified' || agent.status === 'verified' || agent.status === 'active' ? (
              <AgentBadge agent={agent} size="xs" />
            ) : (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.badge}`}>{status.label}</span>
            )}
          </div>
          {agent.rating > 0 && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-brand-900 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-flame-500 text-flame-500" /> {formatRating(agent.rating)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4">
          <h3 className="font-heading text-base font-bold leading-tight text-brand-900 group-hover:text-flame-600 line-clamp-1">{agent.full_name}</h3>
          {agent.specialization && <p className="mt-0.5 text-xs font-medium text-flame-600 capitalize">{agent.specialization}</p>}
          {agent.service_areas?.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> <span className="line-clamp-1">{agent.service_areas.slice(0, 2).join(', ')}</span>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div className="text-center">
              <p className="font-heading text-lg font-bold text-brand-900">{agent.total_listings || 0}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Listings</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold text-brand-900">{agent.total_sales || 0}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sales</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}