import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Home, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import PropertyUploadForm from '@/components/admin/upload/PropertyUploadForm';
import DocumentUploadForm from '@/components/admin/upload/DocumentUploadForm';

export default function UploadCenter() {
  const [tab, setTab] = useState('property');
  return (
    <div>
      <PageHeader
        title="Manual Upload Center"
        subtitle="Create new property listings and upload documents directly from the admin dashboard"
        icon={Upload}
      />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="property" className="gap-1.5"><Home className="h-4 w-4" /> New Property</TabsTrigger>
          <TabsTrigger value="document" className="gap-1.5"><FileText className="h-4 w-4" /> Upload Document</TabsTrigger>
        </TabsList>
        <TabsContent value="property" className="mt-6"><PropertyUploadForm /></TabsContent>
        <TabsContent value="document" className="mt-6"><DocumentUploadForm /></TabsContent>
      </Tabs>
    </div>
  );
}