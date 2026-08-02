import { useState } from 'react';
import { Users, TrendingUp, Clock, Megaphone, Headphones, BarChart3, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import Customer360 from '@/components/admin/crm/Customer360';
import SalesPipelineManager from '@/components/admin/crm/SalesPipelineManager';
import ActivityTimeline from '@/components/admin/crm/ActivityTimeline';
import MarketingIntelligence from '@/components/admin/crm/MarketingIntelligence';
import ServiceConsole from '@/components/admin/crm/ServiceConsole';
import ExecutiveAnalytics from '@/components/admin/crm/ExecutiveAnalytics';
import CRMGovernance from '@/components/admin/crm/CRMGovernance';

export default function CRMOperations() {
  const [tab, setTab] = useState('customers');

  return (
    <div>
      <PageHeader
        title="CRM Operations Command Center"
        subtitle="360° customer intelligence — leads, opportunities, pipeline, marketing, service, and analytics"
        icon={Users}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="customers" className="gap-1.5"><Users className="h-4 w-4" /> Customers</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Pipeline</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5"><Clock className="h-4 w-4" /> Activities</TabsTrigger>
          <TabsTrigger value="marketing" className="gap-1.5"><Megaphone className="h-4 w-4" /> Marketing</TabsTrigger>
          <TabsTrigger value="service" className="gap-1.5"><Headphones className="h-4 w-4" /> Service</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5"><ShieldCheck className="h-4 w-4" /> Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="customers" className="mt-6"><Customer360 /></TabsContent>
        <TabsContent value="pipeline" className="mt-6"><SalesPipelineManager /></TabsContent>
        <TabsContent value="timeline" className="mt-6"><ActivityTimeline /></TabsContent>
        <TabsContent value="marketing" className="mt-6"><MarketingIntelligence /></TabsContent>
        <TabsContent value="service" className="mt-6"><ServiceConsole /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><ExecutiveAnalytics /></TabsContent>
        <TabsContent value="governance" className="mt-6"><CRMGovernance /></TabsContent>
      </Tabs>
    </div>
  );
}