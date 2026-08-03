import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import SignatureOverview from '@/components/admin/dms/SignatureOverview';
import SignatureRequestManager from '@/components/admin/dms/SignatureRequestManager';

export default function DocumentSigningCenter() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><FileText className="w-7 h-7 text-flame-500" /> Document Management & Signing Center</h1>
        <p className="text-muted-foreground">Manage e-signature workflows, OCR processing, and document version control.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signatures">Signature Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><SignatureOverview /></TabsContent>
        <TabsContent value="signatures"><SignatureRequestManager /></TabsContent>
      </Tabs>
    </div>
  );
}