import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Globe, TrendingUp, AlertTriangle, CheckCircle2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { truncate } from '@/lib/cms-utils';

export default function SEOManager() {
  const [global, setGlobal] = useState(null);
  const [globalForm, setGlobalForm] = useState({});
  const [propertySeo, setPropertySeo] = useState([]);
  const [contentSeo, setContentSeo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [globals, seo, blog, news, pages] = await Promise.all([
        base44.entities.SiteContent.filter({ content_key: 'seo_global' }),
        base44.entities.SeoMetadata.list('-created_date', 50),
        base44.entities.BlogPost.list('-created_date', 30),
        base44.entities.NewsArticle.list('-created_date', 30),
        base44.entities.SiteContent.filter({ content_type: 'page' }, 'sort_order', 30),
      ]);
      const g = globals[0];
      setGlobal(g);
      setGlobalForm(g?.metadata || {});
      setPropertySeo(seo);
      const scored = [
        ...blog.map(b => ({ id: b.id, type: 'Blog', title: b.title, seo_title: b.seo_title, seo_description: b.seo_description, slug: b.slug })),
        ...news.map(n => ({ id: n.id, type: 'News', title: n.title, seo_title: n.seo_title, seo_description: n.seo_description, slug: n.slug })),
        ...pages.map(p => ({ id: p.id, type: 'Page', title: p.title || p.content_key, seo_title: p.seo_title, seo_description: p.seo_description, slug: p.content_key })),
      ].map(r => ({ ...r, score: calcScore(r) }));
      setContentSeo(scored);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const calcScore = (r) => {
    let s = 0;
    if (r.seo_title) s += 40; if (r.seo_description) s += 40; if (r.slug) s += 20;
    return s;
  };

  const saveGlobal = async () => {
    setSaving(true);
    try {
      if (global?.id) await base44.entities.SiteContent.update(global.id, { metadata: globalForm });
      else await base44.entities.SiteContent.create({ content_key: 'seo_global', content_type: 'settings', title: 'Global SEO Settings', metadata: globalForm, status: 'published' });
      toast({ title: 'Global SEO settings saved' });
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  const filteredContent = contentSeo.filter(c => !query || (c.title || '').toLowerCase().includes(query.toLowerCase()));
  const goodCount = contentSeo.filter(c => c.score === 100).length;
  const partialCount = contentSeo.filter(c => c.score > 0 && c.score < 100).length;
  const missingCount = contentSeo.filter(c => c.score === 0).length;

  return (
    <div className="space-y-6">
      {/* Global SEO Settings */}
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-flame-500" /> Global SEO Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Default Robots Directive</Label><Input value={globalForm.robots_directive || ''} placeholder="index, follow" onChange={e => setGlobalForm(p => ({ ...p, robots_directive: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Default Twitter Card Type</Label>
            <Select value={globalForm.twitter_card_type || 'summary_large_image'} onValueChange={v => setGlobalForm(p => ({ ...p, twitter_card_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['summary', 'summary_large_image', 'app', 'player'].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Default Open Graph Title</Label><Input value={globalForm.og_title || ''} onChange={e => setGlobalForm(p => ({ ...p, og_title: e.target.value }))} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Default Open Graph Description</Label><Textarea value={globalForm.og_description || ''} rows={2} onChange={e => setGlobalForm(p => ({ ...p, og_description: e.target.value }))} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Default OG Image URL</Label><Input value={globalForm.og_image_url || ''} placeholder="https://…" onChange={e => setGlobalForm(p => ({ ...p, og_image_url: e.target.value }))} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Default Structured Data Type</Label><Input value={globalForm.structured_data_type || ''} placeholder="RealEstateListing" onChange={e => setGlobalForm(p => ({ ...p, structured_data_type: e.target.value }))} /></div>
        </div>
        <div className="mt-4"><Button onClick={saveGlobal} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Save className="w-4 h-4 mr-1" /> {saving ? 'Saving…' : 'Save Settings'}</Button></div>
      </Card>

      {/* SEO Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div><div><p className="text-2xl font-heading font-bold">{goodCount}</p><p className="text-xs text-muted-foreground">Optimised</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-warning" /></div><div><p className="text-2xl font-heading font-bold">{partialCount}</p><p className="text-xs text-muted-foreground">Partial</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-error" /></div><div><p className="text-2xl font-heading font-bold">{missingCount}</p><p className="text-xs text-muted-foreground">Missing</p></div></div></Card>
      </div>

      {/* Page SEO Scores */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold">Page SEO Audit</h3>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pages…" className="pl-9 w-48" /></div>
        </div>
        <div className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>}
          {!loading && filteredContent.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No pages found.</p>}
          {!loading && filteredContent.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><Badge variant="outline" className="capitalize">{c.type}</Badge><span className="font-medium truncate">{c.title || 'Untitled'}</span><span className="text-xs text-muted-foreground font-mono">/{c.slug || '—'}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.seo_title ? truncate(c.seo_description, 80) || 'Has SEO description' : 'No SEO title or description'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${c.score === 100 ? 'bg-success' : c.score > 0 ? 'bg-warning' : 'bg-error'}`} style={{ width: `${c.score}%` }} /></div>
                <span className="text-sm font-semibold w-8 text-right">{c.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}