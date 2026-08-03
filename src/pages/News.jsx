import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Newspaper } from 'lucide-react';
import { formatDate, newsTypeLabels, truncate } from '@/lib/marketing-utils';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.NewsArticle.filter({ is_active: true, status: 'published' }, '-published_date', 30);
        setArticles(data); setFiltered(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = articles;
    if (activeType !== 'all') result = result.filter((a) => a.news_type === activeType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title?.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [articles, search, activeType]);

  return (
    <div className="min-h-screen">
      <PageHero
        title="News & Announcements"
        subtitle="Company updates, project launches, events, and press releases from Property Question Nigeria."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'News' }]}
      />

      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          <div className="mb-8 space-y-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={activeType === 'all' ? 'default' : 'outline'} className={activeType === 'all' ? 'bg-flame-500 text-white border-0' : ''} onClick={() => setActiveType('all')}>All</Button>
              {Object.entries(newsTypeLabels).map(([key, label]) => (
                <Button key={key} size="sm" variant={activeType === key ? 'default' : 'outline'} className={activeType === key ? 'bg-flame-500 text-white border-0' : ''} onClick={() => setActiveType(key)}>{label}</Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No news articles found.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <Link key={article.id} to={`/news/${article.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-card-hover transition-all hover:-translate-y-1 duration-300 h-full flex flex-col">
                    <div className="aspect-video bg-gradient-to-br from-brand-100 to-ice-100 overflow-hidden relative">
                      {article.featured_image_url && <img src={article.featured_image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <Badge variant="secondary" className="absolute top-3 left-3 bg-flame-500 text-white border-0">{newsTypeLabels[article.news_type] || 'News'}</Badge>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-heading font-bold mb-2 group-hover:text-flame-600 transition-colors line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">{truncate(article.excerpt, 120)}</p>
                      {article.published_date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground pt-3 border-t">
                          <Calendar className="w-3 h-3" /> {formatDate(article.published_date)}
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}