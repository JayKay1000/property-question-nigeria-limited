import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Newspaper, HelpCircle, Star, Building2, Users, MessageSquare, Mail, Plus, Edit, Trash2, FileBarChart, Phone } from 'lucide-react';
import { formatDate, truncate, categoryLabels, newsTypeLabels, inquiryTypeLabels } from '@/lib/marketing-utils';
import { useToast } from '@/components/ui/use-toast';

export default function CMSDashboard() {
  const [tab, setTab] = useState('overview');
  const [blogPosts, setBlogPosts] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      const [blog, news, faq, test, svc, sub, subs] = await Promise.all([
        base44.entities.BlogPost.list('-created_date', 20),
        base44.entities.NewsArticle.list('-created_date', 20),
        base44.entities.FAQ.filter({ is_active: true }, 'sort_order', 50),
        base44.entities.Testimonial.list('-created_date', 20),
        base44.entities.Service.filter({ is_active: true }, 'sort_order', 20),
        base44.entities.ContactSubmission.filter({ status: 'new' }, '-created_date', 20),
        base44.entities.NewsletterSubscriber.list('-created_date', 20),
      ]);
      setBlogPosts(blog); setNewsArticles(news); setFaqs(faq);
      setTestimonials(test); setServices(svc);
      setSubmissions(sub); setSubscribers(subs);
    } catch (e) { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleDelete = async (entity, id, name) => {
    try {
      await base44.entities[entity].delete(id);
      toast({ title: 'Deleted', description: `${name} has been removed.` });
      loadAll();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete. Please try again.', variant: 'destructive' });
    }
  };

  const stats = [
    { label: 'Blog Posts', value: blogPosts.length, icon: FileText, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'News Articles', value: newsArticles.length, icon: Newspaper, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Testimonials', value: testimonials.length, icon: Star, color: 'text-success', bg: 'bg-success/10' },
    { label: 'FAQs', value: faqs.length, icon: HelpCircle, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Services', value: services.length, icon: Building2, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'New Submissions', value: submissions.length, icon: MessageSquare, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Subscribers', value: subscribers.length, icon: Mail, color: 'text-ice-600', bg: 'bg-ice-50' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Content Management System</h1>
        <p className="text-muted-foreground">Manage website content, articles, testimonials, FAQs, and lead submissions.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {stats.map((s) => (
              <Card key={s.label} className="p-4">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-heading font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h3 className="font-heading font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setTab('blog')} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Blog Post</Button>
              <Button onClick={() => setTab('news')} variant="outline"><Plus className="w-4 h-4 mr-1" /> New News Article</Button>
              <Button onClick={() => setTab('faq')} variant="outline"><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>
              <Button onClick={() => setTab('testimonials')} variant="outline"><Plus className="w-4 h-4 mr-1" /> Add Testimonial</Button>
              <Button asChild variant="outline"><Link to="/admin/notifications">Notification Center</Link></Button>
            </div>
          </Card>
        </TabsContent>

        {/* Blog Posts */}
        <TabsContent value="blog">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold">Blog Posts ({blogPosts.length})</h2>
            <Button className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Post</Button>
          </div>
          <div className="space-y-3">
            {blogPosts.map((post) => (
              <Card key={post.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className={post.status === 'published' ? 'bg-success text-white border-0' : ''}>{post.status}</Badge>
                    {post.is_featured && <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">Featured</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{post.excerpt || truncate(post.content, 100)}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{categoryLabels[post.category]}</span>
                    {post.published_date && <span>{formatDate(post.published_date)}</span>}
                    <span>{post.view_count || 0} views</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('BlogPost', post.id, 'Blog post')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {blogPosts.length === 0 && <Card className="p-8 text-center text-muted-foreground">No blog posts yet.</Card>}
          </div>
        </TabsContent>

        {/* News */}
        <TabsContent value="news">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold">News Articles ({newsArticles.length})</h2>
            <Button className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New Article</Button>
          </div>
          <div className="space-y-3">
            {newsArticles.map((article) => (
              <Card key={article.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold truncate">{article.title}</h3>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'} className={article.status === 'published' ? 'bg-success text-white border-0' : ''}>{article.status}</Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{newsTypeLabels[article.news_type]}</span>
                    {article.published_date && <span>{formatDate(article.published_date)}</span>}
                    <span>{article.view_count || 0} views</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('NewsArticle', article.id, 'News article')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {newsArticles.length === 0 && <Card className="p-8 text-center text-muted-foreground">No news articles yet.</Card>}
          </div>
        </TabsContent>

        {/* Testimonials */}
        <TabsContent value="testimonials">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold">Testimonials ({testimonials.length})</h2>
            <Button className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Testimonial</Button>
          </div>
          <div className="space-y-3">
            {testimonials.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold">{t.client_name}</h3>
                    <div className="flex">{[1,2,3,4,5].map((i) => <Star key={i} className={`w-3 h-3 ${i <= (t.rating||5) ? 'text-flame-500 fill-flame-500' : 'text-border'}`} />)}</div>
                    <Badge variant={t.is_approved ? 'default' : 'secondary'} className={t.is_approved ? 'bg-success text-white border-0' : ''}>{t.is_approved ? 'Approved' : 'Pending'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">"{truncate(t.testimonial_text, 120)}"</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('Testimonial', t.id, 'Testimonial')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {testimonials.length === 0 && <Card className="p-8 text-center text-muted-foreground">No testimonials yet.</Card>}
          </div>
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faq">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold">FAQs ({faqs.length})</h2>
            <Button className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <Card key={f.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0 capitalize">{f.category}</Badge>
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{f.question}</h3>
                  <p className="text-sm text-muted-foreground truncate">{truncate(f.answer, 120)}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('FAQ', f.id, 'FAQ')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {faqs.length === 0 && <Card className="p-8 text-center text-muted-foreground">No FAQs yet.</Card>}
          </div>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold">Services ({services.length})</h2>
            <Button className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Service</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((s) => (
              <Card key={s.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold mb-1">{s.service_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{s.short_description}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('Service', s.id, 'Service')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {services.length === 0 && <Card className="p-8 text-center text-muted-foreground col-span-2">No services configured.</Card>}
          </div>
        </TabsContent>

        {/* Submissions */}
        <TabsContent value="submissions">
          <h2 className="text-xl font-heading font-bold mb-4">New Contact Submissions ({submissions.length})</h2>
          <div className="space-y-3">
            {submissions.map((sub) => (
              <Card key={sub.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold">{sub.full_name}</h3>
                      <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">{inquiryTypeLabels[sub.inquiry_type]}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{sub.email} {sub.phone && `· ${sub.phone}`}</p>
                      {sub.subject && <p className="font-medium">{sub.subject}</p>}
                      <p className="mt-2">{sub.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize ml-4">{sub.status}</Badge>
                </div>
              </Card>
            ))}
            {submissions.length === 0 && <Card className="p-8 text-center text-muted-foreground">No new submissions.</Card>}
          </div>
        </TabsContent>

        {/* Subscribers */}
        <TabsContent value="subscribers">
          <h2 className="text-xl font-heading font-bold mb-4">Newsletter Subscribers ({subscribers.length})</h2>
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
            {subscribers.length === 0 && <Card className="p-8 text-center text-muted-foreground col-span-2">No subscribers yet.</Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}