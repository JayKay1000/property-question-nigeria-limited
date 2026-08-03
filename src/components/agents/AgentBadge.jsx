import { BadgeCheck, Star } from 'lucide-react';

export default function AgentBadge({ agent, size = 'sm', showLabel = true }) {
  const isVerified = agent?.verification_status === 'verified' || agent?.status === 'verified' || agent?.status === 'active';

  if (!isVerified) return null;

  const sizes = {
    xs: { icon: 'h-3 w-3', text: 'text-[10px]', gap: 'gap-0.5' },
    sm: { icon: 'h-3.5 w-3.5', text: 'text-xs', gap: 'gap-1' },
    md: { icon: 'h-4 w-4', text: 'text-sm', gap: 'gap-1' },
    lg: { icon: 'h-5 w-5', text: 'text-base', gap: 'gap-1.5' },
  };
  const s = sizes[size] || sizes.sm;

  return (
    <span className={`inline-flex items-center ${s.gap} rounded-full bg-info/10 px-2 py-0.5 font-semibold text-info ${s.text}`}>
      <BadgeCheck className={s.icon} />
      {showLabel && 'Verified Agent'}
    </span>
  );
}