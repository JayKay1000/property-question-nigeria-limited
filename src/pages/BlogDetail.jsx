import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, CheckCircle2 } from 'lucide-react';
import { formatDate, categoryLabels } from '@/lib/marketing-utils';
import CTASection from '@/components/marketing/CTASection';
import { Image as OptimizedImage } from '@/components/ui/image';
import { loadContent } from '@/lib/content-storage';
import { processBlogContent } from '@/lib/blog-content-utils';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    (async () => {
      try {
        const posts = await base44.entities.BlogPost.filter({ is_active: true, status: 'published', slug }, '-published_date', 1);
        if (posts.length > 0) {
          const found = posts[0];
          setPost(found);
          if (found.category) {
            const rel = await base44.entities.BlogPost.filter({ is_active: true, status: 'published', category: found.category }, '-published_date', 4);
            setRelated(rel.filter((r) => r.id !== found.id).slice(0, 3));
          }
        }
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!post) return;
      try {
        const html = await loadContent(post.content);
        if (active) setHtmlContent(processBlogContent(html) || post.excerpt || '<p>Content coming soon.</p>');
      } catch {
        if (active) setHtmlContent(post.excerpt || '<p>Content coming soon.</p>');
      }
    })();
    return () => { active = false; };
  }, [post]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center section-pad">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Article Not Found</h1>
          <Button asChild className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog</Link>
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
                <Link to="/" className="hover:text-flame-400">Home</Link>
                <span>/</span>
                <Link to="/blog" className="hover:text-flame-400">Blog</Link>
                <span>/</span>
                <span className="text-white/70 truncate">{post.title}</span>
              </nav>
              <Badge variant="secondary" className="bg-flame-500/20 text-flame-300 border-0 mb-4">{categoryLabels[post.category] || 'Article'}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {post.author_name && <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author_name}</span>}
                {post.published_date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(post.published_date)}</span>}
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.reading_time_minutes || 5} min read</span>
              </div>
            </div>
          </div>
        </section>

        {post.featured_image_url && (
          <div className="container-wide max-w-4xl -mt-12 relative z-10 mb-12">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-card-hover">
              <OptimizedImage src={post.featured_image_url} alt={post.title} fittingType="fill" className="w-full h-full" />
            </div>
          </div>
        )}

        {post.image_urls?.length > 0 && (
          <div className="container-wide max-w-4xl mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.image_urls.map((url, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-border">
                  <OptimizedImage src={url} alt={`Gallery ${i + 1}`} fittingType="fill" className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {post.video_urls?.length > 0 && (
          <div className="container-wide max-w-4xl mb-12 space-y-4">
            {post.video_urls.map((url, i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                <video src={url} controls preload="metadata" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        )}

        <div className="container-wide max-w-3xl pb-16">
          <div
            className="prose prose-lg max-w-none text-foreground leading-relaxed [&_p]:mb-4 [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-flame-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-flame-600 [&_a]:underline [&_img]:rounded-xl [&_img]:mb-4 [&_img]:w-full"
            dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Content coming soon.</p>' }}
          />

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-8 border-t">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-ice-50 text-ice-700 border-0">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button asChild variant="outline">
              <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" /> All Articles</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={handleShare}>
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copied ? 'Link copied!' : 'Share'}
            </Button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-ice-50 section-pad py-16">
          <div className="container-wide max-w-4xl">
            <h2 className="text-2xl font-heading font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-card-hover transition-shadow h-full">
                    <div className="aspect-video bg-gradient-to-br from-brand-100 to-ice-100 overflow-hidden">
                      {r.featured_image_url && <img src={r.featured_image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-semibold line-clamp-2 group-hover:text-flame-600 transition-colors">{r.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2">{r.published_date && formatDate(r.published_date)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}