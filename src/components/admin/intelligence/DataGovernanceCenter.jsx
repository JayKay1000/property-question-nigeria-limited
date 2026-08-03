import { useEffect, useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, Copy, RefreshCw, FileText, Archive } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DataGovernanceCenter() {
  const [quality, setQuality] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [syncs, setSyncs] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.DataQuality.list('-assessment_date', 50).catch(() => []),
      base44.entities.ValidationError.list('-created_date', 50).catch(() => []),
      base44.entities.DuplicateRecord.list('-created_date', 50).catch(() => []),
      base44.entities.SyncStatus.list('-created_date', 50).catch(() => []),
      base44.entities.RetentionPolicy.list('-sort_order', 50).catch(() => []),
      base44.entities.ReportDefinition.list('-sort_order', 50).catch(() => []),
    ]).then(([q, v, d, s, p, r]) => { setQuality(q); setValidationErrors(v); setDuplicates(d); setSyncs(s); setPolicies(p); setReports(r); }).finally(() => setLoading(false));
  }, []);

  const openValidationErrors = validationErrors.filter((v) => v.resolution_status === 'open');
  const unresolvedDuplicates = duplicates.filter((d) => !d.is_resolved);
  const failingSyncs = syncs.filter((s) => ['failed', 'error', 'paused'].includes(s.status));
  const avgQualityScore = quality.length > 0 ? Math.round(quality.reduce((sum, q) => sum + (q.quality_score || 0), 0) / quality.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Database className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{avgQualityScore}%</p><p className="text-xs text-muted-foreground">Avg Quality Score</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertTriangle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{openValidationErrors.length}</p><p className="text-xs text-muted-foreground">Validation Errors</p></CardContent></Card>
        <Card><CardContent className="p-4"><Copy className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{unresolvedDuplicates.length}</p><p className="text-xs text-muted-foreground">Duplicate Records</p></CardContent></Card>
        <Card><CardContent className="p-4"><RefreshCw className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{failingSyncs.length}</p><p className="text-xs text-muted-foreground">Failing Syncs</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-brand-700" /> Data Quality Scorecards</CardTitle></CardHeader>
        <CardContent>
          {quality.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No quality assessments. Governance will populate scorecards.</p> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quality.map((q) => (
                <div key={q.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{q.entity_name}</span>
                    <Badge variant={q.quality_score > 80 ? 'default' : q.quality_score > 60 ? 'secondary' : 'destructive'} className="text-xs">{q.quality_score}%</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>Complete: {q.completeness_percentage?.toFixed(0) || 0}%</span>
                    <span>Unique: {q.uniqueness_percentage?.toFixed(0) || 0}%</span>
                    <span>Valid: {q.validity_percentage?.toFixed(0) || 0}%</span>
                    <span>Consistent: {q.consistency_percentage?.toFixed(0) || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-destructive" /> Validation Errors</CardTitle></CardHeader>
          <CardContent>
            {validationErrors.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No validation errors.</p> : (
              <div className="space-y-2">
                {validationErrors.slice(0, 10).map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{v.validation_rule}</p><p className="text-xs text-muted-foreground">{v.entity_name} · {v.field_name}</p></div>
                    <Badge variant={v.resolution_status === 'resolved' ? 'default' : 'destructive'} className="text-xs capitalize">{v.resolution_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Copy className="h-4 w-4 text-warning" /> Duplicate Records</CardTitle></CardHeader>
          <CardContent>
            {duplicates.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No duplicates detected.</p> : (
              <div className="space-y-2">
                {duplicates.slice(0, 10).map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{d.entity_name}</p><p className="text-xs text-muted-foreground">{d.similarity_score}% match · {d.match_fields?.join(', ')}</p></div>
                    <Badge variant={d.is_resolved ? 'default' : 'secondary'} className="text-xs capitalize">{d.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><RefreshCw className="h-4 w-4 text-info" /> Synchronization Status</CardTitle></CardHeader>
          <CardContent>
            {syncs.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No sync integrations configured.</p> : (
              <div className="space-y-2">
                {syncs.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{s.source_system} → {s.target_system}</p><p className="text-xs text-muted-foreground">{s.entity_name} · {s.records_processed || 0} records</p></div>
                    <Badge variant={s.status === 'completed' ? 'default' : s.status === 'failed' || s.status === 'error' ? 'destructive' : 'secondary'} className="text-xs capitalize">{s.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Archive className="h-4 w-4 text-brand-700" /> Retention Policies</CardTitle></CardHeader>
          <CardContent>
            {policies.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No retention policies defined.</p> : (
              <div className="space-y-2">
                {policies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{p.policy_name}</p><p className="text-xs text-muted-foreground">{p.entity_name} · {p.retention_period_days} days · {p.compliance_type}</p></div>
                    {p.is_immutable && <Badge variant="default" className="text-xs">Immutable</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {reports.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-brand-700" /> Report Catalog</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{reports.map((r) => <Badge key={r.id} variant="secondary" className="text-xs">{r.report_name} ({r.category})</Badge>)}</div></CardContent>
        </Card>
      )}
    </div>
  );
}