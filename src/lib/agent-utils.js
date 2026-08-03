/**
 * Shared utilities for the Enterprise Agent Management Module.
 */
import { formatPrice, formatNumber } from '@/lib/property-utils';

export { formatPrice, formatNumber };

export const AGENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  under_review: { label: 'Under Review', color: 'text-info', badge: 'bg-info/10 text-info border-info/20' },
  verified: { label: 'Verified', color: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
  active: { label: 'Active', color: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Inactive', color: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground border-border' },
  suspended: { label: 'Suspended', color: 'text-error', badge: 'bg-error/10 text-error border-error/20' },
  terminated: { label: 'Terminated', color: 'text-destructive', badge: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export const VERIFICATION_STATUS_CONFIG = {
  unverified: { label: 'Unverified', color: 'text-muted-foreground', icon: 'Clock' },
  pending: { label: 'Verification Pending', color: 'text-warning', icon: 'Clock' },
  verified: { label: 'Verified', color: 'text-success', icon: 'BadgeCheck' },
  rejected: { label: 'Rejected', color: 'text-error', icon: 'XCircle' },
};

export const VERIFICATION_STAGES = [
  { key: 'registration_submitted', label: 'Registration Submitted', icon: 'FileText' },
  { key: 'email_verification', label: 'Email Verification', icon: 'MailCheck' },
  { key: 'phone_verification', label: 'Phone Verification', icon: 'PhoneCheck' },
  { key: 'document_upload', label: 'Document Upload', icon: 'Upload' },
  { key: 'identity_review', label: 'Identity Review', icon: 'UserCheck' },
  { key: 'compliance_review', label: 'Compliance Review', icon: 'ShieldCheck' },
  { key: 'background_review', label: 'Background Review', icon: 'Search' },
  { key: 'final_approval', label: 'Final Approval', icon: 'Award' },
  { key: 'certified_agent', label: 'Certified Agent', icon: 'BadgeCheck' },
];

export const DOCUMENT_TYPE_CONFIG = {
  government_id: { label: 'Government-Issued ID', required: true, icon: 'IdCard', accept: '.pdf,.jpg,.jpeg,.png' },
  passport_photograph: { label: 'Passport Photograph', required: true, icon: 'Camera', accept: '.jpg,.jpeg,.png' },
  utility_bill: { label: 'Utility Bill', required: true, icon: 'Receipt', accept: '.pdf,.jpg,.jpeg,.png' },
  professional_certificate: { label: 'Professional Certification', required: false, icon: 'Award', accept: '.pdf,.jpg,.jpeg,.png' },
  signed_agreement: { label: 'Signed Agreement', required: false, icon: 'FileSignature', accept: '.pdf' },
  agency_license: { label: 'Agency License', required: false, icon: 'Briefcase', accept: '.pdf,.jpg,.jpeg,.png' },
  tax_identification: { label: 'Tax Identification (TIN)', required: false, icon: 'Receipt', accept: '.pdf,.jpg,.jpeg,.png' },
  bank_verification: { label: 'Bank Verification', required: false, icon: 'Building2', accept: '.pdf,.jpg,.jpeg,.png' },
  proof_of_address: { label: 'Proof of Address', required: false, icon: 'MapPin', accept: '.pdf,.jpg,.jpeg,.png' },
  employment_letter: { label: 'Employment Letter', required: false, icon: 'FileText', accept: '.pdf' },
  other: { label: 'Other Document', required: false, icon: 'Paperclip', accept: '.pdf,.jpg,.jpeg,.png' },
};

export const REGISTRATION_STEPS = [
  { key: 'personal', label: 'Personal Information', icon: 'User' },
  { key: 'contact', label: 'Contact & Address', icon: 'MapPin' },
  { key: 'professional', label: 'Professional Profile', icon: 'Briefcase' },
  { key: 'documents', label: 'Document Upload', icon: 'Upload' },
  { key: 'review', label: 'Review & Submit', icon: 'CheckCircle2' },
];

export const AGENT_BENEFITS = [
  { icon: 'TrendingUp', title: 'Competitive Commissions', desc: 'Earn industry-leading commissions on every successful transaction.' },
  { icon: 'GraduationCap', title: 'Professional Training', desc: 'Access certification programs, learning materials, and skill development.' },
  { icon: 'BadgeCheck', title: 'Verified Agent Badge', desc: 'Stand out with our blue verification tick on all your listings.' },
  { icon: 'Smartphone', title: 'Mobile Tools', desc: 'Manage leads, listings, and inspections from your phone or tablet.' },
  { icon: 'Globe', title: 'Nationwide Coverage', desc: 'Operate across Nigeria with territories in every state and LGA.' },
  { icon: 'BarChart3', title: 'Performance Analytics', desc: 'Track your sales pipeline, conversions, and earnings in real-time.' },
];

export const FAQ_ITEMS = [
  { q: 'Who can become an agent?', a: 'Anyone aged 18 and above with valid identification can apply. We welcome independent marketers, freelance agents, and experienced real estate professionals.' },
  { q: 'How long does verification take?', a: 'The verification process typically takes 3–7 business days from document submission, depending on background review completion.' },
  { q: 'What documents do I need?', a: 'You will need a government-issued ID, passport photograph, and a recent utility bill. Additional documents like professional certifications are optional but recommended.' },
  { q: 'Is there a registration fee?', a: 'No. Agent registration and onboarding are completely free. You only need to complete the verification process.' },
  { q: 'How do I receive my commission?', a: 'Commissions are paid directly to your registered bank account after each successful transaction. You can track all payments in your dashboard.' },
  { q: 'Can I work part-time?', a: 'Yes. Whether you are full-time or part-time, you can manage your own schedule and work at your own pace.' },
];

export function getStageIndex(status, verificationStatus) {
  const stageMap = {
    pending: 0, under_review: 4, verified: 8, active: 8,
    suspended: -1, terminated: -1, inactive: 8,
  };
  if (verificationStatus === 'rejected') return -1;
  return stageMap[status] ?? 0;
}

export function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}