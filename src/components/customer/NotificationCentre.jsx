import { useState } from 'react';
import { Bell, Check, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationCentre({ notifications, onRefresh }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');

  const markRead = async (id) => {
    try {
      await base44.entities.Notification.update(id, { read_status: true, read_at: new Date().toISOString() });
      onRefresh?.();
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read_status);
    if (unread.length === 0) return;
    try {
      await base44.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, read_status: true, read_at: new Date().toISOString() })));
      onRefresh?.();
      toast({ title: 'All notifications marked as read' });
    } catch { /* silent */ }
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter((n) => !n.read_status) : notifications.filter((n) => n.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-brand-900">Notifications</h2>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-36 border-brand-200 bg-white text-sm"><Filter className="mr-1.5 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="property">Properties</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={markAllRead} className="border-brand-200">
            <Check className="mr-1.5 h-3.5 w-3.5" /> Mark All Read
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 rounded-xl border p-4 transition ${n.read_status ? 'border-brand-100 bg-white' : 'border-flame-200 bg-flame-50/50'}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${n.read_status ? 'bg-ice-50 text-muted-foreground' : 'bg-flame-100 text-flame-600'}`}>
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-brand-900">{n.title}</h3>
                  {!n.read_status && <span className="h-2 w-2 shrink-0 rounded-full bg-flame-500" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{new Date(n.created_date).toLocaleString('en-NG')}</span>
                  {n.category && <Badge variant="secondary" className="bg-ice-100 text-xs text-brand-700 capitalize">{n.category}</Badge>}
                  {!n.read_status && (
                    <button onClick={() => markRead(n.id)} className="text-xs font-medium text-flame-600 hover:underline">Mark as read</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <Bell className="h-12 w-12 text-brand-200" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Notifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">You're all caught up! New notifications will appear here.</p>
        </div>
      )}
    </div>
  );
}