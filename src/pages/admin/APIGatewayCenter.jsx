import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plug } from 'lucide-react';
import APIOverview from '@/components/admin/api/APIOverview';
import EndpointManager from '@/components/admin/api/EndpointManager';
import IntegrationManager from '@/components/admin/api/IntegrationManager';

export default function APIGatewayCenter() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><Plug className="w-7 h-7 text-flame-500" /> API Gateway & Integrations Center</h1>
        <p className="text-muted-foreground">Manage API endpoints, third-party integrations, request traffic, and connection health.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><APIOverview /></TabsContent>
        <TabsContent value="endpoints"><EndpointManager /></TabsContent>
        <TabsContent value="integrations"><IntegrationManager /></TabsContent>
      </Tabs>
    </div>
  );
}