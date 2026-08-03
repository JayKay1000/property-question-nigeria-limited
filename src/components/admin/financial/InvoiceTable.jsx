import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText } from 'lucide-react';
import { formatCurrency, getInvoiceStatusInfo, INVOICE_TYPES } from '@/lib/financial-utils';

export default function InvoiceTable({ invoices = [], onGenerateReceipt, onView }) {
  if (!invoices.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Invoice #</th>
            <th className="pb-2 pr-4 font-medium">Customer</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 font-medium">Issue Date</th>
            <th className="pb-2 pr-4 font-medium">Due Date</th>
            <th className="pb-2 pr-4 font-medium">Total</th>
            <th className="pb-2 pr-4 font-medium">Paid</th>
            <th className="pb-2 pr-4 font-medium">Balance</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const statusInfo = getInvoiceStatusInfo(inv.status);
            return (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 pr-4">
                  <p className="font-mono text-xs font-medium">{inv.invoice_number}</p>
                </td>
                <td className="py-2.5 pr-4">
                  <p className="text-xs font-medium">{inv.customer_name}</p>
                  {inv.customer_email && <p className="text-xs text-muted-foreground">{inv.customer_email}</p>}
                </td>
                <td className="py-2.5 pr-4 text-xs">{INVOICE_TYPES[inv.invoice_type] || inv.invoice_type}</td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{inv.issue_date || '—'}</td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{inv.due_date || '—'}</td>
                <td className="py-2.5 pr-4 text-xs font-semibold">{formatCurrency(inv.total_amount, inv.currency)}</td>
                <td className="py-2.5 pr-4 text-xs text-success">{formatCurrency(inv.amount_paid, inv.currency)}</td>
                <td className="py-2.5 pr-4 text-xs font-medium text-error">{formatCurrency(inv.balance_due, inv.currency)}</td>
                <td className="py-2.5 pr-4">
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </td>
                <td className="py-2.5">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView?.(inv)}>
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    {(inv.status === 'paid' || inv.status === 'partially_paid') && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onGenerateReceipt?.(inv)}>
                        Receipt
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}