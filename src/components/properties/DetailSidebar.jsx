import { Phone, Mail, ShieldCheck, Share2, Printer, Heart, GitCompare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, PURPOSE_CONFIG } from '@/lib/property-utils';
import EnquiryForm from './EnquiryForm';

export default function DetailSidebar({ property, isSaved, isCompared, onSave, onCompare }) {
  const purpose = PURPOSE_CONFIG[property.listing_purpose] || 'For Sale';
  const agentName = property.listing_agent_name || 'Property Question Team';
  const whatsappLink = property.listing_agent_id
    ? `https://wa.me/?text=I'm interested in ${property.title} (${property.reference_number || ''})`
    : null;

  return (
    <div className="space-y-4">
      {/* Price card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-flame-50 px-3 py-1 text-xs font-semibold text-flame-700">{purpose}</span>
          {property.availability_status && (
            <span className="text-xs font-medium text-muted-foreground capitalize">{property.availability_status.replace('_', ' ')}</span>
          )}
        </div>
        <p className="mt-3 font-heading text-3xl font-bold text-brand-900">{formatPrice(property.price)}</p>
        {property.land_size_sqm && property.price && (
          <p className="mt-1 text-sm text-muted-foreground">
            ₦{Math.round(property.price / property.land_size_sqm).toLocaleString('en-NG')}/sqm
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={onSave} variant="outline" size="sm" className="flex-1 border-brand-200">
            <Heart className={`mr-1.5 h-4 w-4 ${isSaved ? 'fill-flame-500 text-flame-500' : ''}`} /> Save
          </Button>
          <Button onClick={onCompare} variant="outline" size="sm" className="flex-1 border-brand-200">
            <GitCompare className={`mr-1.5 h-4 w-4 ${isCompared ? 'text-flame-500' : ''}`} /> Compare
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => navigator.share?.({ title: property.title, url: window.location.href }).catch(() => {})}
            variant="outline" size="sm" className="flex-1 border-brand-200">
            <Share2 className="mr-1.5 h-4 w-4" /> Share
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="sm" className="flex-1 border-brand-200">
            <Printer className="mr-1.5 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Agent card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">Listed By</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-heading text-lg font-bold text-brand-700">
            {agentName.charAt(0)}
          </div>
          <div>
            <p className="flex items-center gap-1 font-heading font-semibold text-brand-900">
              {agentName}
              {property.verified && <ShieldCheck className="h-4 w-4 text-success" />}
            </p>
            <p className="text-xs text-muted-foreground">{property.verified ? 'Verified Agent' : 'Company Listing'}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm" className="border-brand-200">
            <a href={`tel:+2348000000000`}><Phone className="mr-1.5 h-4 w-4" /> Call</a>
          </Button>
          {whatsappLink && (
            <Button asChild variant="outline" size="sm" className="border-success/30 text-success hover:bg-success/5">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp</a>
            </Button>
          )}
        </div>
      </div>

      {/* Enquiry form */}
      <div className="rounded-2xl border border-border bg-ice-50 p-5 shadow-card">
        <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Contact Agent</h3>
        <EnquiryForm property={property} />
      </div>
    </div>
  );
}