import { useState } from 'react';
import { Building2, Image, FileText, TrendingUp, HeartPulse, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import PropertyExplorer from '@/components/admin/property/PropertyExplorer';
import MediaManager from '@/components/admin/property/MediaManager';
import DocumentVault from '@/components/admin/property/DocumentVault';
import PricingIntelligence from '@/components/admin/property/PricingIntelligence';
import PropertyHealthDashboard from '@/components/admin/property/PropertyHealthDashboard';
import PortfolioAnalytics from '@/components/admin/property/PortfolioAnalytics';

export default function PropertyIntelligence() {
  const [tab, setTab] = useState('explorer');

  return (
    <div>
      <PageHeader
        title="Property Intelligence Center"
        subtitle="Central operational hub for managing, monitoring, and optimizing the entire property portfolio"
        icon={Building2}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="explorer" className="gap-1.5"><Building2 className="h-4 w-4" /> Explorer</TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5"><Image className="h-4 w-4" /> Media</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Pricing</TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5"><HeartPulse className="h-4 w-4" /> Health</TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Portfolio</TabsTrigger>
        </TabsList>
        <TabsContent value="explorer" className="mt-6"><PropertyExplorer /></TabsContent>
        <TabsContent value="media" className="mt-6"><MediaManager /></TabsContent>
        <TabsContent value="documents" className="mt-6"><DocumentVault /></TabsContent>
        <TabsContent value="pricing" className="mt-6"><PricingIntelligence /></TabsContent>
        <TabsContent value="health" className="mt-6"><PropertyHealthDashboard /></TabsContent>
        <TabsContent value="portfolio" className="mt-6"><PortfolioAnalytics /></TabsContent>
      </Tabs>
    </div>
  );
}