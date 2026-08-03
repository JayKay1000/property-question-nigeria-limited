import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Search, FileCode2, GitFork, Link2, Rocket } from 'lucide-react';
import MarketingOverview from '@/components/admin/marketing/MarketingOverview';
import KeywordManager from '@/components/admin/marketing/KeywordManager';
import TechnicalSEOPanel from '@/components/admin/marketing/TechnicalSEOPanel';
import RedirectManager from '@/components/admin/marketing/RedirectManager';
import InternalLinkManager from '@/components/admin/marketing/InternalLinkManager';
import UTMCampaignManager from '@/components/admin/marketing/UTMCampaignManager';

export default function MarketingCenter() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><Megaphone className="w-7 h-7 text-flame-500" /> SEO & Digital Marketing Center</h1>
        <p className="text-muted-foreground">Manage technical SEO, keyword tracking, URL redirects, internal linking, and UTM campaign performance.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
          <TabsTrigger value="links">Internal Links</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><MarketingOverview /></TabsContent>
        <TabsContent value="keywords"><KeywordManager /></TabsContent>
        <TabsContent value="technical"><TechnicalSEOPanel /></TabsContent>
        <TabsContent value="redirects"><RedirectManager /></TabsContent>
        <TabsContent value="links"><InternalLinkManager /></TabsContent>
        <TabsContent value="campaigns"><UTMCampaignManager /></TabsContent>
      </Tabs>
    </div>
  );
}