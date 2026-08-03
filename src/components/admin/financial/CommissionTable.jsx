import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, getCommissionTypeInfo, getCommissionStatusInfo } from '@/lib/financial-utils';

export default function CommissionTable({ commissions = [], onApprove, onPay }) {
  if (!commissions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No commissions recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Code</th>
            <th className="pb-2 pr-4 font-medium">Agent</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 font-medium">Base Amount</th>
            <th className="pb-2 pr-4 font-medium">Rate</th>
            <th className="pb-2 pr-4 font-medium">Commission</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((c) => {
            const typeInfo = getCommissionTypeInfo(c.commission_type);
            const statusInfo = getCommissionStatusInfo(c.status);
            return (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 pr-4 text-xs font-mono">{c.commission_code}</td>
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-xs">{c.agent_name}</p>
                  {c.customer_name && <p className="text-xs text-muted-foreground">{c.customer_name}</p>}
                </td>
                <td className="py-2.5 pr-4">
                  <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                </td>
                <td className="py-2.5 pr-4 text-xs">{formatCurrency(c.base_amount, c.currency)}</td>
                <td className="py-2.5 pr-4 text-xs">{c.commission_rate}%</td>
                <td className="py-2.5 pr-4 font-semibold">{formatCurrency(c.commission_amount, c.currency)}</td>
                <td className="py-2.5 pr-4">
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </td>
                <td className="py-2.5">
                  {c.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => onApprove?.(c)} className="h-7 gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </Button>
                  )}
                  {c.status === 'approved' && (
                    <Button size="sm" variant="default" onClick={() => onPay?.(c)} className="h-7 gap-1 text-xs">
                      Mark Paid
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}