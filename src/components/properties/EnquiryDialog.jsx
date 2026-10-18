import { X } from 'lucide-react';
import EnquiryForm from './EnquiryForm';

/**
 * Controlled dialog wrapper around the structured EnquiryForm.
 * The parent manages `open` and `onClose`. Used on property cards where
 * a full-page form isn't available.
 */
export default function EnquiryDialog({ property, open, onClose }) {
  if (!property || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-premium-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-brand-900">Contact Advertiser</h3>
            <p className="text-xs text-muted-foreground">Your enquiry goes directly to the listing agent.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <EnquiryForm property={property} onSuccess={() => {
          setTimeout(() => onClose(), 2500);
        }} />
      </div>
    </div>
  );
}