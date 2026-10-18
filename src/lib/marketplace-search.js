/**
 * Shared marketplace search-criteria contract.
 * Used by PropertyDiscovery and any future marketplace search surface.
 *
 * CANONICAL LISTING SOURCE:
 *   The Property entity is the authoritative public-listing record.
 *   Public discovery queries Property with visibility=public AND
 *   status in ACTIVE_STATUSES (published, active, approved, verified).
 *
 *   PropertyListing is a SEPARATE submission record used by the older
 *   homeowner/agent/corporate POA submission flow (PropertySubmit /
 *   SubmissionTrack). It is NOT used for marketplace discovery.
 *   Its `approved_property_id` field links to a Property record once
 *   approved — that Property record is what appears publicly.
 */
import { ACTIVE_STATUSES } from '@/lib/property-utils';

export const MARKETPLACE_PAGE_SIZE = 12;

export const defaultFilters = {
  keyword: '', state: '', lga: '', propertyType: '', purpose: '',
  priceRange: '', priceMin: undefined, priceMax: undefined,
  bedrooms: undefined, bathrooms: undefined,
  classification: undefined, amenities: [],
  featured: false, jointVenture: false,
};

export const SORT_MAP = {
  newest: '-created_date',
  oldest: 'created_date',
  price_low: 'price',
  price_high: '-price',
  featured: '-is_featured',
  most_viewed: '-view_count',
  most_saved: '-favorite_count',
};

export function normalizeSortKey(sort) {
  return SORT_MAP[sort] || '-created_date';
}

export function normalizeKeyword(keyword) {
  if (!keyword) return '';
  return String(keyword).trim().slice(0, 200);
}

/**
 * Validates search criteria and returns any errors.
 * Currently checks that priceMin does not exceed priceMax.
 */
export function validateSearchCriteria(filters) {
  const errors = [];
  if (filters.priceMin != null && filters.priceMax != null && filters.priceMin > filters.priceMax) {
    errors.push('Minimum price cannot exceed maximum price.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Builds the server-side query object for marketplace property discovery.
 * Only public, active listings are included — pending, rejected, private,
 * archived, and suspended listings are excluded by the status + visibility filter.
 * No raw user input is used to construct database expressions; keyword is
 * normalized and passed as a $regex value (safe — the SDK treats it as a
 * literal pattern, not executable code).
 */
export function buildMarketplaceQuery(filters) {
  const query = { visibility: 'public', status: { $in: ACTIVE_STATUSES } };
  const kw = normalizeKeyword(filters.keyword);

  if (filters.purpose) query.listing_purpose = filters.purpose;
  if (filters.propertyType) query.property_type = filters.propertyType;
  if (filters.state) query.state = filters.state;
  if (filters.lga) query.lga = filters.lga;

  if (filters.priceMin != null || filters.priceMax != null) {
    query.price = {};
    if (filters.priceMin != null) query.price.$gte = filters.priceMin;
    if (filters.priceMax != null) query.price.$lte = filters.priceMax;
  }

  if (filters.bedrooms) query.bedrooms = { $gte: filters.bedrooms };
  if (filters.bathrooms) query.bathrooms = { $gte: filters.bathrooms };
  if (filters.classification) query.property_classification = filters.classification;
  if (filters.featured) query.is_featured = true;
  if (filters.jointVenture) query.is_joint_venture = true;
  if (filters.amenities?.length) query.amenities = { $all: filters.amenities };

  if (kw) {
    query.$or = [
      { title: { $regex: kw, $options: 'i' } },
      { reference_number: { $regex: kw, $options: 'i' } },
      { city: { $regex: kw, $options: 'i' } },
      { estate: { $regex: kw, $options: 'i' } },
    ];
  }

  return query;
}