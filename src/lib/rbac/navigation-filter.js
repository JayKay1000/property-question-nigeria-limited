/**
 * Navigation Filtering
 *
 * Filters navigation items so users only see items they are authorized
 * to access. Used by admin sidebars, portal menus, and dashboard nav.
 */
import { useRBAC } from './useRBAC';

/**
 * Filter an array of nav items by the user's permissions.
 * Items without a `permission` field are always shown.
 */
export function filterNavByPermission(navItems, rbac) {
  return navItems.filter((item) => {
    if (!item.permission) return true;
    return rbac.hasPermission(item.permission);
  });
}

/**
 * React hook — returns filtered nav items for the current user.
 */
export function useFilteredNav(navItems) {
  const rbac = useRBAC();
  return filterNavByPermission(navItems, rbac);
}