import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Megaphone, GitFork, Link2, Target, DollarSign, Award, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { campaignStatusConfig, campaignTypeLabels, keywordStatusConfig, formatCurrency, formatNumber, calcRoas } from '@/lib/seo-utils';

export default function MarketingOverview() {
  const [data, setData] = useState({ keywords: [], campaigns: [], redirects: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [keywords, campaigns, redirects, links] = await Promise.all([
          base44.entities.SEOKeyword.list('-created_date', 200),
          base44.entities.UTMCampaign.list('-created_date', 200),
          base44.entities.URLRedirect.list('-created_date', 200),
          base44.entities.InternalLink.list('-created_date', 200),
        ]);
        setData({ keywords, campaigns, redirects, links });
      } catch { /* */ }
      setLoading(false);
    })();
  }, []);

  const rankingKw = data.keywords.filter(k => k.status === 'ranking').length;
  const notRankingKw = data.keywords.filter(k => k.status === 'not_ranking').length;
  const opportunityKw = data.keywords.filter(k => k.status === 'opportunity').length;
  const activeCampaigns = data.campaigns.filter(c => c.status === 'active').length;
  const totalSpend = data.campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalConversions = data.campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalValue = data.campaigns.reduce((s, c) => s + (c.conversion_value || 0), 0);
  const avgRoas = totalSpend > 0 ? (totalValue / totalSpend).toFixed(2) : '0';
  const activeRedirects = data.redirects.filter(r => r.status === 'active').length;
  const redirectHits = data.redirects.reduce((s, r) => s + (r.hit_count || 0), 0);
  const activeLinks = data.links.filter(l => l.status === 'active').length;
  const brokenLinks = data.links.filter(l => l.status === 'broken').length;

  const topCampaigns = [...data.campaigns]
    .map(c => ({ ...c, roas: calcRoas(c.spend, c.conversion_value), conversions: c.conversions || 0 }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5);

  const stats = [
    { label: 'Tracked Keywords', value: data.keywords.length, icon: Search, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Ranking Keywords', value: rankingKw, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Opportunities', value: opportunityKw, icon: Target, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Active Campaigns', value: activeCampaigns, icon: Megaphone, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Total Ad Spend', value: formatCurrency(totalSpend), icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Conversions', value: totalConversions, icon: Award, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Avg ROAS', value: `${avgRoas}x`, icon: TrendingUp, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Active Redirects', value: activeRedirects, icon: GitFork, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Redirect Hits', value: formatNumber(redirectHits), icon: GitFork, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Internal Links', value: activeLinks, icon: Link2, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Broken Links', value: brokenLinks, icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Not Ranking', value: notRankingKw, icon: TrendingDown, color: 'text-muted-foreground', bg: 'bg-muted' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4.5 h-4.5 ${s.color}`} /></div>
            <p className="text-xl font-heading font-bold">{loading ? '…' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4">Top Performing Campaigns</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && topCampaigns.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No campaigns yet.</p>}
            {!loading && topCampaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.campaign_name}</p>
                  <p className="text-xs text-muted-foreground">{campaignTypeLabels[c.campaign_type]} · {c.conversions} conversions · {formatCurrency(c.spend)} spent</p>
                </div>
                <Badge variant="secondary" className={c.roas >= 1 ? 'bg-success/10 text-success border-0' : 'bg-error/10 text-error border-0'}>{c.roas}x ROAS</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4">Keyword Status Distribution</h3>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && Object.entries(keywordStatusConfig).map(([key, cfg]) => {
              const count = data.keywords.filter(k => k.status === key).length;
              const pct = data.keywords.length > 0 ? (count / data.keywords.length) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1"><span className="flex items-center gap-2"><span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.className.split(' ')[0]}`} />{cfg.label}</span><span className="font-medium">{count}</span></div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${cfg.className.split(' ')[0]}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}