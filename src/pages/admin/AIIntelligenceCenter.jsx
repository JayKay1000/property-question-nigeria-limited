import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Brain, BarChart3, Bot, Sparkles, History, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AIFeatureGrid from '@/components/admin/ai/AIFeatureGrid';
import AIChatPanel from '@/components/admin/ai/AIChatPanel';
import AIRequestLogTable from '@/components/admin/ai/AIRequestLogTable';
import { AI_FEATURES, formatTokens } from '@/lib/ai-utils';
import PageHeader from '@/components/ui/PageHeader';

export default function AIIntelligenceCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('features');
  const [requestLogs, setRequestLogs] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRequests: 0, totalTokens: 0, totalCredits: 0, successRate: 0, byType: {} });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logData, convData] = await Promise.all([
        base44.entities.AIRequestLog.list('-request_timestamp', 100),
        base44.entities.AIConversation.list('-started_at', 20),
      ]);
      setRequestLogs(logData || []);
      setConversations(convData || []);

      const logs = logData || [];
      const totalTokens = logs.reduce((sum, l) => sum + (l.tokens_input || 0) + (l.tokens_output || 0), 0);
      const totalCredits = logs.reduce((sum, l) => sum + (l.credits_used || 0), 0);
      const successCount = logs.filter(l => l.status === 'success').length;
      const byType = {};
      logs.forEach(l => { byType[l.request_type] = (byType[l.request_type] || 0) + 1; });

      setStats({
        totalRequests: logs.length,
        totalTokens,
        totalCredits,
        successRate: logs.length ? Math.round((successCount / logs.length) * 100) : 0,
        byType,
      });
    } catch (err) {
      console.error('Failed to load AI data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFeatureClick = (feature) => {
    toast({ title: feature.name, description: feature.description });
  };

  const statCards = [
    { label: 'Total AI Requests', value: stats.totalRequests, icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Tokens Used', value: formatTokens(stats.totalTokens), icon: Zap, color: 'text-flame-600', bg: 'bg-flame-500/10' },
    { label: 'Credits Used', value: stats.totalCredits, icon: BarChart3, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: Bot, color: 'text-success', bg: 'bg-success/10' },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="AI & Intelligent Automation Platform"
        subtitle="The intelligent brain of Property Question — recommendations, chatbot, document summarisation, valuations, fraud detection & more"
        icon={Brain}
        actions={<Button variant="default" onClick={() => setActiveTab('chatbot')}><Bot className="h-4 w-4" /> AI Chatbot</Button>}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map(item => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold font-heading">{item.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="features" className="gap-1.5"><Sparkles className="h-4 w-4" /> AI Features</TabsTrigger>
          <TabsTrigger value="chatbot" className="gap-1.5"><Bot className="h-4 w-4" /> AI Chatbot</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><History className="h-4 w-4" /> Request Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-6">
          <AIFeatureGrid onFeatureClick={handleFeatureClick} />
        </TabsContent>

        <TabsContent value="chatbot" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AIChatPanel conversationType="chatbot" />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Recent Conversations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {loading ? (
                    <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
                  ) : conversations.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No conversations yet</p>
                  ) : (
                    conversations.slice(0, 5).map(conv => (
                      <div key={conv.id} className="flex items-center gap-2 rounded-lg border p-2.5 hover:bg-muted/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{conv.title || conv.conversation_type}</p>
                          <p className="text-xs text-muted-foreground">{conv.message_count || 0} messages</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Request Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(stats.byType).map(([type, count]) => {
                    const feature = AI_FEATURES.find(f => f.code === type);
                    return (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: feature?.color || '#6B7280' }} />
                          {feature?.name || type}
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                  {Object.keys(stats.byType).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> AI Request Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
              ) : (
                <AIRequestLogTable logs={requestLogs} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}