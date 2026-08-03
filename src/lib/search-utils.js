/**
 * Enterprise Search Engine — shared utilities and configurations.
 */
import { base44 } from '@/api/base44Client';

export const PROPERTY_TYPES = [
  'House', 'Apartment', 'Duplex', 'Terrace', 'Penthouse', 'Land',
  'Commercial', 'Warehouse', 'Office', 'Shop', 'Mansion', 'Bungalow', 'Flat',
];

export const PROPERTY_CLASSIFICATIONS = [
  { value: 'ultra_luxury', label: 'Ultra Luxury' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
  { value: 'budget', label: 'Budget' },
];

export const NIGERIAN_STATES = [
  'Lagos', 'Abuja FCT', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Delta', 'Edo',
  'Kaduna', 'Ogun', 'Anambra', 'Imo', 'Akwa Ibom', 'Cross River', 'Plateau',
  'Benue', 'Ondo', 'Osun', 'Ekiti', 'Kwara', 'Bauchi', 'Borno', 'Sokoto',
  'Niger', 'Abia', 'Bayelsa', 'Ebonyi', 'Gombe', 'Jigawa', 'Kebbi',
  'Kogi', 'Nasarawa', 'Taraba', 'Yobe', 'Zamfara', 'Adamawa',
];

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_low', label: 'Lowest Price' },
  { value: 'price_high', label: 'Highest Price' },
  { value: 'alpha', label: 'A–Z' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_saved', label: 'Most Saved' },
];

export const TRENDING_SEARCHES = [
  '4 bedroom house Lekki',
  'Land in Ibeju-Lekki',
  'Duplex in Abuja',
  'Apartments in Yaba',
  'Buy2Flip investment',
  'Commercial property Lagos',
  'Estate in Epe',
  'Affordable land',
];

export const SEARCH_TABS = [
  { key: 'all', label: 'All Results' },
  { key: 'properties', label: 'Properties' },
  { key: 'projects', label: 'Projects' },
  { key: 'agents', label: 'Agents' },
  { key: 'locations', label: 'Locations' },
];

export function buildPropertyFilter(filters) {
  const query = {};
  if (filters.propertyType) query.property_type = filters.propertyType;
  if (filters.state) query.state = filters.state;
  if (filters.city) query.city = filters.city;
  if (filters.bedrooms) query.bedrooms = { $gte: Number(filters.bedrooms) };
  if (filters.bathrooms) query.bathrooms = { $gte: Number(filters.bathrooms) };
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }
  if (filters.classification) query.property_classification = filters.classification;
  if (filters.featured) query.is_featured = true;
  return query;
}

export function matchesText(record, query, fields) {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  return fields.some((f) => {
    const val = record[f];
    if (!val) return false;
    if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(q));
    return String(val).toLowerCase().includes(q);
  });
}

export function sortResults(results, sort) {
  const sorted = [...results];
  switch (sort) {
    case 'newest': return sorted.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    case 'oldest': return sorted.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
    case 'price_low': return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price_high': return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'alpha': return sorted.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    case 'most_viewed': return sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    case 'most_saved': return sorted.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
    default: return sorted;
  }
}

/**
 * Searches across properties, projects, and agents in parallel.
 * Returns { properties, projects, agents, total, durationMs }.
 */
export async function searchAll(query, filters = {}, limit = 30) {
  const start = Date.now();
  const propFilter = buildPropertyFilter(filters);
  const projFilter = {};
  const agentFilter = {};

  if (filters.state) {
    projFilter.location_state = filters.state;
    agentFilter.service_areas = filters.state;
  }

  const [properties, projects, agents] = await Promise.all([
    base44.entities.Property.filter(propFilter, '-created_date', limit).catch(() => []),
    base44.entities.Project.filter(projFilter, '-created_date', limit).catch(() => []),
    base44.entities.Agent.filter({ status: 'active' }, '-created_date', limit).catch(() => []),
  ]);

  const propFields = ['title', 'short_description', 'description', 'state', 'city', 'lga', 'reference_number', 'property_type', 'estate', 'district'];
  const projFields = ['name', 'short_description', 'description', 'location_state', 'location_city', 'location_lga', 'reference_number', 'project_type'];
  const agentFields = ['full_name', 'bio', 'specialization', 'email', 'agent_code'];

  const filteredProps = properties.filter((p) => matchesText(p, query, propFields));
  const filteredProjects = projects.filter((p) => matchesText(p, query, projFields));
  const filteredAgents = agents.filter((a) => matchesText(a, query, agentFields));

  return {
    properties: filteredProps,
    projects: filteredProjects,
    agents: filteredAgents,
    total: filteredProps.length + filteredProjects.length + filteredAgents.length,
    durationMs: Date.now() - start,
  };
}

export async function logSearch(params) {
  try {
    await base44.entities.SearchLog.create({
      search_query: params.query || '',
      filters: params.filters || {},
      result_type: params.resultType || 'all',
      results_count: params.resultsCount || 0,
      zero_results: (params.resultsCount || 0) === 0,
      user_id: params.userId || null,
      search_duration_ms: params.durationMs || 0,
      device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
    });
  } catch { /* silent — analytics best-effort */ }
}

export function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('pq_search_history') || '[]'); } catch { return []; }
}

export function addSearchHistory(query) {
  if (!query?.trim()) return;
  const history = getSearchHistory().filter((h) => h.toLowerCase() !== query.toLowerCase());
  history.unshift(query.trim());
  localStorage.setItem('pq_search_history', JSON.stringify(history.slice(0, 10)));
}

export function clearSearchHistory() {
  localStorage.removeItem('pq_search_history');
}