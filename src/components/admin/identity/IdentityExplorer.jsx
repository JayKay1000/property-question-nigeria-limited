import { useEffect, useState } from 'react';
import { Search, Users, Mail, ShieldCheck, KeyRound, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function IdentityExplorer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    base44.entities.User.list()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    Promise.all([
      base44.entities.UserStatusHistory.filter({ user_id: selected.id }, '-created_date', 20).catch(() => []),
      base44.entities.UserRole.filter({ user_id: selected.id }).catch(() => []),
    ]).then(([history, roles]) => {
      setStatusHistory(history);
      setUserRoles(roles);
    });
  }, [selected]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q);
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-brand-700" /> Identities ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, role..." className="pl-9" />
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading identities...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No identities found.</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted ${selected?.id === u.id ? 'bg-muted' : ''}`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                    {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.full_name || 'Unnamed'}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{u.role || 'user'}</Badge>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Identity Timeline</span>
            {selected && (
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">Select an identity to view their complete timeline.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-brand-700 text-white text-lg">
                    {(selected.full_name || selected.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading text-lg font-bold">{selected.full_name || 'Unnamed User'}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selected.email}</span>
                    <Badge variant={selected.role === 'admin' ? 'default' : 'secondary'}>{selected.role || 'user'}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><KeyRound className="h-4 w-4 text-flame-600" /> Assigned Roles</h4>
                {userRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No role assignments recorded.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((r) => (
                      <Badge key={r.id} variant={r.is_primary ? 'default' : 'secondary'} className="gap-1">
                        {r.role_name || r.role_key}{r.is_primary && ' (Primary)'}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-flame-600" /> Status History</h4>
                {statusHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status changes recorded.</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-brand-100 pl-4">
                    {statusHistory.map((s, i) => (
                      <div key={s.id || i} className="relative">
                        <span className="absolute -left-[1.4rem] top-1 h-2 w-2 rounded-full bg-flame-500" />
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{s.status}</Badge>
                          <span className="text-xs text-muted-foreground">{s.reason || 'No reason provided'}</span>
                        </div>
                        {s.changed_by_name && <p className="mt-0.5 text-xs text-muted-foreground">by {s.changed_by_name}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}