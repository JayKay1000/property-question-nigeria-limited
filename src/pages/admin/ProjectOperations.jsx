import { useState } from 'react';
import { Briefcase, Grid3x3, HardHat, FileCheck, TrendingUp, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import PortfolioDashboard from '@/components/admin/projects/PortfolioDashboard';
import PlotManager from '@/components/admin/projects/PlotManager';
import InfrastructureMonitor from '@/components/admin/projects/InfrastructureMonitor';
import AllocationConsole from '@/components/admin/projects/AllocationConsole';
import ProjectForecasting from '@/components/admin/projects/ProjectForecasting';
import ProjectGovernance from '@/components/admin/projects/ProjectGovernance';

export default function ProjectOperations() {
  const [tab, setTab] = useState('portfolio');

  return (
    <div>
      <PageHeader
        title="Project Operations Command Center"
        subtitle="Enterprise estate development, plot inventory, infrastructure, and allocation management"
        icon={Briefcase}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="portfolio" className="gap-1.5"><Briefcase className="h-4 w-4" /> Portfolio</TabsTrigger>
          <TabsTrigger value="plots" className="gap-1.5"><Grid3x3 className="h-4 w-4" /> Plots</TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-1.5"><HardHat className="h-4 w-4" /> Infrastructure</TabsTrigger>
          <TabsTrigger value="allocation" className="gap-1.5"><FileCheck className="h-4 w-4" /> Allocation</TabsTrigger>
          <TabsTrigger value="forecasting" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Analytics</TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5"><ShieldCheck className="h-4 w-4" /> Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="portfolio" className="mt-6"><PortfolioDashboard /></TabsContent>
        <TabsContent value="plots" className="mt-6"><PlotManager /></TabsContent>
        <TabsContent value="infrastructure" className="mt-6"><InfrastructureMonitor /></TabsContent>
        <TabsContent value="allocation" className="mt-6"><AllocationConsole /></TabsContent>
        <TabsContent value="forecasting" className="mt-6"><ProjectForecasting /></TabsContent>
        <TabsContent value="governance" className="mt-6"><ProjectGovernance /></TabsContent>
      </Tabs>
    </div>
  );
}