import { Phone, Mail, ShieldCheck, MessageCircle, BadgeCheck, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { formatPrice, PURPOSE_CONFIG } from '@/lib/property-utils';
import { normalizePhone } from '@/lib/marketplace-utils';
import EnquiryForm from './EnquiryForm';
import PropertyShare from './PropertyShare';

export default function DetailSidebar({ property, agent, isSaved, onSave, saving }) {
  const purpose = PURPOSE_CONFIG[property.listing_purpose] || 'For Sale';
  const agentName = agent?.full_name || property.listing_agent_name || 'Property Question Team';
  const agentPhone = agent?.phone ? normalizePhone(agent.phone) : null;
  const agentEmail = agent?.email || null;

  const propertyUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappMsg = `Hello, I am interested in your property listing: ${property.title}. Please share more details.${propertyUrl ? ' ' + propertyUrl : ''}`;
  const whatsappUrl = agentPhone
    ? `https://wa.me/${agentPhone.replace(/\+/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
    : null;

  const identityVerified = agent?.identity_verified;
  const addressVerified = agent?.address_verified;

  return (
    <div className="space-y-4">
      {/* Price card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-flame-50 px-3 py-1 text-xs font-semibold text-flame-700">{purpose}</span>
          {property.pricing_frequency && (property.listing_purpose === 'rent' || property.listing_purpose === 'lease') && (
            <span className="text-xs font-medium text-muted-foreground capitalize">{property.pricing_frequency}</span>
          )}
        </div>
        <p className="mt-3 font-heading text-3xl font-bold text-brand-900">{formatPrice(property.price)}</p>
        {property.land_size_sqm && property.price && (
          <p className="mt-1 text-sm text-muted-foreground">
            ₦{Math.round(property.price / property.land_size_sqm).toLocaleString('en-NG')}/sqm
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={onSave} disabled={saving} variant="outline" size="sm" className="flex-1 border-brand-200">
            {saving ? '...' : <><span className={`mr-1.5 ${isSaved ? 'text-flame-500' : ''}`}>♥</span> {isSaved ? 'Saved' : 'Save'}</>}
          </Button>
        </div>
        <div className="mt-3">
          <PropertyShare property={property} />
        </div>
      </div>

      {/* Agent / advertiser card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">Listed By</h3>
        <div className="flex items-center gap-3">
          {agent?.photo_url ? (
            <Image src={agent.photo_url} alt={agentName} fittingType="fit" className="h-14 w-14 rounded-full" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-heading text-lg font-bold text-brand-700">
              {agentName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-heading font-semibold text-brand-900">{agentName}</p>
            {agent?.specialization && <p className="truncate text-xs text-muted-foreground">{agent.specialization}</p>}
            {agent?.agent_code && <p className="text-xs text-muted-foreground/70">{agent.agent_code}</p>}
          </div>
        </div>

        {/* Verification badges — only from authoritative approved records */}
        {(identityVerified || addressVerified) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {identityVerified && (
              <span className="flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-1 text-xs font-medium text-info">
                <BadgeCheck className="h-3.5 w-3.5" /> Identity Verified
              </span>
            )}
            {addressVerified && (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <ShieldCheck className="h-3.5 w-3.5" /> Address Verified
              </span>
            )}
          </div>
        )}
        {!identityVerified && !addressVerified && agent && (
          <p className="mt-2 text-xs text-muted-foreground">Agent identity not yet verified.</p>
        )}

        {/* Agent profile details */}
        {agent && (agent.years_experience || agent.service_areas?.length || agent.languages?.length) && (
          <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {agent.years_experience != null && <p>{agent.years_experience} years experience</p>}
            {agent.service_areas?.length > 0 && (
              <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {agent.service_areas.join(', ')}</p>
            )}
            {agent.languages?.length > 0 && (
              <p className="flex items-center gap-1"><Globe className="h-3 w-3" /> {agent.languages.join(', ')}</p>
            )}
          </div>
        )}

        {/* Contact actions — only render if a real number/email exists */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {agentPhone && (
            <Button asChild variant="outline" size="sm" className="border-brand-200">
              <a href={`tel:${agentPhone}`}><Phone className="mr-1.5 h-4 w-4" /> Call</a>
            </Button>
          )}
          {whatsappUrl && (
            <Button asChild variant="outline" size="sm" className="border-success/30 text-success hover:bg-success/5">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp</a>
            </Button>
          )}
          {agentEmail && (
            <Button asChild variant="outline" size="sm" className="border-brand-200">
              <a href={`mailto:${agentEmail}`}><Mail className="mr-1.5 h-4 w-4" /> Email</a>
            </Button>
          )}
          {!agentPhone && !agentEmail && (
            <p className="col-span-2 text-xs text-muted-foreground">No direct contact available. Use the enquiry form below.</p>
          )}
        </div>
        {agent?.bio && <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">{agent.bio}</p>}
      </div>

      {/* Enquiry form */}
      <div className="rounded-2xl border border-border bg-ice-50 p-5 shadow-card">
        <h3 className="mb-1 font-heading text-base font-bold text-brand-900">Contact Advertiser</h3>
        <p className="mb-3 text-xs text-muted-foreground">No account needed. Your enquiry goes directly to the listing agent.</p>
        <EnquiryForm property={property} />
      </div>
    </div>
  );
}