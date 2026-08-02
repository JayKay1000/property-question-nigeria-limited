import { cn } from '@/lib/utils';
import {
  BadgeCheck, Clock, CheckCircle, XCircle, Lock,
  Star, Sparkles, Flame, Crown, FileText, Check,
} from 'lucide-react';

const statusConfig = {
  verified:   { label: 'Verified',   icon: BadgeCheck,  className: 'bg-success/10 text-success border-success/20' },
  pending:    { label: 'Pending',    icon: Clock,       className: 'bg-warning/10 text-warning border-warning/20' },
  approved:   { label: 'Approved',   icon: CheckCircle,  className: 'bg-success/10 text-success border-success/20' },
  rejected:   { label: 'Rejected',   icon: XCircle,     className: 'bg-error/10 text-error border-error/20' },
  sold:       { label: 'Sold',       icon: Check,        className: 'bg-error/10 text-error border-error/20' },
  available:  { label: 'Available',  icon: CheckCircle,  className: 'bg-success/10 text-success border-success/20' },
  reserved:   { label: 'Reserved',   icon: Lock,         className: 'bg-warning/10 text-warning border-warning/20' },
  featured:   { label: 'Featured',   icon: Star,         className: 'bg-flame-50 text-flame-600 border-flame-200' },
  new:        { label: 'New',        icon: Sparkles,     className: 'bg-info/10 text-info border-info/20' },
  hot_deal:   { label: 'Hot Deal',   icon: Flame,        className: 'bg-error/10 text-error border-error/20' },
  premium:    { label: 'Premium',    icon: Crown,        className: 'bg-brand-50 text-brand-700 border-brand-200' },
  draft:      { label: 'Draft',      icon: FileText,     className: 'bg-muted text-muted-foreground border-border' },
};

const sizeMap = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-xs', icon: 'h-3.5 w-3.5' },
  lg: { badge: 'px-3 py-1.5 text-sm', icon: 'h-4 w-4' },
};

export default function StatusBadge({ status, label, size = 'sm', icon: CustomIcon, className }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = CustomIcon || config.icon;
  const sz = sizeMap[size] || sizeMap.sm;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.className,
        sz.badge,
        className,
      )}
    >
      <Icon className={sz.icon} />
      {label || config.label}
    </span>
  );
}