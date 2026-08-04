import { useRBAC } from '@/lib/rbac/useRBAC';
import { getDashboardConfig } from '@/lib/role-dashboard-config';
import StatCard from '@/components/dashboard/widgets/StatCard';
import WelcomeBanner from '@/components/dashboard/widgets/WelcomeBanner';
import ActivityTimeline from '@/components/dashboard/widgets/ActivityTimeline';
import QuickActions from '@/components/dashboard/widgets/QuickActions';
import NotificationList from '@/components/dashboard/widgets/NotificationList';
import ListerDashboard from '@/components/dashboard/ListerDashboard';

export default function DashboardHome() {
  const rbac = useRBAC();
  const accountType = rbac.user?.account_type;

  // Agents, property owners and corporate clients get a personalised
  // listing-focused dashboard. Everyone else gets the role-config view.
  const isLister = accountType === 'agent' || accountType === 'owner' || accountType === 'corporate' || rbac.isAgent;
  if (isLister) return <ListerDashboard />;

  const config = getDashboardConfig(rbac.role);

  const verificationStatus =
    rbac.user?.agent_verification_status ||
    (rbac.role === 'prospective_agent' ? 'pending' : 'verified');

  return (
    <div className="space-y-6">
      <WelcomeBanner user={rbac.user} role={rbac.role} verificationStatus={verificationStatus} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline activities={config.activities} />
        </div>
        <div className="space-y-6">
          <QuickActions actions={config.quickActions} />
          <NotificationList />
        </div>
      </div>
    </div>
  );
}