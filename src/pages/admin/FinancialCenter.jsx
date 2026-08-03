import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Receipt, FileText, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RevenueDashboard from '@/components/admin/financial/RevenueDashboard';
import CommissionTable from '@/components/admin/financial/CommissionTable';
import InvoiceTable from '@/components/admin/financial/InvoiceTable';
import ReceiptTable from '@/components/admin/financial/ReceiptTable';
import { formatCurrency } from '@/lib/financial-utils';
import PageHeader from '@/components/ui/PageHeader';

export default function FinancialCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [commissions, setCommissions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, commissionsPayable: 0, outstanding: 0, receiptsThisMonth: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [comData, invData, recData] = await Promise.all([
        base44.entities.Commission.list('-created_date', 100),
        base44.entities.Invoice.list('-created_date', 100),
        base44.entities.Receipt.list('-created_date', 100),
      ]);
      setCommissions(comData || []);
      setInvoices(invData || []);
      setReceipts(recData || []);

      const totalRevenue = (recData || []).reduce((sum, r) => sum + (r.amount || 0), 0);
      const commissionsPayable = (comData || []).filter(c => c.status === 'pending' || c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const outstanding = (invData || []).filter(i => i.status === 'sent' || i.status === 'overdue' || i.status === 'partially_paid').reduce((sum, i) => sum + (i.balance_due || 0), 0);
      const now = new Date();
      const receiptsThisMonth = (recData || []).filter(r => {
        if (!r.payment_date) return false;
        const d = new Date(r.payment_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((sum, r) => sum + (r.amount || 0), 0);

      setStats({ totalRevenue, commissionsPayable, outstanding, receiptsThisMonth });
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApproveCommission = async (commission) => {
    try {
      await base44.entities.Commission.update(commission.id, { status: 'approved', approval_date: new Date().toISOString().split('T')[0], approved_by_name: 'Admin' });
      toast({ title: 'Commission approved', description: `${commission.agent_name} — ${formatCurrency(commission.commission_amount)}` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve commission', variant: 'destructive' });
    }
  };

  const handlePayCommission = async (commission) => {
    try {
      const netAmount = commission.commission_amount - (commission.tax_deduction || 0);
      await base44.entities.Commission.update(commission.id, {
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        net_amount: netAmount,
      });
      toast({ title: 'Commission paid', description: `${commission.agent_name} — ${formatCurrency(netAmount)}` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to mark commission as paid', variant: 'destructive' });
    }
  };

  const handleGenerateReceipt = async (invoice) => {
    try {
      const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
      const receiptCode = `RCP-${invoice.invoice_code}`;
      await base44.entities.Receipt.create({
        receipt_number: receiptNumber,
        receipt_code: receiptCode,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email,
        amount: invoice.amount_paid || invoice.total_amount,
        currency: invoice.currency || 'NGN',
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        payment_time: new Date().toISOString(),
        status: 'confirmed',
        received_by_name: 'Admin',
        verified: true,
      });
      toast({ title: 'Receipt generated', description: `${receiptNumber} for ${invoice.customer_name}` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to generate receipt', variant: 'destructive' });
    }
  };

  const summaryCards = [
    { label: 'Total Commissions', value: commissions.length, subtext: `${commissions.filter(c => c.status === 'pending').length} pending`, icon: TrendingUp, color: 'text-flame-600' },
    { label: 'Total Invoices', value: invoices.length, subtext: `${invoices.filter(i => i.status === 'overdue').length} overdue`, icon: FileText, color: 'text-primary' },
    { label: 'Total Receipts', value: receipts.length, subtext: `${receipts.filter(r => !r.verified).length} unverified`, icon: Receipt, color: 'text-info' },
    { label: 'Avg Commission', value: formatCurrency(commissions.length ? commissions.reduce((s, c) => s + (c.commission_amount || 0), 0) / commissions.length : 0), subtext: 'per transaction', icon: DollarSign, color: 'text-success' },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Enterprise Financial & Commission Platform"
        subtitle="Agent commissions, invoicing, receipts, payment tracking & revenue intelligence"
        icon={DollarSign}
        actions={<><Button variant="default" onClick={() => toast({ title: 'Invoice Builder', description: 'Invoice creation form coming soon' })}><Plus className="h-4 w-4" /> New Invoice</Button><Button variant="outline" onClick={() => toast({ title: 'Commission Entry', description: 'Commission creation coming soon' })}><TrendingUp className="h-4 w-4" /> New Commission</Button></>}
      />

      <RevenueDashboard stats={stats} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-xl font-bold font-heading">{card.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.subtext}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Commissions</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5"><FileText className="h-4 w-4" /> Invoices</TabsTrigger>
          <TabsTrigger value="receipts" className="gap-1.5"><Receipt className="h-4 w-4" /> Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Commissions</CardTitle></CardHeader>
              <CardContent>
                {loading ? <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
                  : <CommissionTable commissions={commissions.slice(0, 5)} onApprove={handleApproveCommission} onPay={handlePayCommission} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Receipts</CardTitle></CardHeader>
              <CardContent>
                {loading ? <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
                  : <ReceiptTable receipts={receipts.slice(0, 5)} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Agent Commissions</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
                : <CommissionTable commissions={commissions} onApprove={handleApproveCommission} onPay={handlePayCommission} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
                : <InvoiceTable invoices={invoices} onGenerateReceipt={handleGenerateReceipt} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Receipts</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
                : <ReceiptTable receipts={receipts} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}