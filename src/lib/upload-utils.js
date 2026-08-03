// Options for the manual upload forms

export const propertyTypeOptions = [
  'house', 'apartment', 'land', 'commercial', 'office', 'shop', 'warehouse', 'mixed_use', 'duplex', 'terrace', 'penthouse', 'maisonette',
];
export const listingPurposeOptions = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'lease', label: 'For Lease' },
];
export const propertyStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
export const propertyClassificationOptions = [
  { value: 'ultra_luxury', label: 'Ultra Luxury' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
  { value: 'budget', label: 'Budget' },
];
export const propertyConditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'needs_renovation', label: 'Needs Renovation' },
  { value: 'under_construction', label: 'Under Construction' },
];
export const furnishingOptions = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'furnished', label: 'Furnished' },
];
export const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'under_offer', label: 'Under Offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'leased', label: 'Leased' },
  { value: 'off_market', label: 'Off Market' },
];
export const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'internal', label: 'Internal' },
  { value: 'agents_only', label: 'Agents Only' },
];
export const nigerianStates = [
  'Lagos', 'Abuja FCT', 'Rivers', 'Oyo', 'Kano', 'Edo', 'Enugu', 'Delta', 'Kaduna', 'Ogun', 'Anambra', 'Imo', 'Akwa Ibom', 'Cross River', 'Abia', 'Bayelsa', 'Plateau', 'Benue', 'Kwara', 'Osun', 'Ondo', 'Ekiti', 'Nasarawa', 'Kogi', 'Borno', 'Sokoto', 'Katsina', 'Jigawa', 'Kebbi', 'Zamfara', 'Gombe', 'Bauchi', 'Yobe', 'Taraba', 'Adamawa', 'Niger',
];

export const documentTypeOptions = [
  'survey_plan', 'certificate_of_occupancy', 'deed_of_assignment', 'governors_consent', 'registered_survey', 'allocation_letter', 'power_of_attorney', 'building_approval', 'engineering_drawing', 'architectural_drawing', 'site_plan', 'floor_plan', 'brochure', 'quotation', 'contract', 'invoice', 'receipt', 'utility_bill', 'government_id', 'passport_photograph', 'company_registration', 'marketing_material', 'policy', 'manual', 'deed', 'c_of_o', 'govt_id', 'legal_document', 'construction_document', 'other',
];
export const documentTypeLabels = {
  survey_plan: 'Survey Plan', certificate_of_occupancy: 'Certificate of Occupancy', deed_of_assignment: 'Deed of Assignment', governors_consent: "Governor's Consent", registered_survey: 'Registered Survey', allocation_letter: 'Allocation Letter', power_of_attorney: 'Power of Attorney', building_approval: 'Building Approval', engineering_drawing: 'Engineering Drawing', architectural_drawing: 'Architectural Drawing', site_plan: 'Site Plan', floor_plan: 'Floor Plan', brochure: 'Brochure', quotation: 'Quotation', contract: 'Contract', invoice: 'Invoice', receipt: 'Receipt', utility_bill: 'Utility Bill', government_id: 'Government ID', passport_photograph: 'Passport Photograph', company_registration: 'Company Registration', marketing_material: 'Marketing Material', policy: 'Policy', manual: 'Manual', deed: 'Deed', c_of_o: 'C of O', govt_id: 'Govt ID', legal_document: 'Legal Document', construction_document: 'Construction Document', other: 'Other',
};
export const confidentialityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'legal_hold', label: 'Legal Hold' },
];
export const docVisibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'authenticated', label: 'Authenticated Users' },
  { value: 'agents_only', label: 'Agents Only' },
  { value: 'customers_only', label: 'Customers Only' },
  { value: 'staff_only', label: 'Staff Only' },
  { value: 'admin_only', label: 'Admin Only' },
];
export const relatedModuleOptions = [
  'properties', 'projects', 'buy2flip', 'crm', 'agents', 'customers', 'construction', 'property_management', 'marketing', 'hr', 'legal', 'corporate', 'finance', 'general',
];

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}