import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Share2, User } from 'lucide-react';
import { formatDate, newsTypeLabels } from '@/lib/marketing-utils';
import CTASection from '@/components/marketing/CTASection';
import ReactMarkdown from 'react-markdown';

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const items = await base44.entities.NewsArticle.filter({ is_active: true, status: 'published', slug }, '-published_date', 1);
        if (items.length > 0) setArticle(items[0]);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center section-pad">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Article Not Found</h1>
          <Button asChild className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            <Link to="/news"><ArrowLeft className="w-4 h-4 mr-2" /> Back to News</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <article>
        <section className="relative overflow-hidden bg-brand-900 text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flame-500/10 rounded-full blur-[120px]" />
          <div className="relative section-pad py-16 lg:py-24">
            <div className="container-wide max-w-3xl">
              <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-6">
                <Link to="/" className="hover:text-flame-400">Home</Link><span>/</span>
                <Link to="/news" className="hover:text-flame-400">News</Link><span>/</span>
                <span className="text-white/70 truncate">{article.title}</span>
              </nav>
              <Badge variant="secondary" className="bg-flame-500/20 text-flame-300 border-0 mb-4">{newsTypeLabels[article.news_type] || 'News'}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {article.author_name && <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author_name}</span>}
                {article.published_date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(article.published_date)}</span>}
              </div>
            </div>
          </div>
        </section>

        {article.featured_image_url && (
          <div className="container-wide max-w-4xl -mt-12 relative z-10 mb-12">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-card-hover">
              <img src={article.featured_image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="container-wide max-w-3xl pb-16">
          <ReactMarkdown className="text-foreground leading-relaxed space-y-4 [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-heading [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-flame-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground">
            {article.content || article.excerpt || 'Content coming soon.'}
          </ReactMarkdown>

          <div className="flex items-center justify-between mt-8 pt-8 border-t">
            <Button asChild variant="outline">
              <Link to="/news"><ArrowLeft className="w-4 h-4 mr-2" /> All News</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </article>

      <CTASection />
    </div>
  );
}