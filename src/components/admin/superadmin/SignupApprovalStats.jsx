import React from 'react';
import { Users, UserCheck, Clock, UserX, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const STATS = [
  { key: 'total', label: 'Total Signups', icon: Users, tone: 'text-brand-700 bg-brand-50' },
  { key: 'pending', label: 'Pending Approval', icon: Clock, tone: 'text-amber-700 bg-amber-50' },
  { key: 'active', label: 'Active Accounts', icon: UserCheck, tone: 'text-emerald-700 bg-emerald-50' },
  { key: 'suspended', label: 'Suspended', icon: UserX, tone: 'text-red-700 bg-red-50' },
  { key: 'rejected', label: 'Rejected', icon: ShieldCheck, tone: 'text-rose-700 bg-rose-50' },
  { key: 'agents', label: 'Agent Applicants', icon: BadgeCheck, tone: 'text-flame-700 bg-flame-50' },
];

export default function SignupApprovalStats({ counts }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.key} className="p-4">
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-heading font-bold text-foreground">{counts[s.key] ?? 0}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          </Card>
        );
      })}
    </div>
  );
}