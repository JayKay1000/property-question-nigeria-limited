import { useEffect, useState } from 'react';
import { Mail, Phone, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VerificationConsole() {
  const [emailPending, setEmailPending] = useState([]);
  const [phonePending, setPhonePending] = useState([]);
  const [agentQueue, setAgentQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.EmailVerification.filter({ verification_status: 'pending' }, '-created_date', 20).catch(() => []),
      base44.entities.PhoneVerification.filter({ verification_result: 'pending' }, '-created_date', 20).catch(() => []),
      base44.entities.Agent.filter({ verification_status: 'pending' }, '-created_date', 20).catch(() => []),
    ]).then(([emails, phones, agents]) => {
      setEmailPending(emails);
      setPhonePending(phones);
      setAgentQueue(agents);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <Mail className="h-5 w-5 text-flame-600" />
          <p className="mt-2 font-heading text-2xl font-bold">{emailPending.length}</p>
          <p className="text-xs text-muted-foreground">Email Verifications Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <Phone className="h-5 w-5 text-info" />
          <p className="mt-2 font-heading text-2xl font-bold">{phonePending.length}</p>
          <p className="text-xs text-muted-foreground">Phone Verifications Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <UserCheck className="h-5 w-5 text-brand-700" />
          <p className="mt-2 font-heading text-2xl font-bold">{agentQueue.length}</p>
          <p className="text-xs text-muted-foreground">Agent Verification Queue</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-flame-600" /> Email Verification Queue</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : emailPending.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-success/40" /><p className="mt-2 text-sm text-muted-foreground">No pending email verifications.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {emailPending.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{e.email}</p><p className="text-xs text-muted-foreground">Resends: {e.resend_count || 0}</p></div>
                    <Badge variant="outline" className="gap-1 text-xs"><Clock className="h-3 w-3" />Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-info" /> Phone Verification Queue</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : phonePending.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-success/40" /><p className="mt-2 text-sm text-muted-foreground">No pending phone verifications.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {phonePending.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{p.phone_number}</p><p className="text-xs text-muted-foreground">Attempts: {p.attempts || 0}/{p.max_attempts || 5}</p></div>
                    <Badge variant="outline" className="gap-1 text-xs"><Clock className="h-3 w-3" />Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><UserCheck className="h-4 w-4 text-brand-700" /> Agent Verification Queue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : agentQueue.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="h-10 w-10 text-success/40" /><p className="mt-2 text-sm text-muted-foreground">No agents pending verification.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agentQueue.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium">{a.full_name}</p><p className="text-xs text-muted-foreground">{a.email} · {a.specialization || 'General'}</p></div>
                  <div className="flex items-center gap-2">
                    {a.license_number && <Badge variant="outline" className="text-xs">Licensed</Badge>}
                    <Badge className="bg-warning/10 text-warning gap-1 text-xs"><Clock className="h-3 w-3" />Pending Review</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}