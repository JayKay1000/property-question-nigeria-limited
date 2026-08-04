import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Newspaper, HelpCircle, Star, Building2, MessageSquare, Mail, Plus, LayoutTemplate, Image, Menu as MenuIcon, ClipboardCheck, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { inquiryTypeLabels } from '@/lib/marketing-utils';
import { formatDate, truncate } from '@/lib/cms-utils';
import ContentListTab from '@/components/admin/cms/ContentListTab';
import PageBuilderPanel from '@/components/admin/cms/PageBuilderPanel';
import HeroBannerManager from '@/components/admin/cms/HeroBannerManager';
import MenuManager from '@/components/admin/cms/MenuManager';
import SEOManager from '@/components/admin/cms/SEOManager';
import VersionHistoryPanel from '@/components/admin/cms/VersionHistoryPanel';
import ApprovalQueuePanel from '@/components/admin/cms/ApprovalQueuePanel';

export default function CMSDashboard() {
  const [tab, setTab] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadOverview = async () => {
    setLoading(true);
    try {
      const [blog, news, faq, test, svc, sub, subs, banners, pages, menus, approvals] = await Promise.all([
        base44.entities.BlogPost.list('-created_date', 1),
        base44.entities.NewsArticle.list('-created_date', 1),
        base44.entities.FAQ.filter({ is_active: true }, 'sort_order', 1),
        base44.entities.Testimonial.list('-created_date', 1),
        base44.entities.Service.filter({ is_active: true }, 'sort_order', 1),
        base44.entities.ContactSubmission.filter({ status: 'new' }, '-created_date', 50),
        base44.entities.NewsletterSubscriber.list('-created_date', 50),
        base44.entities.SiteContent.filter({ content_type: 'banner' }, 'sort_order', 1),
        base44.entities.LandingPage.list('-created_date', 1),
        base44.entities.CMSMenu.list('sort_order', 1),
        base44.entities.ContentApproval.filter({ status: 'pending' }, '-created_date', 1),
      ]);
      setCounts({
        blog: blog.length, news: news.length, faq: faq.length, testimonial: test.length,
        service: svc.length, submissions: sub.length, subscribers: subs.length,
        banners: banners.length, pages: pages.length, menus: menus.length, approvals: approvals.length,
      });
      setSubmissions(sub);
      setSubscribers(subs);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { loadOverview(); }, []);

  const stats = [
    { label: 'Blog Posts', value: counts.blog ?? '—', icon: FileText, color: 'text-flame-600', bg: 'bg-flame-50', tab: 'blog' },
    { label: 'News', value: counts.news ?? '—', icon: Newspaper, color: 'text-ice-600', bg: 'bg-ice-50', tab: 'news' },
    { label: 'Landing Pages', value: counts.pages ?? '—', icon: LayoutTemplate, color: 'text-brand-600', bg: 'bg-brand-50', tab: 'pages' },
    { label: 'Banners', value: counts.banners ?? '—', icon: Image, color: 'text-flame-600', bg: 'bg-flame-50', tab: 'banners' },
    { label: 'Menus', value: counts.menus ?? '—', icon: MenuIcon, color: 'text-brand-600', bg: 'bg-brand-50', tab: 'menus' },
    { label: 'Testimonials', value: counts.testimonial ?? '—', icon: Star, color: 'text-success', bg: 'bg-success/10', tab: 'testimonials' },
    { label: 'FAQs', value: counts.faq ?? '—', icon: HelpCircle, color: 'text-brand-600', bg: 'bg-brand-50', tab: 'faqs' },
    { label: 'Services', value: counts.service ?? '—', icon: Building2, color: 'text-flame-600', bg: 'bg-flame-50', tab: 'services' },
    { label: 'Pending Approvals', value: counts.approvals ?? '—', icon: ClipboardCheck, color: 'text-warning', bg: 'bg-warning/15', tab: 'approvals' },
    { label: 'New Submissions', value: counts.submissions ?? '—', icon: MessageSquare, color: 'text-error', bg: 'bg-error/10', tab: 'submissions' },
    { label: 'Subscribers', value: counts.subscribers ?? '—', icon: Mail, color: 'text-ice-600', bg: 'bg-ice-50', tab: 'subscribers' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><Layers className="w-7 h-7 text-flame-500" /> Content Management System</h1>
        <p className="text-muted-foreground">Manage pages, banners, menus, blog, news, testimonials, FAQs, services, SEO, versions, and approvals.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {stats.map((s) => (
              <Card key={s.label} className="p-4 cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => setTab(s.tab)}>
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-heading font-bold">{loading ? '…' : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h3 className="font-heading font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setTab('blog')} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Blog Post</Button>
              <Button onClick={() => setTab('news')} variant="outline"><Plus className="w-4 h-4 mr-1" /> New News Article</Button>
              <Button onClick={() => setTab('pages')} variant="outline"><Plus className="w-4 h-4 mr-1" /> New Landing Page</Button>
              <Button onClick={() => setTab('banners')} variant="outline"><Plus className="w-4 h-4 mr-1" /> New Banner</Button>
              <Button onClick={() => setTab('menus')} variant="outline"><Plus className="w-4 h-4 mr-1" /> New Menu</Button>
              <Button onClick={() => setTab('faqs')} variant="outline"><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>
              <Button onClick={() => setTab('approvals')} variant="outline"><ClipboardCheck className="w-4 h-4 mr-1" /> Review Approvals</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="blog"><ContentListTab entityType="BlogPost" title="Blog Posts" icon={FileText} searchFields={['title', 'category', 'author_name']} /></TabsContent>
        <TabsContent value="news"><ContentListTab entityType="NewsArticle" title="News Articles" icon={Newspaper} searchFields={['title', 'news_type']} /></TabsContent>
        <TabsContent value="pages"><PageBuilderPanel /></TabsContent>
        <TabsContent value="banners"><HeroBannerManager /></TabsContent>
        <TabsContent value="menus"><MenuManager /></TabsContent>
        <TabsContent value="testimonials"><ContentListTab entityType="Testimonial" title="Testimonials" icon={Star} searchFields={['client_name', 'client_company']} /></TabsContent>
        <TabsContent value="faqs"><ContentListTab entityType="FAQ" title="FAQs" icon={HelpCircle} searchFields={['question', 'category']} /></TabsContent>
        <TabsContent value="services"><ContentListTab entityType="Service" title="Services" icon={Building2} searchFields={['service_name', 'category']} /></TabsContent>
        <TabsContent value="seo"><SEOManager /></TabsContent>
        <TabsContent value="versions"><VersionHistoryPanel /></TabsContent>
        <TabsContent value="approvals"><ApprovalQueuePanel /></TabsContent>

        <TabsContent value="submissions">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-flame-500" /> New Contact Submissions ({submissions.length})</h2>
          <div className="space-y-3">
            {submissions.map((sub) => (
              <Card key={sub.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold">{sub.full_name}</h3>
                      <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">{inquiryTypeLabels[sub.inquiry_type]}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{sub.email} {sub.phone && `· ${sub.phone}`}</p>
                      {sub.subject && <p className="font-medium">{sub.subject}</p>}
                      {sub.message && <p className="mt-2">{sub.message}</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{sub.status}</Badge>
                </div>
              </Card>
            ))}
            {submissions.length === 0 && <Card className="p-8 text-center text-muted-foreground">No new submissions.</Card>}
          </div>
        </TabsContent>

        <TabsContent value="subscribers">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-flame-500" /> Newsletter Subscribers ({subscribers.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subscribers.map((sub) => (
              <Card key={sub.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{sub.email}</p>
                  {sub.full_name && <p className="text-sm text-muted-foreground">{sub.full_name}</p>}
                  {sub.subscribed_date && <p className="text-xs text-muted-foreground mt-1">Subscribed: {formatDate(sub.subscribed_date)}</p>}
                </div>
                <Badge variant={sub.status === 'subscribed' ? 'default' : 'secondary'} className={sub.status === 'subscribed' ? 'bg-success text-white border-0' : ''}>{sub.status}</Badge>
              </Card>
            ))}
            {subscribers.length === 0 && <Card className="p-8 text-center text-muted-foreground md:col-span-2">No subscribers yet.</Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}