import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film } from 'lucide-react';
import TranscodeJobManager from '@/components/admin/media/TranscodeJobManager';
import WatermarkManager from '@/components/admin/media/WatermarkManager';
import AITaggingPanel from '@/components/admin/media/AITaggingPanel';

export default function MediaOpsCenter() {
  const [tab, setTab] = useState('transcode');
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><Film className="w-7 h-7 text-flame-500" /> Media Operations Center</h1>
        <p className="text-muted-foreground">Manage media transcoding, watermarking, and AI-driven content tagging.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="transcode">Transcoding</TabsTrigger>
          <TabsTrigger value="watermarks">Watermarks</TabsTrigger>
          <TabsTrigger value="ai-tags">AI Tagging</TabsTrigger>
        </TabsList>
        <TabsContent value="transcode"><TranscodeJobManager /></TabsContent>
        <TabsContent value="watermarks"><WatermarkManager /></TabsContent>
        <TabsContent value="ai-tags"><AITaggingPanel /></TabsContent>
      </Tabs>
    </div>
  );
}