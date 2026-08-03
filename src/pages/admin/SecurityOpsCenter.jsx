import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert } from 'lucide-react';
import SecurityOpsOverview from '@/components/admin/security/SecurityOpsOverview';
import VulnerabilityManager from '@/components/admin/security/VulnerabilityManager';
import PolicyManager from '@/components/admin/security/PolicyManager';

export default function SecurityOpsCenter() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-7 h-7 text-flame-500" /> Security Operations Center</h1>
        <p className="text-muted-foreground">Manage vulnerability reports, security policies, and compliance posture.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><SecurityOpsOverview /></TabsContent>
        <TabsContent value="vulnerabilities"><VulnerabilityManager /></TabsContent>
        <TabsContent value="policies"><PolicyManager /></TabsContent>
      </Tabs>
    </div>
  );
}