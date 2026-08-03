export const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric', ...opts });
};

export const truncate = (text, max = 150) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

export const slugify = (text) => {
  return text?.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || '';
};

export const estimateReadingTime = (content) => {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const categoryLabels = {
  market_insights: 'Market Insights',
  property_tips: 'Property Tips',
  company_news: 'Company News',
  investment: 'Investment',
  construction: 'Construction',
  legal: 'Legal',
  lifestyle: 'Lifestyle',
  industry: 'Industry',
};

export const newsTypeLabels = {
  announcement: 'Announcement',
  press_release: 'Press Release',
  event: 'Event',
  project_launch: 'Project Launch',
  media_coverage: 'Media Coverage',
  milestone: 'Milestone',
};

export const departmentLabels = {
  sales: 'Sales',
  marketing: 'Marketing',
  construction: 'Construction',
  property_management: 'Property Management',
  finance: 'Finance',
  technology: 'Technology',
  operations: 'Operations',
  administration: 'Administration',
  legal: 'Legal',
  customer_service: 'Customer Service',
};

export const csrCategoryLabels = {
  education: 'Education',
  health: 'Health',
  environment: 'Environment',
  community: 'Community Development',
  youth_empowerment: 'Youth Empowerment',
  infrastructure: 'Infrastructure',
  charity: 'Charity',
};

export const serviceCategoryLabels = {
  agency: 'Real Estate Agency',
  management: 'Property Management',
  construction: 'Construction',
  development: 'Project Development',
  advisory: 'Advisory Services',
  valuation: 'Valuation',
  marketing: 'Property Marketing',
};

export const inquiryTypeLabels = {
  consultation: 'Consultation Request',
  inspection: 'Inspection Booking',
  general: 'General Inquiry',
  partnership: 'Partnership Opportunity',
  career: 'Career Inquiry',
  press: 'Press & Media',
  complaint: 'Complaint',
};