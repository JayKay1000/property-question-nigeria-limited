import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Search, ArrowRight, User } from 'lucide-react';
import { formatDate, categoryLabels, truncate } from '@/lib/marketing-utils';
import NewsletterSignup from '@/components/marketing/NewsletterSignup';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.BlogPost.filter({ is_active: true, status: 'published' }, '-published_date', 30);
        setPosts(data); setFiltered(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = posts;
    if (activeCat !== 'all') result = result.filter((p) => p.category === activeCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [posts, search, activeCat]);

  const featured = filtered.find((p) => p.is_featured) || filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen">
      <PageHero
        title="Blog & Insights"
        subtitle="Market analysis, property tips, investment strategies, and company news from our experts."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />

      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          <div className="mb-8 space-y-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={activeCat === 'all' ? 'default' : 'outline'} className={activeCat === 'all' ? 'bg-flame-500 text-white border-0' : ''} onClick={() => setActiveCat('all')}>All</Button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Button key={key} size="sm" variant={activeCat === key ? 'default' : 'outline'} className={activeCat === key ? 'bg-flame-500 text-white border-0' : ''} onClick={() => setActiveCat(key)}>{label}</Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center"><p className="text-muted-foreground">No articles found. Check back soon for new content.</p></Card>
          ) : (
            <>
              {featured && (
                <Link to={`/blog/${featured.slug}`} className="block mb-12 group">
                  <Card className="overflow-hidden hover:shadow-card-hover transition-shadow grid grid-cols-1 lg:grid-cols-2">
                    <div className="aspect-video lg:aspect-auto lg:h-80 bg-gradient-to-br from-brand-100 to-ice-100 overflow-hidden">
                      {featured.featured_image_url && <img src={featured.featured_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0 w-fit mb-3">Featured</Badge>
                      <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-3 group-hover:text-flame-600 transition-colors">{featured.title}</h2>
                      <p className="text-muted-foreground mb-4">{truncate(featured.excerpt, 200)}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {featured.author_name && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {featured.author_name}</span>}
                        {featured.published_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(featured.published_date)}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featured.reading_time_minutes || 5} min</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden hover:shadow-card-hover transition-all hover:-translate-y-1 duration-300 h-full flex flex-col">
                      <div className="aspect-video bg-gradient-to-br from-brand-100 to-ice-100 overflow-hidden">
                        {post.featured_image_url && <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0 w-fit mb-2">{categoryLabels[post.category] || 'Article'}</Badge>
                        <h3 className="font-heading font-bold mb-2 group-hover:text-flame-600 transition-colors line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">{truncate(post.excerpt, 120)}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t">
                          {post.published_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.published_date)}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_minutes || 5} min</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Newsletter */}
          <Card className="p-8 mt-16 bg-gradient-to-br from-brand-800 to-brand-950 border-0 text-white">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-heading font-bold mb-2">Stay Informed</h3>
              <p className="text-white/70 mb-6">Get the latest market insights and property tips delivered to your inbox.</p>
              <div className="text-left max-w-md mx-auto">
                <NewsletterSignup source="blog_page" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}