/**
 * Shared utilities for the Enterprise Property Listings Module.
 */

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price on request';
  if (price >= 1_000_000_000) return `₦${Math.round(price / 1_000_000_000)} Billion`;
  if (price >= 1_000_000) return `₦${Math.round(price / 1_000_000)} Million`;
  if (price >= 1_000) return `₦${Math.round(price / 1_000)}K`;
  return `₦${price.toLocaleString('en-NG')}`;
};

export const formatNumber = (n) => (n == null ? '—' : n.toLocaleString('en-NG'));

export const buildLocation = (p) =>
  [p.estate, p.district, p.city, p.state].filter(Boolean).join(', ');

export const buildShortLocation = (p) =>
  [p.city, p.state].filter(Boolean).join(', ');

export const getPrimaryImage = (p) =>
  p.featured_image_url || p.image_urls?.[0] || null;

export const getAllImages = (p) => {
  const imgs = [];
  if (p.featured_image_url) imgs.push(p.featured_image_url);
  if (p.image_urls) imgs.push(...p.image_urls);
  return [...new Set(imgs)];
};

export const AVAILABILITY_CONFIG = {
  available: { label: 'Available', className: 'bg-success text-white' },
  reserved: { label: 'Reserved', className: 'bg-warning text-white' },
  sold: { label: 'Sold', className: 'bg-destructive text-white' },
  leased: { label: 'Leased', className: 'bg-info text-white' },
  under_offer: { label: 'Under Offer', className: 'bg-warning text-white' },
  off_market: { label: 'Off Market', className: 'bg-muted text-muted-foreground' },
  withdrawn: { label: 'Withdrawn', className: 'bg-muted text-muted-foreground' },
};

export const PURPOSE_CONFIG = {
  sale: 'For Sale',
  rent: 'For Rent',
  lease: 'For Lease',
};

export const CLASSIFICATION_CONFIG = {
  ultra_luxury: 'Ultra Luxury',
  luxury: 'Luxury',
  premium: 'Premium',
  standard: 'Standard',
  budget: 'Budget',
};

export const CONDITION_CONFIG = {
  new: 'New',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  needs_renovation: 'Needs Renovation',
  under_construction: 'Under Construction',
};

export const FURNISHING_CONFIG = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-Furnished',
  unfurnished: 'Unfurnished',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured First' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_saved', label: 'Most Saved' },
];

export const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₦10M', min: 0, max: 10_000_000 },
  { label: '₦10M – ₦50M', min: 10_000_000, max: 50_000_000 },
  { label: '₦50M – ₦100M', min: 50_000_000, max: 100_000_000 },
  { label: '₦100M – ₦500M', min: 100_000_000, max: 500_000_000 },
  { label: '₦500M – ₦1B', min: 500_000_000, max: 1_000_000_000 },
  { label: '₦1B+', min: 1_000_000_000, max: Infinity },
];

export const COMMON_AMENITIES = [
  'Swimming Pool', 'Gym', 'Security', 'Power Supply', 'Borehole',
  'Air Conditioning', 'CCTV', 'Furnished', 'Serviced', 'Garden',
  'Parking', 'Balcony', 'Boys Quarters', 'Fenced', 'Road Access',
];

export const ACTIVE_STATUSES = ['published', 'active', 'approved', 'verified'];

export const PROPERTY_TYPE_ICONS = {
  house: 'Home',
  apartment: 'Building2',
  land: 'Map',
  commercial: 'Store',
  villa: 'Castle',
  duplex: 'Building',
  terrace: 'Building',
  office: 'Briefcase',
  warehouse: 'Warehouse',
  factory: 'Factory',
};