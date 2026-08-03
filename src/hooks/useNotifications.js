import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getUnreadCount } from '@/lib/notification-utils';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const items = await base44.entities.NotificationLog.filter(
        { recipient_user_id: me.id, is_archived: false },
        '-created_date',
        30
      );
      setNotifications(items || []);
      setUnreadCount(getUnreadCount(items || []));
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = base44.entities.NotificationLog.subscribe((event) => {
      if (event.type === 'create') {
        setNotifications((prev) => [event.data, ...prev]);
        setUnreadCount((prev) => prev + 1);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(event.data.subject || 'New notification', {
            body: event.data.body || '',
          });
        }
      }
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await base44.entities.NotificationLog.update(id, {
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read',
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    const updates = unread.map((n) => ({ id: n.id, is_read: true, read_at: new Date().toISOString(), status: 'read' }));
    try {
      await base44.entities.NotificationLog.bulkUpdate(updates);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [notifications]);

  const archiveNotification = useCallback(async (id) => {
    try {
      await base44.entities.NotificationLog.update(id, { is_archived: true });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const archived = notifications.find((n) => n.id === id);
      if (archived && !archived.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  }, [notifications]);

  return { notifications, unreadCount, loading, user, markAsRead, markAllAsRead, archiveNotification, refresh: fetchNotifications };
}