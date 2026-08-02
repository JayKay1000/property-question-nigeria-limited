import { useState } from 'react';
import { IdCard, Monitor, BadgeCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import IdentityExplorer from '@/components/admin/identity/IdentityExplorer';
import SessionMonitor from '@/components/admin/identity/SessionMonitor';
import VerificationConsole from '@/components/admin/identity/VerificationConsole';
import IdentitySecurityCenter from '@/components/admin/identity/IdentitySecurityCenter';
import RolePermissionConsole from '@/components/admin/identity/RolePermissionConsole';

export default function IdentityCenter() {
  const [tab, setTab] = useState('explorer');

  return (
    <div>
      <PageHeader
        title="Identity Management Center"
        subtitle="Enterprise identity, access, verification, and security management for the Property Question Nigeria platform"
        icon={IdCard}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="explorer" className="gap-1.5">
            <IdCard className="h-4 w-4" /> Explorer
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <Monitor className="h-4 w-4" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-1.5">
            <BadgeCheck className="h-4 w-4" /> Verification
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <ShieldAlert className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5">
            <KeyRound className="h-4 w-4" /> Roles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="explorer" className="mt-6">
          <IdentityExplorer />
        </TabsContent>
        <TabsContent value="sessions" className="mt-6">
          <SessionMonitor />
        </TabsContent>
        <TabsContent value="verification" className="mt-6">
          <VerificationConsole />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <IdentitySecurityCenter />
        </TabsContent>
        <TabsContent value="roles" className="mt-6">
          <RolePermissionConsole />
        </TabsContent>
      </Tabs>
    </div>
  );
}