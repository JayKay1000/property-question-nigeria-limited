/**
 * Audit Logs — Security Event Viewer
 *
 * Displays, filters, and searches audit log entries.
 * Accessible to users with security.audit_logs permission.
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollText, ArrowLeft, Search, RefreshCw, CheckCircle2, XCircle, Ban } from 'lucide-react';

const CATEGORIES = [
  'auth', 'user_management', 'role_management', 'property_management',
  'project_management', 'buy2flip', 'construction', 'security',
  'approval', 'document', 'system', 'data_access',
];

const OUTCOME_ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  failure: <XCircle className="h-4 w-4 text-error" />,
  denied: <Ban className="h-4 w-4 text-amber-600" />,
};

const OUTCOME_BADGES = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failure: 'bg-error/10 text-error border-error/20',
  denied: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AuditLogs() {
  const rbac = useRBAC();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AuditLog.list('-created_date', 200);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
      if (outcomeFilter !== 'all' && log.outcome !== outcomeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          log.action, log.user_name, log.user_email, log.resource,
          log.resource_name, log.details,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, categoryFilter, outcomeFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-NG', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 section-pad py-8">
      <div className="container-wide max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ScrollText className="h-4 w-4" />
              Security & Compliance
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold text-brand-900">Audit Logs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Security-sensitive event history · {filtered.length} of {logs.length} entries
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/rbac">
                <ArrowLeft className="mr-2 h-4 w-4" /> RBAC Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-border/60">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, resource…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Log Table */}
        <Card className="border-border/60">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ScrollText className="mb-2 h-8 w-8" />
                <p>No audit log entries found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-left">
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase text-muted-foreground">Action</th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase text-muted-foreground">User</th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase text-muted-foreground">Resource</th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase text-muted-foreground">Outcome</th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase text-muted-foreground">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log) => (
                      <tr key={log.id} className="border-b border-border/40 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-medium text-brand-900">{log.action}</div>
                          {log.details && (
                            <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{log.details}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-brand-900">{log.user_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{log.user_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-brand-900">{log.resource || '—'}</div>
                          {log.resource_name && (
                            <div className="text-xs text-muted-foreground">{log.resource_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${OUTCOME_BADGES[log.outcome] || ''}`}>
                            {OUTCOME_ICONS[log.outcome]}
                            {log.outcome}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.created_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}