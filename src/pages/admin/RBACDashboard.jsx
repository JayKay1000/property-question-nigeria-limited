/**
 * RBAC Dashboard — Role & Permission Overview
 *
 * Shows all 16 default roles, their hierarchy, permissions, and a
 * full permission matrix. Accessible to users with security.view.
 */
import { useState, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ROLE_DEFINITIONS, ALL_ROLES, ROLE_LEVELS } from '@/lib/rbac/roles';
import { PERMISSION_GROUPS, ALL_PERMISSIONS, WILDCARD_PERMISSION } from '@/lib/rbac/permissions';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, ShieldCheck, KeyRound, Users, ArrowLeft, Check, X,
  ScrollText, Flag, Lock, Crown, UserCog,
} from 'lucide-react';

const LEVEL_LABELS = {
  0: 'Public', 1: 'Basic', 2: 'Officer', 3: 'Manager', 4: 'Admin', 5: 'Super',
};

const LEVEL_COLORS = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-blue-50 text-blue-700',
  2: 'bg-emerald-50 text-emerald-700',
  3: 'bg-amber-50 text-amber-700',
  4: 'bg-purple-50 text-purple-700',
  5: 'bg-flame-50 text-flame-700',
};

function RoleCard({ roleKey }) {
  const def = ROLE_DEFINITIONS[roleKey];
  const level = ROLE_LEVELS[roleKey];
  const permCount = def.permissions.includes(WILDCARD_PERMISSION)
    ? ALL_PERMISSIONS.length
    : def.permissions.length;

  return (
    <Card className="border-border/60 transition-shadow hover:shadow-premium">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-heading font-bold text-brand-900">
              {def.label}
            </CardTitle>
            <Badge className={`mt-1.5 ${LEVEL_COLORS[level]}`} variant="secondary">
              Level {level} · {LEVEL_LABELS[level]}
            </Badge>
          </div>
          {level === 5 && <Crown className="h-5 w-5 text-flame-500" />}
          {level === 4 && <ShieldCheck className="h-5 w-5 text-brand-600" />}
          {level === 3 && <UserCog className="h-5 w-5 text-amber-600" />}
          {level <= 2 && level > 0 && <KeyRound className="h-5 w-5 text-emerald-600" />}
          {level === 0 && <Users className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{def.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {permCount} {permCount === 1 ? 'permission' : 'permissions'}
          </span>
          {def.permissions.includes(WILDCARD_PERMISSION) && (
            <Badge variant="secondary" className="ml-auto bg-flame-50 text-flame-700">
              Wildcard
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionMatrix() {
  const roles = ALL_ROLES.filter((r) => r !== 'guest');
  const groups = Object.entries(PERMISSION_GROUPS);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 bg-card px-3 py-2 text-left font-heading font-semibold text-brand-900">
              Permission
            </th>
            {roles.map((roleKey) => (
              <th key={roleKey} className="px-2 py-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {ROLE_DEFINITIONS[roleKey].label.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">L{ROLE_LEVELS[roleKey]}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(([groupName, perms]) => (
            <Fragment key={groupName}>
              <tr className="bg-muted/40">
                <td
                  colSpan={roles.length + 1}
                  className="px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wide text-brand-700"
                >
                  {groupName}
                </td>
              </tr>
              {perms.map((perm) => (
                <tr key={perm} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="sticky left-0 bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    {perm}
                  </td>
                  {roles.map((roleKey) => {
                    const rolePerms = ROLE_DEFINITIONS[roleKey].permissions;
                    const has = rolePerms.includes(WILDCARD_PERMISSION) || rolePerms.includes(perm);
                    return (
                      <td key={roleKey} className="px-2 py-1.5 text-center">
                        {has ? (
                          <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <X className="mx-auto h-3.5 w-3.5 text-muted-foreground/30" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RBACDashboard() {
  const rbac = useRBAC();
  const [activeTab, setActiveTab] = useState('roles');

  const stats = useMemo(
    () => [
      { label: 'Total Roles', value: ALL_ROLES.length, icon: Shield, color: 'text-brand-600' },
      { label: 'Permissions', value: ALL_PERMISSIONS.length, icon: KeyRound, color: 'text-flame-600' },
      { label: 'Permission Groups', value: Object.keys(PERMISSION_GROUPS).length, icon: Lock, color: 'text-emerald-600' },
      { label: 'Your Role', value: rbac.role ? ROLE_DEFINITIONS[rbac.role]?.label : '—', icon: UserCog, color: 'text-purple-600' },
    ],
    [rbac.role]
  );

  return (
    <div className="min-h-screen bg-muted/20 section-pad py-8">
      <div className="container-wide max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Security & Access Control
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold text-brand-900">
              RBAC Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Role-Based Access Control · {ALL_ROLES.length} roles · {ALL_PERMISSIONS.length} permissions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {rbac.hasPermission('security.audit_logs') && (
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/audit-logs">
                  <ScrollText className="mr-2 h-4 w-4" /> Audit Logs
                </Link>
              </Button>
            )}
            {rbac.hasPermission('security.feature_flags') && (
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/feature-flags">
                  <Flag className="mr-2 h-4 w-4" /> Feature Flags
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="font-heading text-lg font-bold text-brand-900">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="roles">Roles Overview</TabsTrigger>
            <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
            <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
          </TabsList>

          {/* Roles Overview */}
          <TabsContent value="roles">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ALL_ROLES.map((roleKey) => (
                <RoleCard key={roleKey} roleKey={roleKey} />
              ))}
            </div>
          </TabsContent>

          {/* Permission Matrix */}
          <TabsContent value="matrix">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Permission Matrix</CardTitle>
                <CardDescription>
                  Fine-grained permissions mapped to each role. Check marks indicate the role grants that permission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionMatrix />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Hierarchy */}
          <TabsContent value="hierarchy">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Role Hierarchy</CardTitle>
                <CardDescription>
                  Access levels from 0 (public) to 5 (super administrator). Higher levels inherit capabilities of lower levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1, 0].map((level) => {
                    const rolesAtLevel = ALL_ROLES.filter((r) => ROLE_LEVELS[r] === level);
                    return (
                      <div key={level} className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold ${LEVEL_COLORS[level]}`}>
                          {level}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rolesAtLevel.map((roleKey) => (
                            <Badge
                              key={roleKey}
                              variant="secondary"
                              className={`px-3 py-1.5 text-sm ${LEVEL_COLORS[level]}`}
                            >
                              {ROLE_DEFINITIONS[roleKey].label}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground self-center ml-1">
                            {LEVEL_LABELS[level]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}