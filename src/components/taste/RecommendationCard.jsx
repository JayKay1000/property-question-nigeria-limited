import { Link } from 'react-router-dom';
import { Heart, X, Search, MapPin, Building2, CircleDollarSign, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { formatPrice, buildShortLocation, PURPOSE_CONFIG } from '@/lib/property-utils';

/**
 * A single recommendation card with explanation reasons and feedback controls.
 * The "Featured" badge is purely visual — it does not affect ranking.
 */
export default function RecommendationCard({ recommendation, onFeedback, onShowSimilar, isAuthenticated }) {
  const { property, score, reasons, missingInfo } = recommendation;
  const image = property.featured_image_url || property.image_urls?.[0] || null;

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
      <Link to={`/properties/${property.id}`} className="block relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <Image src={image} fittingType="fill" className="w-full h-full" alt={property.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {property.is_featured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-flame-500 px-2 py-0.5 text-xs font-medium text-white">
            <Star className="h-3 w-3" /> Featured
          </span>
        )}
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
          <Sparkles className="h-3 w-3 text-flame-400" /> {score}% match
        </span>
      </Link>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(property.price)}
            </span>
            {property.listing_purpose && PURPOSE_CONFIG[property.listing_purpose] && (
              <Badge variant="outline" className="text-xs">
                {PURPOSE_CONFIG[property.listing_purpose]}
              </Badge>
            )}
          </div>
          <Link to={`/properties/${property.id}`}>
            <h3 className="mt-1 font-medium text-foreground line-clamp-1 hover:text-primary">
              {property.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {buildShortLocation(property) || 'Location not specified'}
          </p>
        </div>

        {/* Explanation */}
        {reasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Why we recommend this</p>
            <ul className="space-y-0.5">
              {reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {missingInfo.length > 0 && (
          <p className="text-xs text-muted-foreground italic">
            {missingInfo.join(' · ')}
          </p>
        )}

        {/* Feedback controls */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => onFeedback?.('save_for_later', property)}
          >
            <Heart className="h-3.5 w-3.5" /> Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => onFeedback?.('not_interested', property)}
          >
            <X className="h-3.5 w-3.5" /> Not interested
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onShowSimilar?.(property)}
          >
            <Search className="h-3.5 w-3.5" /> Similar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onFeedback?.('prefer_location', property, { location_value: property.city || property.state })}
          >
            <MapPin className="h-3.5 w-3.5" /> Prefer area
          </Button>
          {property.property_type && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onFeedback?.('prefer_type', property, { property_type_value: property.property_type })}
            >
              <Building2 className="h-3.5 w-3.5" /> Prefer type
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onFeedback?.('too_expensive', property)}
          >
            <CircleDollarSign className="h-3.5 w-3.5" /> Too expensive
          </Button>
        </div>
      </div>
    </div>
  );
}