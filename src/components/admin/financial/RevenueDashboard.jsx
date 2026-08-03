import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Receipt, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-utils';

export default function RevenueDashboard({ stats }) {
  const items = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      change: stats.revenueChange || 0,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Commissions Payable',
      value: formatCurrency(stats.commissionsPayable || 0),
      change: stats.commissionChange || 0,
      icon: TrendingUp,
      color: 'text-flame-600',
      bg: 'bg-flame-500/10',
    },
    {
      label: 'Outstanding Invoices',
      value: formatCurrency(stats.outstanding || 0),
      change: stats.outstandingChange || 0,
      icon: AlertCircle,
      color: 'text-error',
      bg: 'bg-error/10',
    },
    {
      label: 'Receipts This Month',
      value: formatCurrency(stats.receiptsThisMonth || 0),
      change: stats.receiptsChange || 0,
      icon: Receipt,
      color: 'text-info',
      bg: 'bg-info/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const isPositive = item.change >= 0;
        return (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                {item.change !== 0 && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(item.change)}%
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-xl font-bold font-heading">{item.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}