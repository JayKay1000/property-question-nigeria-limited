import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, Search, UserCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import AgentApprovalTable from '@/components/admin/agents/AgentApprovalTable';
import AgentApprovalDialog from '@/components/admin/agents/AgentApprovalDialog';

const TABS = [
  { key: 'pending', label: 'Pending', filter: (a) => a.status === 'pending' },
  { key: 'under_review', label: 'Under Review', filter: (a) => a.status === 'under_review' },
  { key: 'approved', label: 'Approved', filter: (a) => a.status === 'active' },
  { key: 'rejected', label: 'Rejected', filter: (a) => a.verification_status === 'rejected' },
  { key: 'all', label: 'All', filter: () => true },
];

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function AgentApprovals() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    base44.entities.Agent.list('-created_date', 300)
      .catch(() => [])
      .then((list) => setAgents(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const cfg = TABS.find((t) => t.key === tab) || TABS[0];
    let result = agents.filter(cfg.filter);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.agent_code?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [agents, tab, query]);

  const stats = {
    pending: agents.filter((a) => a.status === 'pending').length,
    under_review: agents.filter((a) => a.status === 'under_review').length,
    active: agents.filter((a) => a.status === 'active').length,
    rejected: agents.filter((a) => a.verification_status === 'rejected').length,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Agent Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review pending agent registrations, verify documents, and approve or reject applications.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Clock} label="Pending" value={stats.pending} tone="text-amber-500" />
        <StatCard icon={Loader2} label="Under Review" value={stats.under_review} tone="text-blue-500" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.active} tone="text-emerald-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="text-rose-500" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === t.key ? 'bg-brand-900 text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, code…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          <p className="mt-3 text-sm text-muted-foreground">Loading applications…</p>
        </div>
      ) : (
        <AgentApprovalTable agents={filtered} onReview={setSelected} />
      )}

      {/* Review dialog */}
      <AgentApprovalDialog
        agent={selected}
        onClose={() => setSelected(null)}
        onDecided={() => { setSelected(null); load(); }}
      />
    </div>
  );
}