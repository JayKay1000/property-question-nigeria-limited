import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, Search, Scale } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const APPROVAL_COLORS = { not_submitted: 'secondary', pending: 'secondary', in_review: 'default', approved: 'default', rejected: 'destructive', revision_required: 'destructive', expired: 'secondary' };
const CONFIDENTIALITY_COLORS = { public: 'secondary', internal: 'secondary', confidential: 'default', restricted: 'destructive', legal_hold: 'destructive' };

export default function DocumentControl() {
  const [documents, setDocuments] = useState([]);
  const [legalDocs, setLegalDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Document.list('-created_date', 200).catch(() => []),
      base44.entities.LegalDocument.list('-created_date', 100).catch(() => []),
    ]).then(([d, l]) => { setDocuments(d); setLegalDocs(l); }).finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter((d) =>
    !search || (d.title?.toLowerCase().includes(search.toLowerCase()) || d.document_reference?.toLowerCase().includes(search.toLowerCase()))
  );
  const pendingApproval = documents.filter((d) => ['pending', 'in_review', 'revision_required'].includes(d.approval_status));
  const approvedDocs = documents.filter((d) => d.approval_status === 'approved');
  const expiredDocs = documents.filter((d) => d.expiry_date && new Date(d.expiry_date) < new Date());
  const legalHold = documents.filter((d) => d.is_legal_hold);
  const unverifiedLegal = legalDocs.filter((l) => !['verified'].includes(l.verification_status));

  const byType = {};
  documents.forEach((d) => { byType[d.document_type] = (byType[d.document_type] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><FileText className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">Total Documents</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{pendingApproval.length}</p><p className="text-xs text-muted-foreground">Pending Approval</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle2 className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{approvedDocs.length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertTriangle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{expiredDocs.length}</p><p className="text-xs text-muted-foreground">Expired</p></CardContent></Card>
      </div>

      {legalHold.length > 0 && (
        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive"><Scale className="h-5 w-5" /><p className="font-medium">{legalHold.length} documents under Legal Hold — cannot be modified or deleted</p></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-700" /> Document Repository</span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="h-9 pl-9" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No documents found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.slice(0, 25).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><FileText className="h-4 w-4 text-brand-700" /></div>
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.document_reference} · {d.document_type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.is_legal_hold && <Badge variant="destructive" className="text-xs">Legal Hold</Badge>}
                    <Badge variant={CONFIDENTIALITY_COLORS[d.confidentiality_level] || 'secondary'} className="text-xs capitalize">{d.confidentiality_level?.replace(/_/g, ' ')}</Badge>
                    <Badge variant={APPROVAL_COLORS[d.approval_status] || 'secondary'} className="text-xs capitalize">{d.approval_status?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {unverifiedLegal.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Scale className="h-4 w-4 text-flame-600" /> Legal Documents Needing Verification</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {unverifiedLegal.slice(0, 10).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border p-2.5">
                <div><p className="text-sm font-medium">{l.legal_document_type?.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{l.owner_name || ''} · {l.document_number || 'No ref'}</p></div>
                <Badge variant="secondary" className="text-xs capitalize">{l.verification_status?.replace(/_/g, ' ')}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {Object.keys(byType).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-brand-700" /> Documents by Type</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => <Badge key={type} variant="secondary" className="text-xs capitalize">{type?.replace(/_/g, ' ')} ({count})</Badge>)}</div></CardContent>
        </Card>
      )}
    </div>
  );
}