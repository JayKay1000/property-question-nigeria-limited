/**
 * Shared utilities for the Enterprise Projects Module.
 */

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price on request';
  if (price >= 1_000_000_000) return `₦${(price / 1_000_000_000).toFixed(2)}B`;
  if (price >= 1_000_000) return `₦${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `₦${(price / 1_000).toFixed(0)}K`;
  return `₦${price.toLocaleString('en-NG')}`;
};

export const formatNumber = (n) => (n == null ? '—' : n.toLocaleString('en-NG'));

export const buildProjectLocation = (p) =>
  [p.location_city, p.location_lga, p.location_state].filter(Boolean).join(', ');

export const buildShortLocation = (p) =>
  [p.location_city || p.location_lga, p.location_state].filter(Boolean).join(', ');

export const getProjectImage = (p) =>
  p.featured_image_url || p.gallery_urls?.[0] || null;

export const getProjectGallery = (p) => {
  const imgs = [];
  if (p.featured_image_url) imgs.push(p.featured_image_url);
  if (p.gallery_urls) imgs.push(...p.gallery_urls);
  return [...new Set(imgs)];
};

export const PROJECT_STATUS_CONFIG = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  planning: { label: 'Planning', className: 'bg-info text-white' },
  survey_completed: { label: 'Survey Completed', className: 'bg-info text-white' },
  approval_pending: { label: 'Approval Pending', className: 'bg-warning text-white' },
  infrastructure_development: { label: 'Infrastructure Development', className: 'bg-warning text-white' },
  construction: { label: 'Under Construction', className: 'bg-flame-500 text-white' },
  selling: { label: 'Active Sales', className: 'bg-success text-white' },
  allocation: { label: 'Allocation in Progress', className: 'bg-success text-white' },
  handover: { label: 'Near Completion', className: 'bg-success text-white' },
  completed: { label: 'Completed', className: 'bg-brand-700 text-white' },
  suspended: { label: 'Suspended', className: 'bg-destructive text-white' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive text-white' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
};

export const PLOT_STATUS_CONFIG = {
  available: { label: 'Available', bg: 'bg-success', text: 'text-white', hex: '#22c55e' },
  reserved: { label: 'Reserved', bg: 'bg-flame-500', text: 'text-white', hex: '#FF7A00' },
  sold: { label: 'Sold', bg: 'bg-destructive', text: 'text-white', hex: '#ef4444' },
  allocated: { label: 'Allocated', bg: 'bg-info', text: 'text-white', hex: '#3b82f6' },
  pending_payment: { label: 'Pending Payment', bg: 'bg-slate-400', text: 'text-white', hex: '#94a3b8' },
  under_documentation: { label: 'Under Documentation', bg: 'bg-slate-400', text: 'text-white', hex: '#94a3b8' },
  under_construction: { label: 'Under Construction', bg: 'bg-slate-400', text: 'text-white', hex: '#94a3b8' },
  completed: { label: 'Completed', bg: 'bg-brand-700', text: 'text-white', hex: '#001A3D' },
  not_available: { label: 'Not Released', bg: 'bg-slate-300', text: 'text-slate-600', hex: '#cbd5e1' },
};

export const MILESTONE_STATUS_CONFIG = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-flame-500 text-white' },
  completed: { label: 'Completed', className: 'bg-success text-white' },
  delayed: { label: 'Delayed', className: 'bg-destructive text-white' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
};

export const INFRASTRUCTURE_LABELS = {
  road: 'Road Network', drainage: 'Drainage', electricity: 'Electricity',
  street_light: 'Street Lighting', water_supply: 'Water Supply', borehole: 'Borehole',
  sewage: 'Sewage System', perimeter_fence: 'Perimeter Fence', gate_house: 'Gate House',
  security_post: 'Security Post', park: 'Park', playground: 'Playground',
  club_house: 'Club House', health_centre: 'Health Centre', school: 'School',
  shopping_centre: 'Shopping Centre', other: 'Other',
};

export const FACILITY_LABELS = {
  park: 'Park', playground: 'Playground', club_house: 'Club House',
  health_centre: 'Health Centre', school: 'School', shopping_centre: 'Shopping Centre',
  sports_complex: 'Sports Complex', swimming_pool: 'Swimming Pool', gym: 'Gym',
  community_hall: 'Community Hall', place_of_worship: 'Place of Worship', other: 'Other',
};

export const PROJECT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'featured', label: 'Featured First' },
  { value: 'progress_high', label: 'Progress: High to Low' },
  { value: 'progress_low', label: 'Progress: Low to High' },
  { value: 'plots_available', label: 'Most Available Plots' },
];

export const PROJECT_PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₦5M', min: 0, max: 5_000_000 },
  { label: '₦5M – ₦20M', min: 5_000_000, max: 20_000_000 },
  { label: '₦20M – ₦50M', min: 20_000_000, max: 50_000_000 },
  { label: '₦50M – ₦100M', min: 50_000_000, max: 100_000_000 },
  { label: '₦100M+', min: 100_000_000, max: Infinity },
];

export const PUBLIC_PROJECT_STATUSES = [
  'planning', 'survey_completed', 'approval_pending', 'infrastructure_development',
  'construction', 'selling', 'allocation', 'handover', 'completed',
];

export const PROJECT_CATEGORY_LABELS = {
  residential_estate: 'Residential Estate',
  commercial_development: 'Commercial Development',
  mixed_use: 'Mixed-Use Development',
  industrial_park: 'Industrial Park',
  smart_city: 'Smart City',
  affordable_housing: 'Affordable Housing',
  luxury_estate: 'Luxury Estate',
  waterfront_estate: 'Waterfront Estate',
  farm_estate: 'Farm Estate',
  eco_estate: 'Eco Estate',
  golf_estate: 'Golf Estate',
};

export const formatPlotSize = (size, unit = 'sqm') => {
  if (!size) return '—';
  return `${size.toLocaleString('en-NG')} ${unit}`;
};