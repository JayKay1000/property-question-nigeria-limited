/**
 * Shared utilities for the Enterprise Property Owner Submission Module.
 */
import { formatPrice, formatNumber } from '@/lib/property-utils';

export { formatPrice, formatNumber };

export const SUBMISSION_STEPS = [
  { key: 'guidelines', label: 'Submission Guidelines', icon: 'BookOpen' },
  { key: 'owner', label: 'Owner Information', icon: 'User' },
  { key: 'property', label: 'Property Details', icon: 'Home' },
  { key: 'location', label: 'Property Location', icon: 'MapPin' },
  { key: 'documents', label: 'Document Upload', icon: 'FileText' },
  { key: 'media', label: 'Media Upload', icon: 'Image' },
  { key: 'poa', label: 'Power of Attorney', icon: 'Scale' },
  { key: 'review', label: 'Review & Declarations', icon: 'CheckCircle2' },
];

export const REVIEW_STAGES = [
  { key: 'submitted', label: 'Submission Received', icon: 'Inbox' },
  { key: 'initial_review', label: 'Initial Review', icon: 'Search' },
  { key: 'document_verification', label: 'Document Verification', icon: 'FileCheck' },
  { key: 'gis_verification', label: 'GIS Verification', icon: 'MapPin' },
  { key: 'legal_review', label: 'Legal Review', icon: 'Scale' },
  { key: 'valuation_review', label: 'Valuation Review', icon: 'Calculator' },
  { key: 'marketing_review', label: 'Marketing Review', icon: 'Megaphone' },
  { key: 'approved', label: 'Approval', icon: 'CheckCircle2' },
  { key: 'listing_created', label: 'Listing Created', icon: 'Building2' },
];

export const SUBMISSION_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground border-border' },
  submitted: { label: 'Submitted', color: 'text-info', badge: 'bg-info/10 text-info border-info/20' },
  initial_review: { label: 'Initial Review', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  document_verification: { label: 'Document Verification', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  gis_verification: { label: 'GIS Verification', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  legal_review: { label: 'Legal Review', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  valuation_review: { label: 'Valuation Review', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  marketing_review: { label: 'Marketing Review', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', color: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', color: 'text-error', badge: 'bg-error/10 text-error border-error/20' },
  info_requested: { label: 'Info Requested', color: 'text-flame-600', badge: 'bg-flame-50 text-flame-600 border-flame-200' },
  listing_created: { label: 'Listing Created', color: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
};

export const REQUIRED_DOCUMENTS = [
  { key: 'certificate_of_occupancy', label: 'Certificate of Occupancy (C of O)', required: true, category: 'title' },
  { key: 'deed_of_assignment', label: 'Deed of Assignment', required: true, category: 'title' },
  { key: 'survey_plan', label: 'Registered Survey Plan', required: true, category: 'survey' },
  { key: 'gazette', label: 'Gazette', required: false, category: 'title' },
  { key: 'governors_consent', label: "Governor's Consent", required: false, category: 'title' },
  { key: 'building_approval', label: 'Building Approval', required: false, category: 'approval' },
  { key: 'tax_clearance', label: 'Tax Clearance', required: false, category: 'approval' },
  { key: 'utility_bills', label: 'Utility Bills', required: false, category: 'other' },
  { key: 'photographs', label: 'Property Photographs', required: false, category: 'other' },
  { key: 'floor_plans', label: 'Floor Plans', required: false, category: 'other' },
  { key: 'architectural_drawings', label: 'Architectural Drawings', required: false, category: 'other' },
  { key: 'valuation_report', label: 'Valuation Report', required: false, category: 'valuation_report' },
  { key: 'other_documents', label: 'Other Supporting Documents', required: false, category: 'other' },
];

export const PROPERTY_TYPES = [
  'house', 'apartment', 'duplex', 'terrace', 'land', 'commercial', 'warehouse', 'office', 'shop', 'maisonette', 'bungalow', 'penthouse',
];

export const SERVICES = [
  { key: 'sale', label: 'Sale', icon: 'Tag' },
  { key: 'lease', label: 'Lease', icon: 'FileSignature' },
  { key: 'management', label: 'Property Management', icon: 'Settings' },
  { key: 'valuation', label: 'Valuation', icon: 'Calculator' },
  { key: 'joint_development', label: 'Joint Development', icon: 'Building2' },
];

export const DECLARATIONS = [
  { key: 'accuracy', text: 'I confirm that all information provided is accurate and complete to the best of my knowledge.' },
  { key: 'authentic', text: 'I confirm that all uploaded documents are authentic and genuine.' },
  { key: 'authority', text: 'I confirm that I have the legal authority to submit this property for the stated purposes.' },
  { key: 'terms', text: 'I accept the submission terms and conditions of Property Question Nigeria Limited.' },
  { key: 'no_guarantee', text: 'I understand that submission does not guarantee acceptance or listing of my property.' },
];

export const SUBMISSION_GUIDELINES = [
  { title: 'Required Documents', desc: 'Ensure you have your Certificate of Occupancy, Deed of Assignment, and Survey Plan ready before starting.' },
  { title: 'Property Information', desc: 'Provide accurate details about your property including size, condition, and asking price.' },
  { title: 'Media Quality', desc: 'Upload clear, well-lit photographs. Drone footage and 360° media are encouraged where available.' },
  { title: 'GPS Coordinates', desc: 'If available, provide accurate GPS coordinates for GIS verification and map placement.' },
  { title: 'Legal Compliance', desc: 'All declarations must be accepted and a digital signature applied before submission.' },
  { title: 'Review Timeline', desc: 'Submissions are typically reviewed within 5–10 business days. You will receive updates throughout.' },
];

export const OWNER_BENEFITS = [
  { icon: 'Megaphone', title: 'Premium Marketing', desc: 'Your property gets professional marketing across our nationwide network and digital channels.' },
  { icon: 'ShieldCheck', title: 'Legal Protection', desc: 'Our legal team verifies documents and ensures compliant transactions.' },
  { icon: 'Users', title: 'Verified Agent Network', desc: 'Access our network of certified agents to find qualified buyers quickly.' },
  { icon: 'BarChart3', title: 'Fair Valuation', desc: 'Get professional valuation services to price your property competitively.' },
  { icon: 'Settings', title: 'Full Management', desc: 'We handle inspections, negotiations, and paperwork so you don\'t have to.' },
  { icon: 'Globe', title: 'Nationwide Exposure', desc: 'Reach buyers and investors across all 36 states and the FCT.' },
];

export const FAQ_ITEMS = [
  { q: 'Is there a fee to submit my property?', a: 'No. Property submission is completely free. Fees may apply only for optional services like valuation, and are discussed after review.' },
  { q: 'How long does the review take?', a: 'Initial review takes 5–10 business days. Complex submissions requiring legal or valuation review may take longer.' },
  { q: 'What documents do I need?', a: 'At minimum: Certificate of Occupancy or Deed of Assignment, and a Registered Survey Plan. Additional documents improve your chances of approval.' },
  { q: 'Can I submit on behalf of someone else?', a: 'Yes, with a valid Power of Attorney. Our module includes a dedicated PoA workflow for this purpose.' },
  { q: 'What happens after approval?', a: 'We create a professional listing, assign a responsible agent, and begin marketing your property through our channels.' },
  { q: 'Can I track my submission?', a: 'Yes. You receive a unique tracking reference and can monitor progress through our tracking dashboard.' },
];

export function generateSubmissionReference() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PQ-SUB-${year}-${random}`;
}