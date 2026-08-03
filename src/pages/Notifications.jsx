import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationList from '@/components/notifications/NotificationList';
import { Bell } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function Notifications() {
  const { notifications, loading, markAsRead, markAllAsRead, archiveNotification } = useNotifications();

  return (
    <div className="min-h-screen bg-ice-50/40 pt-20 pb-16">
      <div className="container-wide section-pad max-w-4xl">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated on your properties, enquiries, inspections, and account activity"
          icon={Bell}
        />
        <div className="mt-6 rounded-3xl border bg-white p-5 shadow-card sm:p-8">
          <NotificationList
            notifications={notifications}
            loading={loading}
            onMarkRead={markAsRead}
            onArchive={archiveNotification}
            onMarkAll={markAllAsRead}
          />
        </div>
      </div>
    </div>
  );
}