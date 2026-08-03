import {
  Mail, MessageSquare, Smartphone, Bell, MessageCircle, Layers,
  AlertTriangle, Clock, Users, Building2, Building, CreditCard,
  UserCircle, ShieldCheck, Settings, Megaphone, Send, CheckCheck,
  CheckCircle2, AlertCircle, MailX, XCircle, Pause,
} from 'lucide-react';
import moment from 'moment';

export const NOTIFICATION_CATEGORIES = [
  { key: 'transactional', label: 'Transactional', icon: 'Mail', color: 'text-ice-600', bg: 'bg-ice-100', description: 'Order confirmations, receipts, account actions' },
  { key: 'marketing', label: 'Marketing', icon: 'Megaphone', color: 'text-flame-600', bg: 'bg-flame-100', description: 'Promotional campaigns and offers' },
  { key: 'system', label: 'System', icon: 'Settings', color: 'text-brand-600', bg: 'bg-brand-100', description: 'Platform updates and maintenance' },
  { key: 'alert', label: 'Alert', icon: 'AlertTriangle', color: 'text-error', bg: 'bg-red-100', description: 'Urgent alerts and warnings' },
  { key: 'reminder', label: 'Reminder', icon: 'Clock', color: 'text-warning', bg: 'bg-amber-100', description: 'Appointment and deadline reminders' },
  { key: 'verification', label: 'Verification', icon: 'ShieldCheck', color: 'text-info', bg: 'bg-blue-100', description: 'OTP and account verification' },
  { key: 'crm', label: 'CRM', icon: 'Users', color: 'text-purple-600', bg: 'bg-purple-100', description: 'Lead and customer activity' },
  { key: 'property', label: 'Property', icon: 'Building2', color: 'text-ice-700', bg: 'bg-ice-200', description: 'Property listing updates' },
  { key: 'project', label: 'Project', icon: 'Building', color: 'text-brand-700', bg: 'bg-brand-200', description: 'Project and estate updates' },
  { key: 'payment', label: 'Payment', icon: 'CreditCard', color: 'text-success', bg: 'bg-green-100', description: 'Payment confirmations' },
  { key: 'account', label: 'Account', icon: 'UserCircle', color: 'text-brand-600', bg: 'bg-brand-100', description: 'Account activity and security' },
];

export const CHANNEL_TYPES = [
  { key: 'email', label: 'Email', icon: 'Mail', color: 'text-ice-600', description: 'Transactional and marketing email' },
  { key: 'sms', label: 'SMS', icon: 'Smartphone', color: 'text-success', description: 'Text messages and OTP' },
  { key: 'push', label: 'Push', icon: 'Bell', color: 'text-flame-600', description: 'Mobile and web push notifications' },
  { key: 'in_app', label: 'In-App', icon: 'MessageSquare', color: 'text-brand-600', description: 'In-app notification centre' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', color: 'text-green-600', description: 'WhatsApp Business messaging' },
  { key: 'multi_channel', label: 'Multi-Channel', icon: 'Layers', color: 'text-purple-600', description: 'Multiple channels simultaneously' },
];

export const NOTIFICATION_STATUS = {
  queued: { label: 'Queued', color: 'text-muted-foreground', bg: 'bg-muted', icon: 'Clock' },
  sent: { label: 'Sent', color: 'text-info', bg: 'bg-blue-100', icon: 'Send' },
  delivered: { label: 'Delivered', color: 'text-ice-600', bg: 'bg-ice-100', icon: 'CheckCheck' },
  read: { label: 'Read', color: 'text-flame-600', bg: 'bg-flame-100', icon: 'CheckCheck' },
  failed: { label: 'Failed', color: 'text-error', bg: 'bg-red-100', icon: 'AlertCircle' },
  bounced: { label: 'Bounced', color: 'text-error', bg: 'bg-red-100', icon: 'MailX' },
  suppressed: { label: 'Suppressed', color: 'text-muted-foreground', bg: 'bg-muted', icon: 'Pause' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted', icon: 'XCircle' },
};

export const CAMPAIGN_STATUS = {
  draft: { label: 'Draft', color: 'text-muted-foreground', bg: 'bg-muted', icon: 'Edit3' },
  scheduled: { label: 'Scheduled', color: 'text-info', bg: 'bg-blue-100', icon: 'Clock' },
  sending: { label: 'Sending', color: 'text-warning', bg: 'bg-amber-100', icon: 'Send' },
  sent: { label: 'Sent', color: 'text-success', bg: 'bg-green-100', icon: 'CheckCircle2' },
  paused: { label: 'Paused', color: 'text-warning', bg: 'bg-amber-100', icon: 'Pause' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted', icon: 'XCircle' },
  failed: { label: 'Failed', color: 'text-error', bg: 'bg-red-100', icon: 'AlertCircle' },
};

export const DND_STATUS = {
  full_dnd: { label: 'Full DND', color: 'text-error', bg: 'bg-red-100', description: 'All marketing blocked' },
  partial_dnd: { label: 'Partial DND', color: 'text-warning', bg: 'bg-amber-100', description: 'Some categories blocked' },
  not_registered: { label: 'Not on DND', color: 'text-success', bg: 'bg-green-100', description: 'Can receive all messages' },
  unknown: { label: 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted', description: 'Status not yet checked' },
};

export const PRIORITY_LEVELS = [
  { key: 'low', label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-muted' },
  { key: 'normal', label: 'Normal', color: 'text-ice-600', bg: 'bg-ice-100', border: 'border-ice-200' },
  { key: 'high', label: 'High', color: 'text-warning', bg: 'bg-amber-100', border: 'border-amber-200' },
  { key: 'urgent', label: 'Urgent', color: 'text-error', bg: 'bg-red-100', border: 'border-red-200' },
];

export const DIGEST_FREQUENCIES = [
  { key: 'hourly', label: 'Hourly', description: 'Every hour' },
  { key: 'daily', label: 'Daily', description: 'Once per day' },
  { key: 'weekly', label: 'Weekly', description: 'Once per week' },
];

export function formatTemplateBody(template, variables = {}) {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

export function extractTemplateVariables(template) {
  if (!template) return [];
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const m = moment(dateString);
  const now = moment();
  const diffMinutes = now.diff(m, 'minutes');
  const diffHours = now.diff(m, 'hours');
  const diffDays = now.diff(m, 'days');

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return `Yesterday at ${m.format('HH:mm')}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return m.format('MMM D, YYYY');
}

export function formatDeliveryRate(sent, delivered) {
  if (!sent || sent === 0) return '0.0%';
  return ((delivered / sent) * 100).toFixed(1) + '%';
}

export function getNotificationIcon(category) {
  const map = {
    transactional: 'Mail',
    marketing: 'Megaphone',
    system: 'Settings',
    alert: 'AlertTriangle',
    reminder: 'Clock',
    verification: 'ShieldCheck',
    crm: 'Users',
    property: 'Building2',
    project: 'Building',
    payment: 'CreditCard',
    account: 'UserCircle',
  };
  return map[category] || 'Bell';
}

export function truncateBody(body, maxLength = 120) {
  if (!body) return '';
  if (body.length <= maxLength) return body;
  return body.substring(0, maxLength).trim() + '...';
}

export function groupNotificationsByDate(notifications) {
  const groups = { Today: [], Yesterday: [], 'This Week': [], 'This Month': [], Earlier: [] };
  const now = moment();
  (notifications || []).forEach((n) => {
    const date = moment(n.created_date || n.sent_at);
    if (now.isSame(date, 'day')) groups.Today.push(n);
    else if (now.diff(date, 'days') === 1) groups.Yesterday.push(n);
    else if (now.diff(date, 'days') < 7) groups['This Week'].push(n);
    else if (now.isSame(date, 'month')) groups['This Month'].push(n);
    else groups.Earlier.push(n);
  });
  return groups;
}

export function filterNotificationsByCategory(notifications, categories) {
  if (!categories || categories.length === 0) return notifications;
  return (notifications || []).filter((n) => categories.includes(n.category));
}

export function calculateCampaignMetrics(campaign) {
  const sent = campaign?.sent_count || 0;
  const delivered = campaign?.delivered_count || 0;
  const read = campaign?.read_count || 0;
  const bounced = campaign?.bounced_count || 0;
  const optedOut = campaign?.opted_out_count || 0;
  return {
    deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0.0',
    openRate: delivered > 0 ? ((read / delivered) * 100).toFixed(1) : '0.0',
    bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(1) : '0.0',
    optOutRate: sent > 0 ? ((optedOut / sent) * 100).toFixed(1) : '0.0',
  };
}

export function getUnreadCount(notifications) {
  return (notifications || []).filter((n) => !n.is_read).length;
}

export function buildAudienceFilter(audienceType, audienceConfig = {}) {
  switch (audienceType) {
    case 'all_users':
      return {};
    case 'role_based':
      return { role: { $in: audienceConfig.roles || [] } };
    case 'filtered':
      return audienceConfig.filter || {};
    case 'segment':
      return audienceConfig.filter || {};
    default:
      return {};
  }
}

export function getSMSSegments(text) {
  if (!text) return { segments: 0, chars: 0, unicode: false };
  const hasUnicode = /[^\x00-\x7F]/.test(text);
  const segmentLength = hasUnicode ? 70 : 160;
  const segments = Math.ceil(text.length / segmentLength) || 1;
  return { segments, chars: text.length, unicode: hasUnicode };
}