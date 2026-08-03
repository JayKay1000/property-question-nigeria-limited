import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Activity, Rocket } from 'lucide-react';
import ModuleHealthGrid from '@/components/admin/unified/ModuleHealthGrid';
import SystemVitals from '@/components/admin/unified/SystemVitals';
import QuickActionLauncher from '@/components/admin/unified/QuickActionLauncher';

export default function UnifiedCommandCenter() {
  const [tab, setTab] = useState('modules');
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><LayoutGrid className="w-7 h-7 text-flame-500" /> Unified Admin Command Center</h1>
        <p className="text-muted-foreground">The platform control plane — monitor every module's health, system vitals, and launch actions from one place.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="modules"><LayoutGrid className="w-4 h-4 mr-1" /> Modules</TabsTrigger>
          <TabsTrigger value="vitals"><Activity className="w-4 h-4 mr-1" /> System Vitals</TabsTrigger>
          <TabsTrigger value="actions"><Rocket className="w-4 h-4 mr-1" /> Quick Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="modules"><ModuleHealthGrid /></TabsContent>
        <TabsContent value="vitals"><SystemVitals /></TabsContent>
        <TabsContent value="actions"><QuickActionLauncher /></TabsContent>
      </Tabs>
    </div>
  );
}