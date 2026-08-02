import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const badgeSizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

const dotSizeMap = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4',
};

export default function EntityAvatar({ src, name, size = 'md', verified, status, className }) {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={sizeMap[size]}>
        {src && <AvatarImage src={src} alt={name} />}
        <AvatarFallback className="bg-brand-100 font-semibold text-brand-700">
          {initials}
        </AvatarFallback>
      </Avatar>

      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white">
          <BadgeCheck className={cn('text-flame-500', badgeSizeMap[size])} />
        </span>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            dotSizeMap[size],
            status === 'online' ? 'bg-success' : status === 'away' ? 'bg-warning' : 'bg-muted',
          )}
        />
      )}
    </div>
  );
}