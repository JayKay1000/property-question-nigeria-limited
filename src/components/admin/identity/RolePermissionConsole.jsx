import { useEffect, useState } from 'react';
import { KeyRound, Shield, Users, Layers, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RolePermissionConsole() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Role.list().catch(() => []),
      base44.entities.Permission.list().catch(() => []),
      base44.entities.UserRole.list().catch(() => []),
      base44.entities.RolePermission.list().catch(() => []),
    ]).then(([r, p, ur, rp]) => {
      setRoles(r);
      setPermissions(p);
      setUserRoles(ur);
      setRolePermissions(rp);
    }).finally(() => setLoading(false));
  }, []);

  const rolePermCount = (roleKey) => rolePermissions.filter((rp) => rp.role_key === roleKey && rp.effect === 'allow').length;
  const roleUserCount = (roleKey) => userRoles.filter((ur) => ur.role_key === roleKey && ur.is_active).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><KeyRound className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{roles.length}</p><p className="text-xs text-muted-foreground">Defined Roles</p></CardContent></Card>
        <Card><CardContent className="p-4"><Shield className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{permissions.length}</p><p className="text-xs text-muted-foreground">Permissions</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{userRoles.length}</p><p className="text-xs text-muted-foreground">Role Assignments</p></CardContent></Card>
        <Card><CardContent className="p-4"><Layers className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{rolePermissions.length}</p><p className="text-xs text-muted-foreground">Role-Permission Maps</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><KeyRound className="h-4 w-4 text-brand-700" /> Role Hierarchy</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : roles.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No roles defined yet.</p>
            ) : (
              [...roles].sort((a, b) => (b.level || 0) - (a.level || 0)).map((r) => (
                <button key={r.id} onClick={() => setSelectedRole(r)} className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted ${selectedRole?.id === r.id ? 'bg-muted' : ''}`}>
                  <div>
                    <p className="text-sm font-medium">{r.role_name}</p>
                    <p className="text-xs text-muted-foreground">Level {r.level || 0}{r.is_custom ? ' · Custom' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{roleUserCount(r.role_key)} users</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-flame-600" /> {selectedRole ? `${selectedRole.role_name} — Permissions` : 'Permission Explorer'}</CardTitle></CardHeader>
          <CardContent>
            {!selectedRole ? (
              <div className="flex flex-col items-center py-16 text-center"><Shield className="h-12 w-12 text-muted-foreground/40" /><p className="mt-4 text-sm text-muted-foreground">Select a role to view its permissions.</p></div>
            ) : (
              <div>
                <div className="mb-4 rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm text-muted-foreground">{selectedRole.description || 'No description.'}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">Level {selectedRole.level || 0}</Badge>
                    {selectedRole.parent_role_key && <Badge variant="outline">Parent: {selectedRole.parent_role_key}</Badge>}
                    {selectedRole.is_system_role && <Badge className="bg-brand-700 text-xs">System Role</Badge>}
                  </div>
                </div>
                <p className="mb-2 text-sm font-semibold">{rolePermCount(selectedRole.role_key)} permissions assigned</p>
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No permissions defined.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {permissions.map((p) => {
                      const rp = rolePermissions.find((r) => r.role_key === selectedRole.role_key && r.permission_key === p.permission_key);
                      return (
                        <div key={p.id} className={`rounded-lg border p-2 ${rp?.effect === 'allow' ? 'border-success/30 bg-success/5' : rp?.effect === 'deny' ? 'border-destructive/30 bg-destructive/5' : 'opacity-50'}`}>
                          <p className="truncate text-xs font-medium">{p.permission_key}</p>
                          <Badge variant="outline" className={`mt-1 text-xs ${rp?.effect === 'allow' ? 'text-success' : rp?.effect === 'deny' ? 'text-destructive' : ''}`}>
                            {rp?.effect || 'not assigned'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}