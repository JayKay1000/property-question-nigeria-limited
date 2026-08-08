import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, FileText, Send, BarChart3 } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState } from '@/components/dashboard/DashboardModuleShell';
import { Link } from 'react-router-dom';

export default function MarketingManager() {
  const [posts, setPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.BlogPost.list('-created_date', 20).catch(() => []),
      base44.entities.NewsletterSubscriber.list('-created_date', 20).catch(() => []),
      base44.entities.UTMCampaign.list('-created_date', 20).catch(() => []),
    ]).then(([b, n, c]) => { setPosts(b); setSubscribers(n); setCampaigns(c); }).finally(() => setLoading(false));
  }, []);

  const activeSubs = subscribers.filter((s) => s.status === 'subscribed').length;
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);

  const stats = useMemo(() => [
    { label: 'Published Posts', value: posts.filter((p) => p.status === 'published').length, icon: FileText, color: 'flame' },
    { label: 'Subscribers', value: activeSubs, icon: Send, color: 'success' },
    { label: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'active').length, icon: Megaphone, color: 'warning' },
    { label: 'Total Clicks', value: totalClicks, icon: BarChart3, color: 'info' },
  ], [posts, subscribers, campaigns]);

  return (
    <DashboardModuleShell title="Marketing" description="Manage blog content, newsletters, and marketing campaigns." icon={Megaphone} stats={stats} loading={loading}>
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Blog Posts</h3>
          {posts.length === 0 ? (
            <EmptyState icon={FileText} title="No blog posts" description="Published articles will appear here." />
          ) : (
            <div className="grid gap-3">
              {posts.slice(0, 8).map((p) => (
                <Link key={p.id} to={p.slug ? `/blog/${p.slug}` : '/blog'} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-brand-900">{p.title || 'Untitled'}</p>
                      <StatusPill status={p.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{(p.category || '').replace(/_/g, ' ')} {p.author_name ? `· ${p.author_name}` : ''}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">{p.view_count || 0} views</div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">UTM Campaigns</h3>
          {campaigns.length === 0 ? (
            <EmptyState icon={Megaphone} title="No campaigns" description="Marketing campaigns will appear here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {campaigns.slice(0, 6).map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brand-900">{c.campaign_name || 'Unnamed'}</p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{c.utm_source} · {c.utm_medium}</p>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{c.clicks || 0} clicks</span>
                    <span>{c.conversions || 0} conversions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardModuleShell>
  );
}