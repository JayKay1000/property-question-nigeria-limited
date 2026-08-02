import { useEffect, useState } from 'react';
import { Megaphone, Mail, MessageSquare, Users, TrendingUp, MousePointer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CAMPAIGN_STATUS_COLORS = { draft: 'secondary', scheduled: 'secondary', active: 'default', paused: 'secondary', completed: 'default', cancelled: 'destructive' };

export default function MarketingIntelligence() {
  const [campaigns, setCampaigns] = useState([]);
  const [members, setMembers] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [smsCampaigns, setSmsCampaigns] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Campaign.list('-created_date', 100).catch(() => []),
      base44.entities.CampaignMember.list('-created_date', 200).catch(() => []),
      base44.entities.EmailCampaign.list('-created_date', 50).catch(() => []),
      base44.entities.SMSCampaign.list('-created_date', 50).catch(() => []),
      base44.entities.Referral.list('-created_date', 100).catch(() => []),
    ]).then(([c, m, e, s, r]) => { setCampaigns(c); setMembers(m); setEmailCampaigns(e); setSmsCampaigns(s); setReferrals(r); }).finally(() => setLoading(false));
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const totalSent = campaigns.reduce((s, c) => s + (c.total_sent || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversion_count || 0), 0);
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget_ngn || 0), 0);
  const totalRevenue = campaigns.reduce((s, c) => s + (c.revenue_generated_ngn || 0), 0);
  const conversionRate = totalSent > 0 ? ((totalConversions / totalSent) * 100).toFixed(1) : 0;
  const overallROI = totalBudget > 0 ? Math.round(((totalRevenue - totalBudget) / totalBudget) * 100) : 0;

  const byType = {};
  campaigns.forEach((c) => { byType[c.campaign_type] = (byType[c.campaign_type] || 0) + 1; });

  const memberByStatus = {};
  members.forEach((m) => { memberByStatus[m.status] = (memberByStatus[m.status] || 0) + 1; });

  const convertedReferrals = referrals.filter((r) => r.conversion_date);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Megaphone className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{campaigns.length}</p><p className="text-xs text-muted-foreground">Total Campaigns</p></CardContent></Card>
        <Card><CardContent className="p-4"><Mail className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{totalSent.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Sent</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{conversionRate}%</p><p className="text-xs text-muted-foreground">Conversion Rate</p></CardContent></Card>
        <Card><CardContent className="p-4"><MousePointer className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{overallROI}%</p><p className="text-xs text-muted-foreground">Overall ROI</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Megaphone className="h-4 w-4 text-brand-700" /> Campaign Performance</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : campaigns.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No campaigns created yet.</p>
          ) : (
            <div className="space-y-2">
              {campaigns.slice(0, 12).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><Megaphone className="h-4 w-4 text-brand-700" /></div>
                    <div><p className="text-sm font-medium">{c.campaign_name}</p><p className="text-xs text-muted-foreground capitalize">{c.campaign_type?.replace(/_/g, ' ')} · {c.total_sent || 0} sent</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.conversion_count > 0 && <Badge variant="default" className="text-xs">{c.conversion_count} conversions</Badge>}
                    <Badge variant={CAMPAIGN_STATUS_COLORS[c.status] || 'secondary'} className="text-xs capitalize">{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-flame-600" /> Email Campaign Metrics</CardTitle></CardHeader>
          <CardContent>
            {emailCampaigns.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No email campaigns.</p> : (
              <div className="space-y-2">
                {emailCampaigns.slice(0, 6).map((e) => (
                  <div key={e.id} className="rounded-lg border p-2.5">
                    <p className="truncate text-sm font-medium">{e.subject}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{e.total_sent || 0} sent</span>
                      <span className="text-success">{e.open_rate || 0}% opened</span>
                      <span className="text-info">{e.click_rate || 0}% clicked</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-brand-700" /> Referral Program</CardTitle></CardHeader>
          <CardContent>
            {referrals.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No referrals yet.</p> : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border p-2 text-center"><p className="font-heading text-lg font-bold">{referrals.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
                  <div className="rounded-lg border p-2 text-center"><p className="font-heading text-lg font-bold text-success">{convertedReferrals.length}</p><p className="text-xs text-muted-foreground">Converted</p></div>
                  <div className="rounded-lg border p-2 text-center"><p className="font-heading text-lg font-bold text-flame-600">{referrals.filter((r) => r.reward_status === 'issued').length}</p><p className="text-xs text-muted-foreground">Rewards</p></div>
                </div>
                {referrals.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-2 text-xs">
                    <span>{r.referrer_name} → {r.referred_customer_name || 'New Lead'}</span>
                    <Badge variant={r.conversion_date ? 'default' : 'secondary'} className="text-xs">{r.reward_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-info" /> Campaign Member Engagement</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(memberByStatus).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No campaign members yet.</p> : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(memberByStatus).map(([status, count]) => (
                <div key={status} className="flex flex-col items-center rounded-lg border p-3 px-6">
                  <span className="font-heading text-2xl font-bold">{count}</span>
                  <span className="text-xs capitalize text-muted-foreground">{status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}