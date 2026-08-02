import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { dashboardNav } from '@/lib/dashboard-nav';

export default function ModulePlaceholder() {
  const { pathname } = useLocation();
  const navItem =
    [...dashboardNav].sort((a, b) => b.href.length - a.href.length).find(item => pathname.startsWith(item.href));
  const title = navItem?.label || 'This Module';

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-flame-50 text-flame-500">
        <Construction className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-xl font-heading font-bold text-brand-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        This module is being prepared and will be available soon. You'll be able to manage{' '}
        {title.toLowerCase()} from here.
      </p>
    </div>
  );
}