import { useState } from 'react';
import { Database, Table2, BookOpen, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import SchemaExplorer from '@/components/admin/governance/SchemaExplorer';
import DataDictionary from '@/components/admin/governance/DataDictionary';
import IntegrityMonitor from '@/components/admin/governance/IntegrityMonitor';

export default function DatabaseGovernance() {
  const [tab, setTab] = useState('explorer');

  return (
    <div>
      <PageHeader
        title="Database Governance Center"
        subtitle="Schema explorer, data dictionary, and integrity monitoring for the Property Question Nigeria platform"
        icon={Database}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explorer" className="gap-1.5">
            <Table2 className="h-4 w-4" /> Schema Explorer
          </TabsTrigger>
          <TabsTrigger value="dictionary" className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Data Dictionary
          </TabsTrigger>
          <TabsTrigger value="integrity" className="gap-1.5">
            <Activity className="h-4 w-4" /> Integrity Monitor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="explorer" className="mt-6">
          <SchemaExplorer />
        </TabsContent>
        <TabsContent value="dictionary" className="mt-6">
          <DataDictionary />
        </TabsContent>
        <TabsContent value="integrity" className="mt-6">
          <IntegrityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}