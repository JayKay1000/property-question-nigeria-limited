// CMS shared utilities: field configs, labels, helpers

export const entityLabels = {
  BlogPost: 'Blog Post',
  NewsArticle: 'News Article',
  FAQ: 'FAQ',
  Testimonial: 'Testimonial',
  Service: 'Service',
  SiteContent: 'Site Content',
  LandingPage: 'Landing Page',
  CMSMenu: 'Menu',
};

export const contentTypeLabels = {
  page: 'Page',
  section: 'Section',
  snippet: 'Snippet',
  banner: 'Banner',
  settings: 'Settings',
};

export const statusConfig = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-0' },
  published: { label: 'Published', className: 'bg-success text-white border-0' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-0' },
  scheduled: { label: 'Scheduled', className: 'bg-info text-white border-0' },
  unpublished: { label: 'Unpublished', className: 'bg-muted text-muted-foreground border-0' },
};

export const approvalStatusConfig = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-0' },
  approved: { label: 'Approved', className: 'bg-success text-white border-0' },
  rejected: { label: 'Rejected', className: 'bg-error text-white border-0' },
  changes_requested: { label: 'Changes Requested', className: 'bg-info/15 text-info border-0' },
};

export const priorityConfig = {
  low: 'bg-muted text-muted-foreground border-0',
  normal: 'bg-ice-50 text-ice-700 border-0',
  high: 'bg-flame-50 text-flame-700 border-0',
  urgent: 'bg-error text-white border-0',
};

// Field configs — arrays of { key, label, type, options, required, placeholder, span }
// types: text, textarea, richtext, select, tags, boolean, number, url, datetime
export const fieldConfigs = {
  BlogPost: [
    { key: 'title', label: 'Title', type: 'text', required: true, span: 2 },
    { key: 'slug', label: 'Slug (URL)', type: 'text', required: true, placeholder: 'my-blog-post' },
    { key: 'category', label: 'Category', type: 'select', options: ['market_insights', 'property_tips', 'company_news', 'investment', 'construction', 'legal', 'lifestyle', 'industry'] },
    { key: 'author_name', label: 'Author', type: 'text' },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea', span: 2 },
    { key: 'content', label: 'Content (HTML supported)', type: 'richtext', span: 2 },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'tags', span: 2 },
    { key: 'featured_image_url', label: 'Featured Image URL', type: 'url', span: 2 },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
    { key: 'published_date', label: 'Publish Date', type: 'datetime' },
    { key: 'seo_title', label: 'SEO Title', type: 'text', span: 2 },
    { key: 'seo_description', label: 'SEO Description', type: 'textarea', span: 2 },
    { key: 'is_featured', label: 'Featured', type: 'boolean' },
    { key: 'reading_time_minutes', label: 'Reading Time (min)', type: 'number' },
  ],
  NewsArticle: [
    { key: 'title', label: 'Title', type: 'text', required: true, span: 2 },
    { key: 'slug', label: 'Slug', type: 'text', required: true },
    { key: 'news_type', label: 'News Type', type: 'select', options: ['announcement', 'press_release', 'event', 'project_launch', 'media_coverage', 'milestone'] },
    { key: 'author_name', label: 'Author', type: 'text' },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea', span: 2 },
    { key: 'content', label: 'Content (HTML supported)', type: 'richtext', span: 2 },
    { key: 'featured_image_url', label: 'Featured Image URL', type: 'url', span: 2 },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
    { key: 'published_date', label: 'Publish Date', type: 'datetime' },
    { key: 'seo_title', label: 'SEO Title', type: 'text', span: 2 },
    { key: 'seo_description', label: 'SEO Description', type: 'textarea', span: 2 },
    { key: 'is_featured', label: 'Featured', type: 'boolean' },
  ],
  FAQ: [
    { key: 'question', label: 'Question', type: 'text', required: true, span: 2 },
    { key: 'answer', label: 'Answer', type: 'textarea', required: true, span: 2 },
    { key: 'category', label: 'Category', type: 'select', options: ['general', 'property', 'project', 'buy2flip', 'agent', 'owner', 'payment', 'construction', 'legal', 'tour'] },
    { key: 'sort_order', label: 'Sort Order', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'boolean' },
  ],
  Testimonial: [
    { key: 'client_name', label: 'Client Name', type: 'text', required: true },
    { key: 'client_title', label: 'Client Title', type: 'text' },
    { key: 'client_company', label: 'Company', type: 'text' },
    { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    { key: 'service_used', label: 'Service Used', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'client_photo_url', label: 'Photo URL', type: 'url', span: 2 },
    { key: 'testimonial_text', label: 'Testimonial', type: 'textarea', required: true, span: 2 },
    { key: 'is_featured', label: 'Featured', type: 'boolean' },
    { key: 'is_approved', label: 'Approved', type: 'boolean' },
  ],
  Service: [
    { key: 'service_code', label: 'Service Code', type: 'text', required: true },
    { key: 'service_name', label: 'Service Name', type: 'text', required: true },
    { key: 'slug', label: 'Slug', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['agency', 'management', 'construction', 'development', 'advisory', 'valuation', 'marketing'] },
    { key: 'icon', label: 'Icon (lucide name)', type: 'text', placeholder: 'Building2' },
    { key: 'image_url', label: 'Image URL', type: 'url', span: 2 },
    { key: 'short_description', label: 'Short Description', type: 'textarea', span: 2 },
    { key: 'full_description', label: 'Full Description', type: 'richtext', span: 2 },
    { key: 'features', label: 'Features (comma-separated)', type: 'tags', span: 2 },
    { key: 'sort_order', label: 'Sort Order', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'boolean' },
  ],
  SiteContent: [
    { key: 'content_key', label: 'Content Key', type: 'text', required: true, placeholder: 'home_hero' },
    { key: 'content_type', label: 'Type', type: 'select', required: true, options: ['page', 'section', 'snippet', 'banner', 'settings'] },
    { key: 'title', label: 'Title', type: 'text', span: 2 },
    { key: 'content', label: 'Content (HTML supported)', type: 'richtext', span: 2 },
    { key: 'seo_title', label: 'SEO Title', type: 'text', span: 2 },
    { key: 'seo_description', label: 'SEO Description', type: 'textarea', span: 2 },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
    { key: 'sort_order', label: 'Sort Order', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'boolean' },
  ],
};

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return String(value); }
}

export function truncate(text, len = 100) {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '…' : text;
}

// Get a display title for any record across content entities
export function getRecordTitle(entityType, record) {
  if (!record) return 'Untitled';
  return record.title || record.question || record.service_name || record.client_name ||
    record.content_key || record.page_name || record.menu_name || 'Untitled';
}

export const categoryLabels = {
  market_insights: 'Market Insights', property_tips: 'Property Tips', company_news: 'Company News',
  investment: 'Investment', construction: 'Construction', legal: 'Legal', lifestyle: 'Lifestyle', industry: 'Industry',
};
export const newsTypeLabels = {
  announcement: 'Announcement', press_release: 'Press Release', event: 'Event',
  project_launch: 'Project Launch', media_coverage: 'Media Coverage', milestone: 'Milestone',
};