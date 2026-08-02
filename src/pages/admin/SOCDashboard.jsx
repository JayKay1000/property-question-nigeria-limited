import { useState } from 'react';
import { ShieldAlert, Activity, HeartPulse, FileCheck, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import SecurityOverview from '@/components/admin/soc/SecurityOverview';
import SystemHealth from '@/components/admin/soc/SystemHealth';
import ComplianceMonitor from '@/components/admin/soc/ComplianceMonitor';
import OperationalTools from '@/components/admin/soc/OperationalTools';

export default function SOCDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div>
      <PageHeader
        title="Security Operations Center"
        subtitle="Real-time monitoring, governance, and compliance for the Property Question Nigeria platform"
        icon={ShieldAlert}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5"><HeartPulse className="h-4 w-4" /> Health</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1.5"><FileCheck className="h-4 w-4" /> Compliance</TabsTrigger>
          <TabsTrigger value="operations" className="gap-1.5"><Wrench className="h-4 w-4" /> Operations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6"><SecurityOverview /></TabsContent>
        <TabsContent value="health" className="mt-6"><SystemHealth /></TabsContent>
        <TabsContent value="compliance" className="mt-6"><ComplianceMonitor /></TabsContent>
        <TabsContent value="operations" className="mt-6"><OperationalTools /></TabsContent>
      </Tabs>
    </div>
  );
}