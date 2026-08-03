import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, MapPin, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/lib/property-utils';

export default function SavedProperties({ savedProps, onRemove }) {
  const [removing, setRemoving] = useState(null);

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      await base44.entities.SavedProperty.delete(id);
      onRemove?.(id);
    } catch { /* silent */ }
    finally { setRemoving(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-brand-900">Saved Properties</h2>
        <Badge variant="secondary" className="bg-ice-100 text-brand-700">{savedProps.length} saved</Badge>
      </div>

      {savedProps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedProps.map((sp) => (
            <div key={sp.id} className="group overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition hover:shadow-card-hover">
              <Link to={`/properties/${sp.property_id}`}>
                <div className="relative aspect-video overflow-hidden bg-brand-100">
                  {sp.property_title && <div className="h-full w-full bg-gradient-to-br from-brand-700 to-brand-950" />}
                  <div className="absolute right-2 top-2">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-error backdrop-blur-sm">
                      <Heart className="h-3 w-3 fill-error" /> Saved
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-heading text-sm font-bold text-brand-900 group-hover:text-flame-600">{sp.property_title || 'Property'}</h3>
                  {sp.saved_date && <p className="mt-0.5 text-xs text-muted-foreground">Saved {new Date(sp.saved_date).toLocaleDateString('en-NG')}</p>}
                  {sp.notes && <p className="mt-1 truncate text-xs text-muted-foreground">{sp.notes}</p>}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-flame-600">View Property <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
              <div className="border-t border-border px-4 py-2">
                <button onClick={() => handleRemove(sp.id)} disabled={removing === sp.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-error">
                  {removing === sp.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <Heart className="h-12 w-12 text-brand-200" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Saved Properties</h3>
          <p className="mt-1 text-sm text-muted-foreground">Save properties by clicking the heart icon on any listing.</p>
          <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
            <Link to="/properties">Browse Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </div>
  );
}