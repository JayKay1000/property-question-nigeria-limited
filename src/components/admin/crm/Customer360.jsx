import { useEffect, useState } from 'react';
import { Users, Building2, UserCheck, Search, MapPin, Mail, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const STAGE_COLORS = {
  lead: 'secondary', prospect: 'secondary', active_buyer: 'default',
  owner: 'default', repeat_buyer: 'default', advocate: 'default', churned: 'destructive',
};

export default function Customer360() {
  const [customers, setCustomers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Customer.list('-created_date', 200).catch(() => []),
      base44.entities.Organization.list('-created_date', 100).catch(() => []),
    ]).then(([c, o]) => { setCustomers(c); setOrganizations(o); }).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    !search || (c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
  );
  const active = customers.filter((c) => c.status === 'active');
  const vip = customers.filter((c) => c.status === 'vip' || c.lifecycle_stage === 'advocate');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{customers.length}</p><p className="text-xs text-muted-foreground">Total Customers</p></CardContent></Card>
        <Card><CardContent className="p-4"><UserCheck className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{active.length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><Building2 className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{organizations.length}</p><p className="text-xs text-muted-foreground">Organizations</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{vip.length}</p><p className="text-xs text-muted-foreground">VIP / Advocates</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-700" /> Customer Directory</span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="h-9 pl-9" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No customers found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 24).map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-heading text-sm font-bold text-brand-700">
                        {c.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.full_name}</p>
                        {c.reference_number && <p className="text-xs text-muted-foreground">{c.reference_number}</p>}
                      </div>
                    </div>
                    <Badge variant={STAGE_COLORS[c.lifecycle_stage] || 'secondary'} className="text-xs capitalize">{c.lifecycle_stage?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {c.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</p>}
                    {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</p>}
                    {c.city && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {c.city}, {c.state}</p>}
                  </div>
                  {(c.total_purchases > 0 || c.total_invested_ngn > 0) && (
                    <div className="mt-2 flex gap-2 border-t border-border pt-2">
                      {c.total_purchases > 0 && <Badge variant="outline" className="text-xs">{c.total_purchases} purchases</Badge>}
                      {c.total_invested_ngn > 0 && <Badge variant="outline" className="text-xs">₦{(c.total_invested_ngn / 1_000_000).toFixed(1)}M invested</Badge>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {filtered.length > 24 && <p className="mt-3 text-center text-xs text-muted-foreground">Showing 24 of {filtered.length} customers</p>}
        </CardContent>
      </Card>
    </div>
  );
}