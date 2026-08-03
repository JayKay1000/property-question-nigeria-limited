import { useState } from 'react';
import { BarChart3, FileSearch, ShieldAlert, TrendingUp, Activity, Database, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import ExecutiveDashboard from '@/components/admin/intelligence/ExecutiveDashboard';
import AuditExplorer from '@/components/admin/intelligence/AuditExplorer';
import SecurityOpsCenter from '@/components/admin/intelligence/SecurityOpsCenter';
import BusinessIntelligenceHub from '@/components/admin/intelligence/BusinessIntelligenceHub';
import SystemMonitoringConsole from '@/components/admin/intelligence/SystemMonitoringConsole';
import DataGovernanceCenter from '@/components/admin/intelligence/DataGovernanceCenter';
import AIInsightsCenter from '@/components/admin/intelligence/AIInsightsCenter';

export default function OperationsIntelligenceCenter() {
  const [tab, setTab] = useState('executive');

  return (
    <div>
      <PageHeader
        title="Enterprise Operations Intelligence Center"
        subtitle="Audit, analytics, BI, system monitoring, security operations, data governance, and AI insights — the enterprise intelligence backbone"
        icon={BarChart3}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="executive" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Executive</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5"><FileSearch className="h-4 w-4" /> Audit</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><ShieldAlert className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="bi" className="gap-1.5"><TrendingUp className="h-4 w-4" /> BI Hub</TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-1.5"><Activity className="h-4 w-4" /> Monitoring</TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5"><Database className="h-4 w-4" /> Governance</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5"><Brain className="h-4 w-4" /> AI Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="executive" className="mt-6"><ExecutiveDashboard /></TabsContent>
        <TabsContent value="audit" className="mt-6"><AuditExplorer /></TabsContent>
        <TabsContent value="security" className="mt-6"><SecurityOpsCenter /></TabsContent>
        <TabsContent value="bi" className="mt-6"><BusinessIntelligenceHub /></TabsContent>
        <TabsContent value="monitoring" className="mt-6"><SystemMonitoringConsole /></TabsContent>
        <TabsContent value="governance" className="mt-6"><DataGovernanceCenter /></TabsContent>
        <TabsContent value="ai" className="mt-6"><AIInsightsCenter /></TabsContent>
      </Tabs>
    </div>
  );
}