import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarCheck, Clock, Users, TrendingUp, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { bookingStatusConfig, bookingTypeLabels, slotStatusConfig, resourceTypeLabels, formatNumber, formatDateTime } from '@/lib/platform-utils';

export default function SchedulingOverview() {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [b, s] = await Promise.all([
          base44.entities.Booking.list('-created_date', 100),
          base44.entities.BookingSlot.list('-created_date', 100),
        ]);
        setBookings(b); setSlots(s);
      } catch { /* */ }
      setLoading(false);
    })();
  }, []);

  const pending = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter(b => b.start_time && b.start_time.slice(0, 10) === today).length;
  const availableSlots = slots.filter(s => s.status === 'available').length;
  const totalCapacity = slots.reduce((s, x) => s + (x.capacity || 0), 0);
  const totalBooked = slots.reduce((s, x) => s + (x.booked_count || 0), 0);
  const occupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/15' },
    { label: 'Confirmed', value: confirmed, icon: CalendarCheck, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Completed', value: completed, icon: CalendarCheck, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Today', value: todayBookings, icon: Calendar, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Available Slots', value: availableSlots, icon: Users, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Slot Occupancy', value: `${occupancy}%`, icon: TrendingUp, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Total Slots', value: slots.length, icon: Clock, color: 'text-ice-600', bg: 'bg-ice-50' },
  ];

  const upcoming = [...bookings].filter(b => b.status === 'pending' || b.status === 'confirmed').sort((a, b) => new Date(a.start_time || 0) - new Date(b.start_time || 0)).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            <p className="text-xl font-heading font-bold">{loading ? '…' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4">Upcoming Bookings</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && upcoming.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming bookings.</p>}
            {!loading && upcoming.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{bookingTypeLabels[b.booking_type]} · {b.resource_name || resourceTypeLabels[b.resource_type]}{b.location ? ` · ` : ''}{b.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{b.location}</span>}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className={bookingStatusConfig[b.status]?.className || ''}>{bookingStatusConfig[b.status]?.label || b.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(b.start_time)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4">Slot Availability</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && slots.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No slots configured.</p>}
            {!loading && slots.slice(0, 6).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.title || `${resourceTypeLabels[s.resource_type]} slot`}</p>
                  <p className="text-xs text-muted-foreground">{s.resource_name || 'General'} · {formatDateTime(s.start_time)}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className={slotStatusConfig[s.status]?.className || ''}>{slotStatusConfig[s.status]?.label || s.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{s.booked_count || 0}/{s.capacity || 1}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}