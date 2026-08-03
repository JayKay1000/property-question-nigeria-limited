import { Link } from 'react-router-dom';
import { Heart, MessageSquare, CalendarCheck, Bell, FileText, Home, Search, TrendingUp, ArrowRight, User } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPrice } from '@/lib/property-utils';

export default function PortalOverview({ customer, savedProps, enquiries, inspections, notifications, timeline }) {
  const upcomingInspections = inspections.filter((i) => ['pending', 'confirmed'].includes(i.status)).slice(0, 3);
  const recentEnquiries = enquiries.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Welcome back, {customer?.first_name || customer?.full_name?.split(' ')[0] || 'there'}!</h1>
            <p className="mt-1 text-white/70">Manage your properties, enquiries, and inspections all in one place.</p>
            {customer?.assigned_agent_name && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                <User className="h-4 w-4 text-flame-400" />
                <span className="text-sm text-white/80">Your Agent: <span className="font-semibold text-white">{customer.assigned_agent_name}</span></span>
              </div>
            )}
          </div>
          <Link to="/properties" className="flex items-center gap-2 rounded-lg bg-flame-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-flame-600">
            <Search className="h-4 w-4" /> Browse Properties
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Heart} label="Saved Properties" value={savedProps.length} color="text-error" />
        <StatCard icon={MessageSquare} label="Active Enquiries" value={enquiries.filter((e) => !['closed_won', 'closed_lost'].includes(e.status)).length} color="text-info" />
        <StatCard icon={CalendarCheck} label="Upcoming Inspections" value={upcomingInspections.length} color="text-success" />
        <StatCard icon={Bell} label="Unread Notifications" value={notifications.filter((n) => !n.read_status).length} color="text-flame-500" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction to="/properties" icon={Home} label="Find Properties" />
        <QuickAction to="/projects" icon={TrendingUp} label="Explore Projects" />
        <QuickAction to="/gis" icon={Search} label="Map Search" />
        <QuickAction to="/submit" icon={FileText} label="Submit Property" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming inspections */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-brand-900">Upcoming Inspections</h3>
            <Link to="/portal?section=inspections" className="text-xs text-flame-600 hover:underline">View all</Link>
          </div>
          {upcomingInspections.length > 0 ? (
            <div className="space-y-3">
              {upcomingInspections.map((ins) => (
                <div key={ins.id} className="flex items-center gap-3 rounded-lg border border-brand-100 bg-ice-50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flame-50 text-flame-600"><CalendarCheck className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-900">{ins.property_title || 'Property Inspection'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ins.confirmed_date || ins.requested_date).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })} at {ins.confirmed_time || ins.requested_time || 'TBD'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ins.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{ins.status === 'confirmed' ? 'Confirmed' : 'Pending'}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarCheck} text="No upcoming inspections" action={{ to: '/properties', label: 'Book Inspection' }} />
          )}
        </div>

        {/* Recent enquiries */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-brand-900">Recent Enquiries</h3>
            <Link to="/portal?section=enquiries" className="text-xs text-flame-600 hover:underline">View all</Link>
          </div>
          {recentEnquiries.length > 0 ? (
            <div className="space-y-3">
              {recentEnquiries.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border border-brand-100 bg-ice-50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"><MessageSquare className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-900">{e.property_title || 'Enquiry'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.created_date).toLocaleDateString('en-NG')}</p>
                  </div>
                  <span className="capitalize text-xs font-medium text-brand-700">{e.status?.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={MessageSquare} text="No enquiries yet" action={{ to: '/properties', label: 'Browse Properties' }} />
          )}
        </div>

        {/* Recent notifications */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-brand-900">Latest Notifications</h3>
            <Link to="/portal?section=notifications" className="text-xs text-flame-600 hover:underline">View all</Link>
          </div>
          {recentNotifications.length > 0 ? (
            <div className="space-y-2.5">
              {recentNotifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 rounded-lg p-2.5 ${n.read_status ? 'bg-ice-50' : 'bg-flame-50/50'}`}>
                  <Bell className={`mt-0.5 h-4 w-4 shrink-0 ${n.read_status ? 'text-muted-foreground' : 'text-flame-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-900">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Bell} text="No notifications" />
          )}
        </div>

        {/* Activity timeline */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-heading text-base font-bold text-brand-900">Recent Activity</h3>
          {timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-start gap-3 border-l-2 border-brand-100 pl-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-900">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('en-NG')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} text="No activity yet" />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-ice-50 p-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-2 font-heading text-2xl font-bold text-brand-900">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-brand-100 bg-white p-4 transition hover:border-flame-200 hover:shadow-card">
      <Icon className="h-5 w-5 text-flame-500" />
      <span className="text-xs font-medium text-brand-900">{label}</span>
    </Link>
  );
}

function EmptyState({ icon: Icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="h-8 w-8 text-brand-200" />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {action && <Link to={action.to} className="mt-3 text-xs font-semibold text-flame-600 hover:underline">{action.label} <ArrowRight className="inline h-3 w-3" /></Link>}
    </div>
  );
}