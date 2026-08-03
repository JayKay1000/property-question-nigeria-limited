import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, Plug, CalendarCheck, FileText, Workflow, BrainCircuit, Wallet, Megaphone, Building2, Users, Bell, Shield, Rocket } from 'lucide-react';

export default function QuickActionLauncher() {
  const actions = [
    { label: 'New Property', href: '/admin/property-center', icon: Building2, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Add Integration', href: '/admin/api-gateway', icon: Plus, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Manage Bookings', href: '/admin/scheduling', icon: CalendarCheck, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Create Content', href: '/admin/cms', icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Build Workflow', href: '/admin/workflows', icon: Workflow, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'AI Assistant', href: '/admin/ai', icon: BrainCircuit, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Financial Reports', href: '/admin/finance', icon: Wallet, color: 'text-success', bg: 'bg-success/10' },
    { label: 'SEO Keywords', href: '/admin/marketing', icon: Megaphone, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Manage Leads', href: '/admin/crm', icon: Users, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Send Notification', href: '/admin/notifications', icon: Bell, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Security Center', href: '/admin/soc', icon: Shield, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'API Gateway', href: '/admin/api-gateway', icon: Plug, color: 'text-ice-600', bg: 'bg-ice-50' },
  ];

  return (
    <div>
      <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Rocket className="w-5 h-5 text-flame-500" /> Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map(a => (
          <Link key={a.label} to={a.href}>
            <Card className="p-4 hover:shadow-card-hover transition-shadow cursor-pointer flex flex-col items-center text-center gap-2 h-full">
              <div className={`w-11 h-11 rounded-xl ${a.bg} flex items-center justify-center`}><a.icon className={`w-5 h-5 ${a.color}`} /></div>
              <p className="text-sm font-medium">{a.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}