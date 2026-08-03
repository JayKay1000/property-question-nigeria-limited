import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays } from 'lucide-react';
import SchedulingOverview from '@/components/admin/scheduling/SchedulingOverview';
import BookingManager from '@/components/admin/scheduling/BookingManager';
import AvailabilityManager from '@/components/admin/scheduling/AvailabilityManager';

export default function SchedulingCenter() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><CalendarDays className="w-7 h-7 text-flame-500" /> Scheduling & Booking Center</h1>
        <p className="text-muted-foreground">Manage bookings, availability slots, inspections, tours, and consultation scheduling.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><SchedulingOverview /></TabsContent>
        <TabsContent value="bookings"><BookingManager /></TabsContent>
        <TabsContent value="availability"><AvailabilityManager /></TabsContent>
      </Tabs>
    </div>
  );
}