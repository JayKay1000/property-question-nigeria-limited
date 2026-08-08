import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, Building2, Users, TrendingUp, Wallet } from 'lucide-react';
import DashboardModuleShell, { formatNGN } from '@/components/dashboard/DashboardModuleShell';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = ['hsl(214 100% 12%)', 'hsl(29 100% 50%)', 'hsl(152 63% 42%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(0 72% 45%)'];

export default function ReportsCenter() {
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.list('-created_date', 200).catch(() => []),
      base44.entities.Lead.list('-created_date', 200).catch(() => []),
      base44.entities.Project.list('-created_date', 200).catch(() => []),
      base44.entities.Receipt.list('-created_date', 200).catch(() => []),
    ]).then(([p, l, pr, r]) => { setProperties(p); setLeads(l); setProjects(pr); setReceipts(r); }).finally(() => setLoading(false));
  }, []);

  const leadByStatus = useMemo(() => {
    const counts = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [leads]);

  const propsByCity = useMemo(() => {
    const counts = {};
    properties.forEach((p) => { const c = p.city || 'Unknown'; counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [properties]);

  const projectsByStatus = useMemo(() => {
    const counts = {};
    projects.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [projects]);

  const revenueByMonth = useMemo(() => {
    const months = {};
    receipts.filter((r) => r.status === 'confirmed' && r.payment_date).forEach((r) => {
      const d = new Date(r.payment_date);
      const key = d.toLocaleDateString('en-GB', { month: 'short' });
      months[key] = (months[key] || 0) + (r.amount || 0);
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [receipts]);

  const totalRevenue = receipts.filter((r) => r.status === 'confirmed').reduce((s, r) => s + (r.amount || 0), 0);

  const stats = useMemo(() => [
    { label: 'Total Properties', value: properties.length, icon: Building2, color: 'flame' },
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'info' },
    { label: 'Active Projects', value: projects.filter((p) => p.status !== 'completed').length, icon: TrendingUp, color: 'warning' },
    { label: 'Total Revenue', value: formatNGN(totalRevenue), icon: Wallet, color: 'success' },
  ], [properties, leads, projects, totalRevenue]);

  const chartCard = (title, children) => (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h3 className="mb-4 font-heading text-base font-bold text-brand-900">{title}</h3>
      {children}
    </div>
  );

  return (
    <DashboardModuleShell title="Reports & Analytics" description="Business intelligence across properties, leads, projects, and revenue." icon={BarChart3} stats={stats} loading={loading}>
      <div className="grid gap-6 lg:grid-cols-2">
        {chartCard('Leads by Status',
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leadByStatus} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 14% 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(214 100% 12%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartCard('Properties by City',
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={propsByCity} layout="vertical" margin={{ top: 4, right: 4, bottom: 4, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220 14% 91%)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(29 100% 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartCard('Projects by Status',
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={projectsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {projectsByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {chartCard('Revenue by Month',
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMonth} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 14% 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatNGN(v)} />
              <Bar dataKey="value" fill="hsl(152 63% 42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardModuleShell>
  );
}