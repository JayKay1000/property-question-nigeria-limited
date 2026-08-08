import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wallet, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import DashboardModuleShell, { formatNGN, StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';

export default function FinanceManager() {
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Invoice.list('-created_date', 50).catch(() => []),
      base44.entities.Receipt.list('-created_date', 50).catch(() => []),
      base44.entities.Commission.list('-created_date', 50).catch(() => []),
    ]).then(([i, r, c]) => { setInvoices(i); setReceipts(r); setCommissions(c); }).finally(() => setLoading(false));
  }, []);

  const revenue = receipts.filter((r) => r.status === 'confirmed').reduce((s, r) => s + (r.amount || 0), 0);
  const outstanding = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);
  const pendingPayments = invoices.filter((i) => ['sent', 'partially_paid', 'overdue'].includes(i.status)).length;
  const commissionsPaid = commissions.filter((c) => c.status === 'paid').reduce((s, c) => s + (c.commission_amount || 0), 0);

  const stats = useMemo(() => [
    { label: 'Revenue (Confirmed)', value: formatNGN(revenue), icon: Wallet, color: 'success' },
    { label: 'Pending Payments', value: pendingPayments, icon: Clock, color: 'warning' },
    { label: 'Outstanding', value: formatNGN(outstanding), icon: AlertCircle, color: 'error' },
    { label: 'Commissions Paid', value: formatNGN(commissionsPaid), icon: TrendingUp, color: 'flame' },
  ], [invoices, receipts, commissions]);

  return (
    <DashboardModuleShell title="Finance" description="Track invoices, receipts, commissions, and revenue." icon={Wallet} stats={stats} loading={loading}>
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Recent Invoices</h3>
          {invoices.length === 0 ? (
            <EmptyState icon={Wallet} title="No invoices" description="Invoices will appear here once generated." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="px-4 py-3 font-medium">Invoice</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Due</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.slice(0, 10).map((i) => (
                      <tr key={i.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-brand-900">{i.invoice_number || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{i.customer_name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatNGN(i.total_amount)}</td>
                        <td className="px-4 py-3"><StatusPill status={i.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(i.due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Recent Receipts</h3>
          {receipts.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No receipts" description="Payment receipts will appear here." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="px-4 py-3 font-medium">Receipt</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Method</th><th className="px-4 py-3 font-medium">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {receipts.slice(0, 10).map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-brand-900">{r.receipt_number || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.customer_name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatNGN(r.amount)}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{(r.payment_method || '—').replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(r.payment_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardModuleShell>
  );
}