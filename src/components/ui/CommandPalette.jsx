import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, LayoutDashboard } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { dashboardNav } from '@/lib/dashboard-nav';
import { getDashboardConfig } from '@/lib/role-dashboard-config';

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const rbac = useRBAC();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const go = (path) => {
    navigate(path);
    onOpenChange(false);
  };

  const navItems = dashboardNav.filter(
    item => !item.permission || rbac.hasPermission(item.permission)
  );

  const config = getDashboardConfig(rbac.role);
  const quickActions = config.quickActions || [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or type a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => go('/')}>
            <Globe className="mr-2 h-4 w-4" />
            Public Website
          </CommandItem>
          <CommandItem onSelect={() => go('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard Home
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Modules">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {quickActions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <CommandItem key={i} onSelect={() => go(action.href)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}