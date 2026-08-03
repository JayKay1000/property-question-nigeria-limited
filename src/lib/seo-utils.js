// SEO & Digital Marketing shared utilities

export const searchIntentLabels = {
  informational: 'Informational', commercial: 'Commercial',
  transactional: 'Transactional', navigational: 'Navigational',
};

export const competitionLabels = { low: 'Low', medium: 'Medium', high: 'High' };

export const keywordStatusConfig = {
  tracking: { label: 'Tracking', className: 'bg-ice-50 text-ice-700 border-0' },
  ranking: { label: 'Ranking', className: 'bg-success text-white border-0' },
  not_ranking: { label: 'Not Ranking', className: 'bg-muted text-muted-foreground border-0' },
  opportunity: { label: 'Opportunity', className: 'bg-flame-50 text-flame-700 border-0' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-0' },
};

export const redirectTypeConfig = {
  '301': { label: '301 Permanent', className: 'bg-success text-white border-0' },
  '302': { label: '302 Found', className: 'bg-info text-white border-0' },
  '307': { label: '307 Temporary', className: 'bg-warning/15 text-warning border-0' },
  '410': { label: '410 Gone', className: 'bg-error text-white border-0' },
};

export const campaignStatusConfig = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-0' },
  active: { label: 'Active', className: 'bg-success text-white border-0' },
  paused: { label: 'Paused', className: 'bg-warning/15 text-warning border-0' },
  completed: { label: 'Completed', className: 'bg-ice-50 text-ice-700 border-0' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-0' },
};

export const campaignTypeLabels = {
  search: 'Search', social: 'Social', email: 'Email', display: 'Display',
  referral: 'Referral', direct: 'Direct', affiliate: 'Affiliate',
};

export const linkTypeLabels = {
  contextual: 'Contextual', navigation: 'Navigation', footer: 'Footer',
  sidebar: 'Sidebar', image: 'Image',
};

export function buildUtmUrl(baseUrl, { source, medium, campaign, term, content }) {
  if (!baseUrl || !source || !medium || !campaign) return '';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', campaign);
    if (term) url.searchParams.set('utm_term', term);
    if (content) url.searchParams.set('utm_content', content);
    return url.toString();
  } catch { return ''; }
}

export function calcRoas(spend, value) {
  if (!spend || spend === 0) return 0;
  return Math.round((value / spend) * 100) / 100;
}
export function calcCtr(clicks, impressions) {
  if (!impressions || impressions === 0) return 0;
  return Math.round((clicks / impressions) * 1000) / 10;
}
export function calcConversionRate(conversions, clicks) {
  if (!clicks || clicks === 0) return 0;
  return Math.round((conversions / clicks) * 1000) / 10;
}
export function calcCpc(spend, clicks) {
  if (!clicks || clicks === 0) return 0;
  return Math.round((spend / clicks) * 100) / 100;
}

export function difficultyColor(score) {
  if (score == null) return 'text-muted-foreground';
  if (score < 30) return 'text-success';
  if (score < 60) return 'text-warning';
  return 'text-error';
}

export function formatNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-NG');
}

export function formatCurrency(n) {
  if (n == null) return '—';
  return '₦' + Number(n).toLocaleString('en-NG');
}

export function formatDate(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return String(value); }
}