import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Star, CheckCircle2, Building2, Users, Home, TrendingUp } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/property-utils';

export default function ResultCard({ result, type, onTrack }) {
  if (type === 'properties') return <PropertyResultCard property={result} onTrack={onTrack} />;
  if (type === 'projects') return <ProjectResultCard project={result} onTrack={onTrack} />;
  if (type === 'agents') return <AgentResultCard agent={result} onTrack={onTrack} />;
  return null;
}

function PropertyResultCard({ property, onTrack }) {
  const link = `/properties/${property.id}`;
  return (
    <Link to={link} onClick={() => onTrack?.(property.id, 'properties')} className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition hover:shadow-card-hover">
      <div className="relative aspect-video overflow-hidden bg-brand-100">
        {property.featured_image_url ? (
          <Image src={property.featured_image_url} fittingType="fill" className="h-full w-full" alt={property.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950">
            <Home className="h-10 w-10 text-white/20" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          {property.is_featured && <Badge className="bg-flame-500 text-white border-0">Featured</Badge>}
          {property.verified && <Badge className="bg-success text-white border-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>}
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-white/90 text-brand-900 border-0">{property.availability_status || 'Available'}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate font-heading text-sm font-bold text-brand-900 group-hover:text-flame-600">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {[property.city, property.state].filter(Boolean).join(', ') || 'Location TBD'}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms}</span>}
          {property.land_size_sqm != null && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {property.land_size_sqm}m²</span>}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <span className="font-heading text-lg font-bold text-flame-600">{property.price ? formatPrice(property.price) : 'Price on request'}</span>
          <span className="text-xs font-medium text-brand-700 group-hover:text-flame-600">View →</span>
        </div>
      </div>
    </Link>
  );
}

function ProjectResultCard({ project, onTrack }) {
  const link = `/projects/${project.id}`;
  return (
    <Link to={link} onClick={() => onTrack?.(project.id, 'projects')} className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition hover:shadow-card-hover">
      <div className="relative aspect-video overflow-hidden bg-brand-100">
        {project.featured_image_url ? (
          <Image src={project.featured_image_url} fittingType="fill" className="h-full w-full" alt={project.name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950">
            <Building2 className="h-10 w-10 text-white/20" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          {project.is_featured && <Badge className="bg-flame-500 text-white border-0">Featured</Badge>}
        </div>
        {project.progress_percentage != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-white">
              <span>Progress</span>
              <span className="font-semibold">{project.progress_percentage}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-flame-500" style={{ width: `${project.progress_percentage || 0}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate font-heading text-sm font-bold text-brand-900 group-hover:text-flame-600">{project.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {[project.location_city, project.location_state].filter(Boolean).join(', ') || 'Location TBD'}</p>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{project.short_description}</p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-brand-700"><Users className="h-3.5 w-3.5" /> {project.units_available || 0} available</span>
          <span className="font-medium text-flame-600 capitalize">{project.status?.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </Link>
  );
}

function AgentResultCard({ agent, onTrack }) {
  const link = `/agents/${agent.id}`;
  return (
    <Link to={link} onClick={() => onTrack?.(agent.id, 'agents')} className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-card transition hover:shadow-card-hover">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-100">
        {agent.photo_url ? <img src={agent.photo_url} alt={agent.full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Users className="h-7 w-7 text-brand-300" /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-heading text-sm font-bold text-brand-900 group-hover:text-flame-600">{agent.full_name}</h3>
          {agent.verification_status === 'verified' && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
        </div>
        <p className="text-xs text-muted-foreground">{agent.specialization || 'Real Estate Agent'}</p>
        {agent.service_areas?.length > 0 && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {agent.service_areas.join(', ')}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs">
          {agent.total_listings > 0 && <span className="flex items-center gap-1 text-brand-700"><Home className="h-3 w-3" /> {agent.total_listings} listings</span>}
          {agent.rating > 0 && <span className="flex items-center gap-1 text-flame-600"><Star className="h-3 w-3 fill-flame-500" /> {agent.rating.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  );
}