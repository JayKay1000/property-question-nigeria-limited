import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FileCode2, Save, Network, Tags, Link as LinkIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function TechnicalSEOPanel() {
  const [robots, setRobots] = useState(null);
  const [robotsText, setRobotsText] = useState('');
  const [sitemap, setSitemap] = useState(null);
  const [sitemapForm, setSitemapForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingRobots, setSavingRobots] = useState(false);
  const [savingSitemap, setSavingSitemap] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [robotsRecs, sitemapRecs] = await Promise.all([
        base44.entities.SiteContent.filter({ content_key: 'robots_txt' }),
        base44.entities.SiteContent.filter({ content_key: 'sitemap_config' }),
      ]);
      const r = robotsRecs[0]; setRobots(r); setRobotsText(r?.content || defaultRobots);
      const s = sitemapRecs[0]; setSitemap(s); setSitemapForm(s?.metadata || defaultSitemap);
    } catch { setRobotsText(defaultRobots); setSitemapForm(defaultSitemap); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveRobots = async () => {
    setSavingRobots(true);
    try {
      if (robots?.id) await base44.entities.SiteContent.update(robots.id, { content: robotsText });
      else await base44.entities.SiteContent.create({ content_key: 'robots_txt', content_type: 'settings', title: 'robots.txt', content: robotsText, status: 'published' });
      toast({ title: 'robots.txt saved' }); load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSavingRobots(false);
  };

  const saveSitemap = async () => {
    setSavingSitemap(true);
    try {
      if (sitemap?.id) await base44.entities.SiteContent.update(sitemap.id, { metadata: sitemapForm });
      else await base44.entities.SiteContent.create({ content_key: 'sitemap_config', content_type: 'settings', title: 'Sitemap Configuration', metadata: sitemapForm, status: 'published' });
      toast({ title: 'Sitemap config saved' }); load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSavingSitemap(false);
  };

  if (loading) return <Card className="p-8 text-center text-muted-foreground">Loading…</Card>;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><FileCode2 className="w-5 h-5 text-flame-500" /> robots.txt Editor</h3>
        <Textarea value={robotsText} onChange={e => setRobotsText(e.target.value)} rows={10} className="font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-2">Controls how search engine crawlers access your site. One directive per line.</p>
        <div className="mt-4"><Button onClick={saveRobots} disabled={savingRobots} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Save className="w-4 h-4 mr-1" /> {savingRobots ? 'Saving…' : 'Save robots.txt'}</Button></div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Network className="w-5 h-5 text-flame-500" /> XML Sitemap Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Included URL Paths (one per line)</Label>
            <Textarea value={(sitemapForm.include_paths || []).join('\n')} rows={5} onChange={e => setSitemapForm(p => ({ ...p, include_paths: e.target.value.split('\n').filter(Boolean) }))} className="font-mono text-sm" placeholder="/properties" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Excluded URL Paths (one per line)</Label>
            <Textarea value={(sitemapForm.exclude_paths || []).join('\n')} rows={3} onChange={e => setSitemapForm(p => ({ ...p, exclude_paths: e.target.value.split('\n').filter(Boolean) }))} className="font-mono text-sm" placeholder="/admin" />
          </div>
          <div className="space-y-1.5">
            <Label>Default Change Frequency</Label>
            <Select value={sitemapForm.changefreq || 'weekly'} onValueChange={v => setSitemapForm(p => ({ ...p, changefreq: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Default Priority (0.0 – 1.0)</Label>
            <Input type="number" min={0} max={1} step={0.1} value={sitemapForm.priority ?? 0.8} onChange={e => setSitemapForm(p => ({ ...p, priority: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="mt-4"><Button onClick={saveSitemap} disabled={savingSitemap} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Save className="w-4 h-4 mr-1" /> {savingSitemap ? 'Saving…' : 'Save Sitemap Config'}</Button></div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Tags className="w-5 h-5 text-flame-500" /> Technical SEO Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <LinkIcon className="w-4 h-4 text-flame-500 mt-0.5 shrink-0" />
              <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const defaultRobots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api
Disallow: /portal

Sitemap: https://propertyquestion.com.ng/sitemap.xml`;

const defaultSitemap = {
  include_paths: ['/properties', '/projects', '/blog', '/news', '/agents', '/about', '/contact'],
  exclude_paths: ['/admin', '/dashboard', '/api'],
  changefreq: 'weekly',
  priority: 0.8,
};

const checklistItems = [
  { label: 'Canonical URLs', desc: 'Each page has a canonical tag to prevent duplicate content issues.' },
  { label: 'Structured Data (Schema.org)', desc: 'JSON-LD structured data for RealEstateListing, Organisation, and BreadcrumbList.' },
  { label: 'Open Graph Tags', desc: 'og:title, og:description, og:image on every page for social sharing.' },
  { label: 'Twitter Cards', desc: 'twitter:card and twitter:image meta tags for rich Twitter previews.' },
  { label: 'XML Sitemap', desc: 'Sitemap submitted to Google Search Console with all indexable URLs.' },
  { label: 'Robots.txt', desc: 'Crawl directives configured to guide search engine bots.' },
  { label: 'Mobile-First Indexing', desc: 'Responsive design validated for mobile-first indexing.' },
  { label: 'Core Web Vitals', desc: 'LCP, FID, and CLS within Google thresholds for all key pages.' },
  { label: 'HTTPS', desc: 'SSL certificate active with secure connections enforced.' },
  { label: 'Image Alt Text', desc: 'All content images have descriptive alt text for accessibility and image SEO.' },
];