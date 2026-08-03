/**
 * Shared utilities for the Enterprise Customer Portal.
 */
import { formatPrice, formatNumber } from '@/lib/property-utils';

export { formatPrice, formatNumber };

export const PORTAL_SECTIONS = [
  { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'saved', label: 'Saved Properties', icon: 'Heart' },
  { key: 'enquiries', label: 'My Enquiries', icon: 'MessageSquare' },
  { key: 'inspections', label: 'Inspections', icon: 'CalendarCheck' },
  { key: 'documents', label: 'Document Centre', icon: 'FolderOpen' },
  { key: 'notifications', label: 'Notifications', icon: 'Bell' },
  { key: 'support', label: 'Support', icon: 'LifeBuoy' },
  { key: 'buy2flip', label: 'Buy2Flip', icon: 'Rocket' },
  { key: 'profile', label: 'Profile', icon: 'UserCircle' },
];

export const ENQUIRY_STATUS_CONFIG = {
  new: { label: 'New', badge: 'bg-info/10 text-info border-info/20' },
  contacted: { label: 'Contacted', badge: 'bg-warning/10 text-warning border-warning/20' },
  qualified: { label: 'Qualified', badge: 'bg-flame-50 text-flame-600 border-flame-200' },
  site_visit_scheduled: { label: 'Site Visit Scheduled', badge: 'bg-flame-50 text-flame-600 border-flame-200' },
  negotiating: { label: 'Negotiating', badge: 'bg-warning/10 text-warning border-warning/20' },
  closed_won: { label: 'Closed Won', badge: 'bg-success/10 text-success border-success/20' },
  closed_lost: { label: 'Closed Lost', badge: 'bg-muted text-muted-foreground border-border' },
  nurturing: { label: 'Nurturing', badge: 'bg-info/10 text-info border-info/20' },
};

export const INSPECTION_STATUS_CONFIG = {
  pending: { label: 'Pending', badge: 'bg-warning/10 text-warning border-warning/20' },
  confirmed: { label: 'Confirmed', badge: 'bg-success/10 text-success border-success/20' },
  completed: { label: 'Completed', badge: 'bg-info/10 text-info border-info/20' },
  cancelled: { label: 'Cancelled', badge: 'bg-muted text-muted-foreground border-border' },
  rescheduled: { label: 'Rescheduled', badge: 'bg-flame-50 text-flame-600 border-flame-200' },
  no_show: { label: 'No Show', badge: 'bg-error/10 text-error border-error/20' },
};

export const TICKET_STATUS_CONFIG = {
  open: { label: 'Open', badge: 'bg-info/10 text-info border-info/20' },
  in_progress: { label: 'In Progress', badge: 'bg-warning/10 text-warning border-warning/20' },
  waiting_customer: { label: 'Awaiting Response', badge: 'bg-flame-50 text-flame-600 border-flame-200' },
  escalated: { label: 'Escalated', badge: 'bg-error/10 text-error border-error/20' },
  resolved: { label: 'Resolved', badge: 'bg-success/10 text-success border-success/20' },
  closed: { label: 'Closed', badge: 'bg-muted text-muted-foreground border-border' },
  reopened: { label: 'Reopened', badge: 'bg-warning/10 text-warning border-warning/20' },
};

export const TICKET_CATEGORIES = [
  { key: 'enquiry', label: 'General Enquiry' },
  { key: 'property_information', label: 'Property Information Request' },
  { key: 'document_request', label: 'Document Request' },
  { key: 'valuation', label: 'Valuation Request' },
  { key: 'property_management', label: 'Property Management' },
  { key: 'construction', label: 'Construction Enquiry' },
  { key: 'partnership', label: 'Partnership Enquiry' },
  { key: 'billing', label: 'Billing' },
  { key: 'complaint', label: 'Complaint' },
  { key: 'other', label: 'Other' },
];

export const FAQ_ITEMS = [
  { q: 'How do I book a site inspection?', a: 'Navigate to any property or project detail page and click "Book Inspection". You can also schedule from the Inspections tab in your portal.' },
  { q: 'Can I save properties to view later?', a: 'Yes. Click the heart icon on any property to save it. Access all saved properties from the Saved Properties tab.' },
  { q: 'How do I track my enquiries?', a: 'All your enquiries are listed in the My Enquiries tab with their current status and assigned agent.' },
  { q: 'What documents can I access?', a: 'The Document Centre provides brochures, inspection reports, invoices, and approved property documents based on your access level.' },
  { q: 'How do I contact my assigned agent?', a: 'Your assigned agent is shown on your dashboard. You can reach them directly via phone or email.' },
  { q: 'What is Buy2Flip?', a: 'Buy2Flip is our property investment platform. Visit the Buy2Flip tab to learn more and access the platform.' },
];

export function generateTicketNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PQ-TKT-${year}-${random}`;
}