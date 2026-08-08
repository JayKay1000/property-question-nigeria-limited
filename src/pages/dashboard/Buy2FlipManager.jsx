import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, ExternalLink, Users, Clock, CheckCircle, Wallet } from 'lucide-react';
import DashboardModuleShell, { formatNGN, StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';
import RedirectOverlay from '@/components/buy2flip/RedirectOverlay';
import { Button } from '@/components/ui/button';

const BUY2FLIP_URL = 'https://www.buy2flip.net';

export default function Buy2FlipManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    base44.entities.Lead.filter({ source: 'buy2flip' }, '-created_date', 100)
      .then(setLeads).catch(() => setLeads([])).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const converted = leads.filter((l) => l.status === 'converted');
    const pending = leads.filter((l) => !['converted', 'lost'].includes(l.status));
    const committed = converted.reduce((s, l) => s + (l.conversion_value_ngn || 0), 0);
    return [
      { label: 'Participants', value: leads.length, icon: Users, color: 'flame' },
      { label: 'Pending Review', value: pending.length, icon: Clock, color: 'warning' },
      { label: 'Converted', value: converted.length, icon: CheckCircle, color: 'success' },
      { label: 'Total Committed', value: formatNGN(committed), icon: Wallet, color: 'info' },
    ];
  }, [leads]);

  return (
    <DashboardModuleShell
      title="Buy2Flip"
      description="Manage Buy2Flip participants, applications, and maturity events."
      icon={TrendingUp}
      stats={stats}
      loading={loading}
      actions={<Button className="bg-flame-500 hover:bg-flame-600" onClick={() => setShowOverlay(true)}><ExternalLink className="mr-1.5 h-4 w-4" /> Open Buy2Flip Portal</Button>}
    >
      {leads.length === 0 ? (
        <EmptyState icon={Users} title="No Buy2Flip participants yet" description="Buy2Flip enquiries and applications will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Interest</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-brand-900">{l.full_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.email || l.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.interest_type || 'Buy2Flip'}</td>
                    <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{l.conversion_value_ngn ? formatNGN(l.conversion_value_ngn) : '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(l.created_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <RedirectOverlay
        show={showOverlay}
        onConfirm={() => { window.open(BUY2FLIP_URL, '_blank', 'noopener,noreferrer'); setShowOverlay(false); }}
        onCancel={() => setShowOverlay(false)}
      />
    </DashboardModuleShell>
  );
}