import {
  Heart, MessageSquare, Calendar, TrendingUp, Building2, Upload, User,
  Users, Target, FileText, AlertCircle, ShieldCheck, HardHat, Wrench,
  BarChart3, Headphones, Clock, Scale, Wallet, DollarSign, Megaphone,
  Award, Activity, Server, Flag, CheckCircle, Download, Share2, Eye,
  Plus, Send, FileBarChart, UserCog,
} from 'lucide-react';

export const roleDashboardConfig = {
  customer: {
    stats: [
      { label: 'Saved Properties', value: 12, icon: Heart, trend: '+3 this week', color: 'flame' },
      { label: 'Active Enquiries', value: 3, icon: MessageSquare, color: 'info' },
      { label: 'Upcoming Inspections', value: 2, icon: Calendar, color: 'success' },
      { label: 'Buy2Flip Active', value: 1, icon: TrendingUp, color: 'warning' },
    ],
    quickActions: [
      { label: 'Browse Properties', href: '/dashboard/properties', icon: Building2 },
      { label: 'Request Inspection', href: '/dashboard/properties', icon: Calendar },
      { label: 'Submit Property', href: '/dashboard/properties', icon: Upload },
      { label: 'Update Profile', href: '/dashboard/settings', icon: User },
    ],
    activities: [
      { type: 'property', text: 'Saved "3-Bedroom Detached, Lekki Phase 2"', time: '2h ago' },
      { type: 'enquiry', text: 'Submitted enquiry for Eko Gardens Estate', time: '5h ago' },
      { type: 'inspection', text: 'Inspection scheduled for tomorrow at 10:00 AM', time: '1d ago' },
      { type: 'document', text: 'Downloaded brochure for Lekki Pearl Estate', time: '2d ago' },
    ],
  },

  prospective_agent: {
    stats: [
      { label: 'Application Progress', value: '60%', icon: Target, trend: '2 steps remaining', color: 'flame' },
      { label: 'Documents Submitted', value: '4/6', icon: FileText, color: 'info' },
      { label: 'Verification Status', value: 'Pending', icon: Clock, color: 'warning' },
      { label: 'Days Since Application', value: 5, icon: Calendar, color: 'brand' },
    ],
    quickActions: [
      { label: 'Upload Documents', href: '/dashboard/settings', icon: Upload },
      { label: 'Edit Application', href: '/dashboard/settings', icon: User },
      { label: 'View Checklist', href: '/dashboard', icon: CheckCircle },
      { label: 'Contact Support', href: '/dashboard/support', icon: Headphones },
    ],
    activities: [
      { type: 'document', text: 'Uploaded valid government-issued ID', time: '3h ago' },
      { type: 'profile', text: 'Updated profile and contact information', time: '1d ago' },
      { type: 'notification', text: 'Admin requested additional documents', time: '2d ago' },
      { type: 'document', text: 'Submitted certificate of incorporation', time: '3d ago' },
    ],
  },

  verified_agent: {
    stats: [
      { label: 'Assigned Leads', value: 8, icon: Users, trend: '+2 this week', color: 'flame' },
      { label: 'Total Commission', value: '₦450K', icon: Wallet, color: 'success' },
      { label: 'Conversion Rate', value: '32%', icon: Target, color: 'info' },
      { label: 'Properties Marketed', value: 15, icon: Building2, color: 'warning' },
    ],
    quickActions: [
      { label: 'View Leads', href: '/dashboard/leads', icon: Users },
      { label: 'Download Brochure', href: '/dashboard/properties', icon: Download },
      { label: 'Share Listing', href: '/dashboard/properties', icon: Share2 },
      { label: 'My Performance', href: '/dashboard/reports', icon: BarChart3 },
    ],
    activities: [
      { type: 'enquiry', text: 'New lead assigned: Mr. Chukwu (Lekki)', time: '1h ago' },
      { type: 'inspection', text: 'Inspection booked for 3-Bedroom Flat, Ikoyi', time: '4h ago' },
      { type: 'property', text: 'Listed "Cozy Apartment, Victoria Island"', time: '1d ago' },
      { type: 'approval', text: 'Commission paid for Ajah transaction', time: '3d ago' },
    ],
  },

  sales_executive: {
    stats: [
      { label: 'Pipeline Value', value: '₦120M', icon: Target, color: 'flame' },
      { label: 'Monthly Target', value: '75%', icon: Award, trend: 'On track', color: 'success' },
      { label: 'Open Leads', value: 12, icon: Users, color: 'info' },
      { label: 'Follow-ups Due', value: 5, icon: Clock, color: 'warning' },
    ],
    quickActions: [
      { label: 'New Quotation', href: '/dashboard/properties', icon: FileText },
      { label: 'Schedule Follow-up', href: '/dashboard/leads', icon: Calendar },
      { label: 'View Pipeline', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Customer Comms', href: '/dashboard/support', icon: MessageSquare },
    ],
    activities: [
      { type: 'enquiry', text: 'Quotation sent to Mrs. Adeyemi (₦45M)', time: '2h ago' },
      { type: 'inspection', text: 'Follow-up call scheduled with Mr. Okafor', time: '5h ago' },
      { type: 'approval', text: 'Deal closed: Lekki Phase 2 terrace', time: '1d ago' },
      { type: 'property', text: 'New lead from website enquiry form', time: '2d ago' },
    ],
  },

  construction_officer: {
    stats: [
      { label: 'Active Projects', value: 4, icon: HardHat, color: 'flame' },
      { label: 'Pending Approvals', value: 2, icon: AlertCircle, color: 'warning' },
      { label: 'Site Reports', value: 7, icon: FileText, color: 'info' },
      { label: 'Safety Notices', value: 1, icon: ShieldCheck, color: 'success' },
    ],
    quickActions: [
      { label: 'Upload Report', href: '/dashboard/construction', icon: Upload },
      { label: 'Submit Progress', href: '/dashboard/construction', icon: CheckCircle },
      { label: 'Safety Notice', href: '/dashboard/construction', icon: AlertCircle },
      { label: 'View Milestones', href: '/dashboard/construction', icon: Calendar },
    ],
    activities: [
      { type: 'document', text: 'Site report uploaded for Eko Gardens Block B', time: '1h ago' },
      { type: 'approval', text: 'Milestone 3 approved for Lekki Pearl Phase 1', time: '6h ago' },
      { type: 'notification', text: 'Safety inspection due at Ajah site', time: '1d ago' },
      { type: 'document', text: 'Progress photos uploaded for Victoria Island', time: '2d ago' },
    ],
  },

  property_manager: {
    stats: [
      { label: 'Managed Properties', value: 18, icon: Building2, color: 'flame' },
      { label: 'Maintenance Requests', value: 6, icon: Wrench, color: 'warning' },
      { label: 'Inspections Scheduled', value: 3, icon: Calendar, color: 'info' },
      { label: 'Available Units', value: 5, icon: Eye, color: 'success' },
    ],
    quickActions: [
      { label: 'New Maintenance', href: '/dashboard/management', icon: Wrench },
      { label: 'Schedule Inspection', href: '/dashboard/management', icon: Calendar },
      { label: 'View Properties', href: '/dashboard/properties', icon: Building2 },
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    ],
    activities: [
      { type: 'enquiry', text: 'Maintenance request: plumbing at Unit 4A', time: '2h ago' },
      { type: 'inspection', text: 'Quarterly inspection completed at Lekki', time: '6h ago' },
      { type: 'property', text: 'Unit 12B marked as available', time: '1d ago' },
      { type: 'document', text: 'Lease agreement uploaded for Unit 7C', time: '2d ago' },
    ],
  },

  buy2flip_manager: {
    stats: [
      { label: 'Participants', value: 142, icon: Users, trend: '+12 this month', color: 'flame' },
      { label: 'Pending Approvals', value: 3, icon: AlertCircle, color: 'warning' },
      { label: 'Maturity Events', value: 8, icon: Calendar, color: 'info' },
      { label: 'Total Committed', value: '₦85M', icon: Wallet, color: 'success' },
    ],
    quickActions: [
      { label: 'Review Applications', href: '/dashboard/buy2flip', icon: CheckCircle },
      { label: 'Process Maturity', href: '/dashboard/buy2flip', icon: Calendar },
      { label: 'Analytics', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Send Updates', href: '/dashboard/buy2flip', icon: Send },
    ],
    activities: [
      { type: 'approval', text: 'Buy2Flip application approved for Mr. Bello', time: '1h ago' },
      { type: 'notification', text: 'Maturity event: Plan B-24 matures in 5 days', time: '4h ago' },
      { type: 'document', text: 'Commitment received: ₦2.5M from Mrs. Eze', time: '1d ago' },
      { type: 'enquiry', text: 'New enquiry about Flip Plan C-36', time: '2d ago' },
    ],
  },

  customer_service: {
    stats: [
      { label: 'Open Tickets', value: 24, icon: Headphones, color: 'flame' },
      { label: 'Pending Response', value: 7, icon: Clock, color: 'warning' },
      { label: 'Escalated Issues', value: 2, icon: AlertCircle, color: 'error' },
      { label: 'Avg Response Time', value: '2h', icon: Clock, color: 'info' },
    ],
    quickActions: [
      { label: 'Respond to Ticket', href: '/dashboard/support', icon: MessageSquare },
      { label: 'Escalate Issue', href: '/dashboard/support', icon: AlertCircle },
      { label: 'Knowledge Base', href: '/dashboard/support', icon: FileText },
      { label: 'View Chat', href: '/dashboard/support', icon: Headphones },
    ],
    activities: [
      { type: 'enquiry', text: 'Ticket #1042 resolved: inspection scheduling', time: '30m ago' },
      { type: 'notification', text: 'Ticket #1051 escalated to Legal', time: '2h ago' },
      { type: 'enquiry', text: 'New ticket: Buy2Flip payment enquiry', time: '4h ago' },
      { type: 'approval', text: 'Knowledge base article published', time: '1d ago' },
    ],
  },

  legal_officer: {
    stats: [
      { label: 'Pending Reviews', value: 5, icon: Scale, color: 'flame' },
      { label: 'POA Submissions', value: 3, icon: FileText, color: 'info' },
      { label: 'Contracts Pending', value: 4, icon: FileText, color: 'warning' },
      { label: 'Recent Approvals', value: 12, icon: CheckCircle, color: 'success' },
    ],
    quickActions: [
      { label: 'Review Contract', href: '/dashboard/legal', icon: Scale },
      { label: 'Verify Document', href: '/dashboard/legal', icon: CheckCircle },
      { label: 'Approve POA', href: '/dashboard/legal', icon: FileText },
      { label: 'Legal Notice', href: '/dashboard/legal', icon: AlertCircle },
    ],
    activities: [
      { type: 'document', text: 'Power of Attorney verified for Mr. Oye', time: '1h ago' },
      { type: 'approval', text: 'Contract approved: Lekki Pearl Plot 24', time: '5h ago' },
      { type: 'document', text: 'Legal review submitted for Eko Gardens', time: '1d ago' },
      { type: 'notification', text: 'New POA submission from Mrs. Adewale', time: '2d ago' },
    ],
  },

  finance_officer: {
    stats: [
      { label: 'Revenue (MTD)', value: '₦45M', icon: Wallet, trend: '+12% vs last', color: 'flame' },
      { label: 'Pending Payments', value: 8, icon: Clock, color: 'warning' },
      { label: 'Outstanding', value: '₦2.3M', icon: AlertCircle, color: 'error' },
      { label: 'Buy2Flip Activity', value: '₦12M', icon: TrendingUp, color: 'success' },
    ],
    quickActions: [
      { label: 'Confirm Payment', href: '/dashboard/finance', icon: CheckCircle },
      { label: 'Generate Report', href: '/dashboard/reports', icon: FileBarChart },
      { label: 'Transactions', href: '/dashboard/finance', icon: DollarSign },
      { label: 'Export Data', href: '/dashboard/reports', icon: Download },
    ],
    activities: [
      { type: 'approval', text: 'Payment confirmed: ₦5M from Mr. Adebayo', time: '1h ago' },
      { type: 'document', text: 'Monthly financial report generated', time: '5h ago' },
      { type: 'notification', text: 'Outstanding balance reminder sent', time: '1d ago' },
      { type: 'approval', text: 'Buy2Flip payout processed for Plan A-12', time: '2d ago' },
    ],
  },

  marketing_officer: {
    stats: [
      { label: 'Active Campaigns', value: 3, icon: Megaphone, color: 'flame' },
      { label: 'Blog Posts', value: 8, icon: FileText, color: 'info' },
      { label: 'Newsletter Subs', value: '2.4K', icon: Send, trend: '+180 this week', color: 'success' },
      { label: 'Social Reach', value: '15K', icon: Share2, color: 'warning' },
    ],
    quickActions: [
      { label: 'New Campaign', href: '/dashboard/marketing', icon: Megaphone },
      { label: 'Create Blog Post', href: '/dashboard/marketing', icon: FileText },
      { label: 'Upload Media', href: '/dashboard/marketing', icon: Upload },
      { label: 'Schedule Promo', href: '/dashboard/marketing', icon: Calendar },
    ],
    activities: [
      { type: 'document', text: 'Blog published: "Top 5 Investment Areas in Lagos"', time: '2h ago' },
      { type: 'notification', text: 'Newsletter sent to 2,400 subscribers', time: '6h ago' },
      { type: 'document', text: 'Campaign assets uploaded for Eko Gardens', time: '1d ago' },
      { type: 'approval', text: 'Social media calendar approved', time: '2d ago' },
    ],
  },

  hr_officer: {
    stats: [
      { label: 'Total Staff', value: 48, icon: Users, color: 'flame' },
      { label: 'Open Recruitment', value: 3, icon: UserCog, color: 'info' },
      { label: 'Leave Requests', value: 4, icon: Calendar, color: 'warning' },
      { label: 'Training Active', value: 6, icon: Award, color: 'success' },
    ],
    quickActions: [
      { label: 'Add Employee', href: '/dashboard/hr', icon: User },
      { label: 'Review Leave', href: '/dashboard/hr', icon: Calendar },
      { label: 'Training Resource', href: '/dashboard/hr', icon: Award },
      { label: 'Performance Review', href: '/dashboard/reports', icon: BarChart3 },
    ],
    activities: [
      { type: 'approval', text: 'Leave request approved for J. Okafor', time: '3h ago' },
      { type: 'profile', text: 'New employee onboarded: Marketing Officer', time: '1d ago' },
      { type: 'document', text: 'Training module published: Property Law Basics', time: '2d ago' },
      { type: 'notification', text: '3 new job applications received', time: '3d ago' },
    ],
  },

  department_manager: {
    stats: [
      { label: 'Dept KPIs', value: '92%', icon: Target, trend: 'Above target', color: 'flame' },
      { label: 'Team Members', value: 12, icon: Users, color: 'info' },
      { label: 'Pending Approvals', value: 3, icon: AlertCircle, color: 'warning' },
      { label: 'Active Tasks', value: 18, icon: CheckCircle, color: 'success' },
    ],
    quickActions: [
      { label: 'View KPIs', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Assign Task', href: '/dashboard', icon: Plus },
      { label: 'Approve Request', href: '/dashboard', icon: CheckCircle },
      { label: 'Announce', href: '/dashboard/marketing', icon: Megaphone },
    ],
    activities: [
      { type: 'approval', text: 'Budget request approved for Q3', time: '2h ago' },
      { type: 'notification', text: 'Team meeting scheduled for Friday', time: '5h ago' },
      { type: 'document', text: 'Monthly department report submitted', time: '1d ago' },
      { type: 'approval', text: 'Task assigned to 3 team members', time: '2d ago' },
    ],
  },

  administrator: {
    stats: [
      { label: 'Total Users', value: '1,204', icon: Users, trend: '+24 this week', color: 'flame' },
      { label: 'Pending Approvals', value: 7, icon: AlertCircle, color: 'warning' },
      { label: 'Agent Verifications', value: 4, icon: ShieldCheck, color: 'info' },
      { label: 'Audit Events (24h)', value: 156, icon: Activity, color: 'success' },
    ],
    quickActions: [
      { label: 'Approve Agent', href: '/admin/rbac', icon: CheckCircle },
      { label: 'Publish Property', href: '/dashboard/properties', icon: Building2 },
      { label: 'Review Project', href: '/dashboard/construction', icon: HardHat },
      { label: 'Manage Users', href: '/admin/rbac', icon: Users },
    ],
    activities: [
      { type: 'approval', text: 'Agent verified: Mr. Tunde (Lagos Island)', time: '1h ago' },
      { type: 'property', text: 'Property published: 4-Bedroom Duplex, Ikoyi', time: '3h ago' },
      { type: 'notification', text: 'New user registration: 5 in last 24h', time: '6h ago' },
      { type: 'document', text: 'Project review completed for Eko Gardens', time: '1d ago' },
    ],
  },

  super_administrator: {
    stats: [
      { label: 'System Health', value: '99.9%', icon: Server, trend: 'All systems operational', color: 'success' },
      { label: 'Active Users', value: 342, icon: Users, color: 'flame' },
      { label: 'Security Alerts', value: 0, icon: ShieldCheck, color: 'info' },
      { label: 'Feature Flags', value: 6, icon: Flag, color: 'warning' },
    ],
    quickActions: [
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
      { label: 'Manage Flags', href: '/admin/feature-flags', icon: Flag },
      { label: 'System Health', href: '/admin/rbac', icon: Server },
      { label: 'RBAC Matrix', href: '/admin/rbac', icon: ShieldCheck },
    ],
    activities: [
      { type: 'approval', text: 'Feature flag toggled: payment_gateway → enabled', time: '30m ago' },
      { type: 'notification', text: 'Scheduled backup completed successfully', time: '2h ago' },
      { type: 'document', text: 'Permission updated for role: finance_officer', time: '5h ago' },
      { type: 'approval', text: 'New API integration authorized: Dropbox', time: '1d ago' },
    ],
  },
};

export function getDashboardConfig(role) {
  if (role === 'user' || !role) return roleDashboardConfig.customer;
  return roleDashboardConfig[role] || roleDashboardConfig.customer;
}