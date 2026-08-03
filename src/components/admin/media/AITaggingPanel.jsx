import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tags, Sparkles, BrainCircuit, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { transcodeStatusConfig, sourceTypeLabels, formatNumber } from '@/lib/enterprise-ops-utils';

export default function AITaggingPanel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setLoading(true); try { setJobs(await base44.entities.MediaTranscodeJob.list('-created_date', 200)); } catch { /* */ } setLoading(false); })(); }, []);

  const tagged = jobs.filter(j => j.ai_tags && j.ai_tags.length > 0);
  const totalTags = tagged.reduce((s, j) => s + j.ai_tags.length, 0);
  const tagCounts = {};
  tagged.forEach(j => j.ai_tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  const stats = [
    { label: 'Total Media', value: jobs.length, icon: ImageIcon, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'AI Tagged', value: tagged.length, icon: Tags, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Total Tags', value: totalTags, icon: Sparkles, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Unique Tags', value: Object.keys(tagCounts).length, icon: BrainCircuit, color: 'text-ice-600', bg: 'bg-ice-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            <p className="text-xl font-heading font-bold">{loading ? '…' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-flame-500" /> Top AI Tags</h3>
        <div className="flex gap-2 flex-wrap">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && topTags.length === 0 && <p className="text-sm text-muted-foreground">No AI tags generated yet.</p>}
          {!loading && topTags.map(([tag, count]) => (
            <Badge key={tag} variant="secondary" className="bg-brand-50 text-brand-600 border-0 px-3 py-1 text-sm">{tag} <span className="ml-1.5 text-xs text-muted-foreground">{count}×</span></Badge>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Tags className="w-5 h-5 text-flame-500" /> Tagged Media</h3>
        <div className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
          {!loading && tagged.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No media has been AI-tagged yet.</p>}
          {!loading && tagged.map(j => (
            <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{j.source_name}</p>
                <p className="text-xs text-muted-foreground">{sourceTypeLabels[j.source_type]} · {j.ai_confidence != null ? `${Math.round(j.ai_confidence * 100)}% confidence` : ''}</p>
                <div className="flex gap-1 flex-wrap mt-1.5">{j.ai_tags.map((t, i) => <Badge key={i} variant="secondary" className="bg-brand-50 text-brand-600 border-0 text-xs">{t}</Badge>)}</div>
              </div>
              <Badge variant="secondary" className={transcodeStatusConfig[j.status]?.className || '' + ' shrink-0'}>{transcodeStatusConfig[j.status]?.label || j.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}