import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getReceiptStatusInfo, getPaymentMethodInfo } from '@/lib/financial-utils';

export default function ReceiptTable({ receipts = [] }) {
  if (!receipts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No receipts issued yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Receipt #</th>
            <th className="pb-2 pr-4 font-medium">Customer</th>
            <th className="pb-2 pr-4 font-medium">Invoice</th>
            <th className="pb-2 pr-4 font-medium">Amount</th>
            <th className="pb-2 pr-4 font-medium">Method</th>
            <th className="pb-2 pr-4 font-medium">Reference</th>
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 pr-4 font-medium">Verified</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r) => {
            const statusInfo = getReceiptStatusInfo(r.status);
            const methodInfo = getPaymentMethodInfo(r.payment_method);
            return (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 pr-4 font-mono text-xs font-medium">{r.receipt_number}</td>
                <td className="py-2.5 pr-4 text-xs font-medium">{r.customer_name}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{r.invoice_number || '—'}</td>
                <td className="py-2.5 pr-4 text-xs font-semibold">{formatCurrency(r.amount, r.currency)}</td>
                <td className="py-2.5 pr-4 text-xs">{methodInfo.label}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{r.payment_reference || '—'}</td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{r.payment_date || '—'}</td>
                <td className="py-2.5 pr-4">
                  {r.verified ? (
                    <Badge className="bg-success/15 text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </td>
                <td className="py-2.5">
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}