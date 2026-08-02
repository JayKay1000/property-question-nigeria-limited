import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Document.list('-created_date', 50)
      .then(setDocuments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = documents.filter((d) => d.verification_status === 'pending' || d.verification_status === 'unverified');
  const verified = documents.filter((d) => d.verification_status === 'verified');
  const rejected = documents.filter((d) => d.verification_status === 'rejected');

  const statusIcon = (s) => {
    if (s === 'verified') return <CheckCircle className="h-3.5 w-3.5 text-success" />;
    if (s === 'rejected') return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    return <Clock className="h-3.5 w-3.5 text-warning" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><FileText className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">Total Documents</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{pending.length}</p><p className="text-xs text-muted-foreground">Pending Verification</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{verified.length}</p><p className="text-xs text-muted-foreground">Verified</p></CardContent></Card>
        <Card><CardContent className="p-4"><XCircle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{rejected.length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> Verification Queue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : pending.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center"><CheckCircle className="h-10 w-10 text-success/40" /><p className="mt-2 text-sm text-muted-foreground">No documents pending verification.</p></div>
          ) : (
            <div className="space-y-2">
              {pending.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground capitalize">{(doc.document_type || '').replace(/_/g, ' ')} · {doc.file_name || ''}</p></div>
                  </div>
                  <Badge variant="outline" className="gap-1 text-xs">{statusIcon(doc.verification_status)} {doc.verification_status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-brand-700" /> Recently Verified</CardTitle></CardHeader>
        <CardContent>
          {verified.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No verified documents yet.</p> : (
            <div className="space-y-2">
              {verified.slice(0, 10).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground capitalize">{(doc.document_type || '').replace(/_/g, ' ')}</p></div>
                  </div>
                  {doc.verified_at && <span className="text-xs text-muted-foreground">{new Date(doc.verified_at).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}