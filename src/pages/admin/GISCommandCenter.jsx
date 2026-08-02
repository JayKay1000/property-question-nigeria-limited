import { useState } from 'react';
import { Map, BarChart3, Building2, Navigation, TrendingUp, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import GISExplorer from '@/components/admin/gis/GISExplorer';
import PropertyDistribution from '@/components/admin/gis/PropertyDistribution';
import EstateManagement from '@/components/admin/gis/EstateManagement';
import NavigationTools from '@/components/admin/gis/NavigationTools';
import LocationIntelligence from '@/components/admin/gis/LocationIntelligence';
import GISGovernance from '@/components/admin/gis/GISGovernance';

export default function GISCommandCenter() {
  const [tab, setTab] = useState('explorer');

  return (
    <div>
      <PageHeader
        title="National GIS Command Center"
        subtitle="Enterprise geographic intelligence, mapping, and location management for Property Question Nigeria Limited"
        icon={Map}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="explorer" className="gap-1.5"><Map className="h-4 w-4" /> Explorer</TabsTrigger>
          <TabsTrigger value="distribution" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Distribution</TabsTrigger>
          <TabsTrigger value="estates" className="gap-1.5"><Building2 className="h-4 w-4" /> Estates</TabsTrigger>
          <TabsTrigger value="navigation" className="gap-1.5"><Navigation className="h-4 w-4" /> Navigation</TabsTrigger>
          <TabsTrigger value="intelligence" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Intelligence</TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5"><ShieldCheck className="h-4 w-4" /> Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="explorer" className="mt-6"><GISExplorer /></TabsContent>
        <TabsContent value="distribution" className="mt-6"><PropertyDistribution /></TabsContent>
        <TabsContent value="estates" className="mt-6"><EstateManagement /></TabsContent>
        <TabsContent value="navigation" className="mt-6"><NavigationTools /></TabsContent>
        <TabsContent value="intelligence" className="mt-6"><LocationIntelligence /></TabsContent>
        <TabsContent value="governance" className="mt-6"><GISGovernance /></TabsContent>
      </Tabs>
    </div>
  );
}