/**
 * Client-side enquiry and inspection workflow utilities.
 * Display configs, inquiry categories, and structured question generation
 * from property attributes and verification information.
 */

export const INQUIRY_CATEGORIES = [
  { value: 'general_info', label: 'General Information', icon: 'Info' },
  { value: 'pricing', label: 'Pricing & Payment', icon: 'NairaSign' },
  { value: 'inspection_request', label: 'Request Site Inspection', icon: 'CalendarCheck' },
  { value: 'financing', label: 'Financing Options', icon: 'Landmark' },
  { value: 'documentation', label: 'Documents & Title', icon: 'FileText' },
  { value: 'availability', label: 'Availability Status', icon: 'Clock' },
  { value: 'joint_venture', label: 'Joint Venture Terms', icon: 'Handshake' },
  { value: 'other', label: 'Other', icon: 'MessageSquare' },
];

export const INQUIRY_CATEGORY_LABELS = INQUIRY_CATEGORIES.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});

/**
 * Generates structured questions a buyer can select, tailored to the
 * property's attributes and verification status. Each question is a
 * short, specific string the buyer can tick before submitting.
 */
export function generateQuestions(property) {
  if (!property) return [];
  const questions = [];

  // Always-available questions
  questions.push('Is the property still available?');
  questions.push('Is the asking price negotiable?');

  // Pricing questions
  if (property.listing_purpose === 'rent' || property.listing_purpose === 'lease') {
    questions.push('What is the lease/rent duration and payment frequency?');
    questions.push('Are there any additional fees or service charges?');
  } else {
    questions.push('What are the payment terms and can it be paid in instalments?');
    questions.push('Are there any hidden charges or closing costs?');
  }

  // Documentation / title questions
  if (property.property_verification_status === 'approved') {
    questions.push('What documents were reviewed under the property verification?');
    questions.push('Can I see the verification scope and supporting evidence?');
  } else if (property.property_verification_status === 'pending') {
    questions.push('Has the property verification been completed? What is the status?');
  } else {
    questions.push('What title documents are available for this property?');
    questions.push('Can the property be independently verified before payment?');
  }

  // Inspection
  questions.push('Can I schedule a physical site inspection?');

  // Property-specific questions
  if (property.land_size_sqm != null) {
    questions.push('What is the exact land size and plot dimensions?');
  }
  if (property.year_built != null) {
    questions.push('What is the current condition of the building?');
  }
  if (property.furnishing_status) {
    questions.push('What is included in the furnishing?');
  }
  if (property.is_joint_venture) {
    questions.push('What are the joint venture terms and profit-sharing structure?');
  }
  if (property.amenities?.length > 0) {
    questions.push('Which amenities are fully operational vs. planned?');
  }

  // Location
  if (property.estate) {
    questions.push('What is the estate layout and infrastructure status?');
  }

  return questions;
}

/**
 * Builds a pre-filled enquiry message from the property and selected questions.
 */
export function buildPrefilledMessage(property, category, questions) {
  const lines = [];
  const title = property?.title || 'this property';
  const ref = property?.reference_number || property?.property_code || '';

  if (ref) {
    lines.push(`Listing Reference: ${ref}`);
  }
  lines.push(`Property: ${title}`);
  lines.push('');

  const catLabel = INQUIRY_CATEGORY_LABELS[category] || 'General Information';
  lines.push(`Inquiry Category: ${catLabel}`);
  lines.push('');

  if (questions && questions.length > 0) {
    lines.push('Questions:');
    for (const q of questions) {
      lines.push(`- ${q}`);
    }
    lines.push('');
    lines.push('Please address the questions above. Thank you.');
  } else {
    lines.push('I am interested in this property and would like more information.');
  }

  return lines.join('\n');
}