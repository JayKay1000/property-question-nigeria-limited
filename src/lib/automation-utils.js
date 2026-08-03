// Enterprise Workflow & Automation Utilities

export const WORKFLOW_MODULES = [
  { value: 'crm', label: 'CRM', color: '#001A3D', icon: 'Users' },
  { value: 'property', label: 'Properties', color: '#FF7A00', icon: 'Building2' },
  { value: 'project', label: 'Projects', color: '#19989D', icon: 'HardHat' },
  { value: 'agent', label: 'Agents', color: '#6366F1', icon: 'UserCheck' },
  { value: 'customer', label: 'Customers', color: '#10B981', icon: 'Heart' },
  { value: 'notification', label: 'Notifications', color: '#F59E0B', icon: 'Bell' },
  { value: 'document', label: 'Documents', color: '#8B5CF6', icon: 'FileText' },
  { value: 'financial', label: 'Financial', color: '#059669', icon: 'DollarSign' },
  { value: 'security', label: 'Security', color: '#DC2626', icon: 'Shield' },
  { value: 'general', label: 'General', color: '#6B7280', icon: 'Settings' },
];

export const TRIGGER_TYPES = [
  { value: 'entity_create', label: 'Record Created', icon: 'PlusCircle' },
  { value: 'entity_update', label: 'Record Updated', icon: 'Edit' },
  { value: 'entity_delete', label: 'Record Deleted', icon: 'Trash2' },
  { value: 'status_changed', label: 'Status Changed', icon: 'RefreshCw' },
  { value: 'scheduled', label: 'Scheduled', icon: 'Clock' },
  { value: 'manual', label: 'Manual Trigger', icon: 'Hand' },
  { value: 'webhook', label: 'Webhook', icon: 'Webhook' },
  { value: 'condition_met', label: 'Condition Met', icon: 'GitBranch' },
];

export const ACTION_TYPES = [
  { value: 'create_record', label: 'Create Record', icon: 'FilePlus' },
  { value: 'update_record', label: 'Update Record', icon: 'Edit' },
  { value: 'send_notification', label: 'Send Notification', icon: 'Bell' },
  { value: 'send_email', label: 'Send Email', icon: 'Mail' },
  { value: 'send_sms', label: 'Send SMS', icon: 'MessageSquare' },
  { value: 'create_task', label: 'Create Task', icon: 'CheckSquare' },
  { value: 'assign_user', label: 'Assign User', icon: 'UserPlus' },
  { value: 'create_lead', label: 'Create Lead', icon: 'UserPlus' },
  { value: 'create_opportunity', label: 'Create Opportunity', icon: 'TrendingUp' },
  { value: 'schedule_reminder', label: 'Schedule Reminder', icon: 'Clock' },
  { value: 'wait', label: 'Wait / Delay', icon: 'Hourglass' },
  { value: 'branch', label: 'Conditional Branch', icon: 'GitBranch' },
  { value: 'call_function', label: 'Call Function', icon: 'Code' },
  { value: 'ai_process', label: 'AI Process', icon: 'Sparkles' },
];

export const WORKFLOW_STATUS = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  active: { label: 'Active', color: 'bg-success/15 text-success' },
  paused: { label: 'Paused', color: 'bg-warning/15 text-warning' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
};

export const EXECUTION_STATUS = {
  running: { label: 'Running', color: 'bg-info/15 text-info', icon: 'Loader' },
  completed: { label: 'Completed', color: 'bg-success/15 text-success', icon: 'CheckCircle2' },
  failed: { label: 'Failed', color: 'bg-error/15 text-error', icon: 'XCircle' },
  skipped: { label: 'Skipped', color: 'bg-muted text-muted-foreground', icon: 'SkipForward' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: 'Ban' },
  timeout: { label: 'Timeout', color: 'bg-warning/15 text-warning', icon: 'AlertTriangle' },
};

export const WORKFLOW_CATEGORIES = [
  { value: 'lead_lifecycle', label: 'Lead Lifecycle' },
  { value: 'opportunity_management', label: 'Opportunity Management' },
  { value: 'sales_pipeline', label: 'Sales Pipeline' },
  { value: 'follow_up', label: 'Follow-up Automation' },
  { value: 'task_assignment', label: 'Task Assignment' },
  { value: 'reminder', label: 'Reminder Engine' },
  { value: 'customer_lifecycle', label: 'Customer Lifecycle' },
  { value: 'segmentation', label: 'Customer Segmentation' },
  { value: 'marketing', label: 'Marketing Automation' },
  { value: 'notification', label: 'Notification Automation' },
  { value: 'approval', label: 'Approval Workflow' },
  { value: 'verification', label: 'Verification Workflow' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'custom', label: 'Custom' },
];

export function getModuleInfo(value) {
  return WORKFLOW_MODULES.find(m => m.value === value) || WORKFLOW_MODULES[WORKFLOW_MODULES.length - 1];
}

export function getTriggerInfo(value) {
  return TRIGGER_TYPES.find(t => t.value === value) || TRIGGER_TYPES[0];
}

export function getActionInfo(value) {
  return ACTION_TYPES.find(a => a.value === value) || ACTION_TYPES[0];
}

export function formatDuration(ms) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function getSuccessRate(success, failure) {
  const total = success + failure;
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
}