import { useState } from 'react';
import { FolderOpen, FileText, HardDrive, Cpu, ShieldCheck, BarChart3, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import AssetLibrary from '@/components/admin/media/AssetLibrary';
import DocumentControl from '@/components/admin/media/DocumentControl';
import StorageManager from '@/components/admin/media/StorageManager';
import MediaProcessing from '@/components/admin/media/MediaProcessing';
import SecurityCompliance from '@/components/admin/media/SecurityCompliance';
import MediaAnalytics from '@/components/admin/media/MediaAnalytics';
import MediaGovernance from '@/components/admin/media/MediaGovernance';

export default function MediaDocumentCenter() {
  const [tab, setTab] = useState('assets');

  return (
    <div>
      <PageHeader
        title="Digital Asset & Document Command Center"
        subtitle="Enterprise DAM & EDMS — unified library, version control, security, processing, analytics, and governance"
        icon={FolderOpen}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="assets" className="gap-1.5"><FolderOpen className="h-4 w-4" /> Assets</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
          <TabsTrigger value="storage" className="gap-1.5"><HardDrive className="h-4 w-4" /> Storage</TabsTrigger>
          <TabsTrigger value="processing" className="gap-1.5"><Cpu className="h-4 w-4" /> Processing</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><ShieldCheck className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5"><Database className="h-4 w-4" /> Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="assets" className="mt-6"><AssetLibrary /></TabsContent>
        <TabsContent value="documents" className="mt-6"><DocumentControl /></TabsContent>
        <TabsContent value="storage" className="mt-6"><StorageManager /></TabsContent>
        <TabsContent value="processing" className="mt-6"><MediaProcessing /></TabsContent>
        <TabsContent value="security" className="mt-6"><SecurityCompliance /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><MediaAnalytics /></TabsContent>
        <TabsContent value="governance" className="mt-6"><MediaGovernance /></TabsContent>
      </Tabs>
    </div>
  );
}