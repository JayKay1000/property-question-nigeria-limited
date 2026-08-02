/**
 * Feature Flags — Module Toggle Management
 *
 * Enable or disable entire platform modules. Combined with RBAC,
 * users only see a feature when the flag is ON and they have the
 * required permission.
 * Accessible to users with security.feature_flags permission.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { audit } from '@/lib/rbac/audit';
import {
  fetchFeatureFlags,
  refreshFeatureFlags,
  DEFAULT_FEATURE_FLAGS,
} from '@/lib/rbac/featureFlags';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Flag, ArrowLeft, RefreshCw, CheckCircle2, Globe, Lock } from 'lucide-react';

const MODULE_COLORS = {
  buy2flip: 'bg-flame-50 text-flame-700',
  property_tours: 'bg-blue-50 text-blue-700',
  crm: 'bg-emerald-50 text-emerald-700',
  estate_layouts: 'bg-purple-50 text-purple-700',
  ai_features: 'bg-amber-50 text-amber-700',
  payment_gateway: 'bg-rose-50 text-rose-700',
  construction: 'bg-orange-50 text-orange-700',
  property_management: 'bg-cyan-50 text-cyan-700',
  agent_portal: 'bg-indigo-50 text-indigo-700',
  customer_portal: 'bg-teal-50 text-teal-700',
  reports: 'bg-slate-50 text-slate-700',
  marketing: 'bg-pink-50 text-pink-700',
  support: 'bg-yellow-50 text-yellow-700',
  maps: 'bg-green-50 text-green-700',
};

export default function FeatureFlags() {
  const rbac = useRBAC();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const data = await fetchFeatureFlags();
      // Merge defaults with DB flags — any default not in DB gets shown
      const dbKeys = data.map((f) => f.key);
      const missing = DEFAULT_FEATURE_FLAGS.filter((d) => !dbKeys.includes(d.key));
      setFlags([...data, ...missing]);
    } catch (err) {
      console.error('Failed to load feature flags:', err);
      setFlags(DEFAULT_FEATURE_FLAGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const toggleFlag = async (flag) => {
    setToggling(flag.key);
    const newEnabled = !flag.enabled;
    try {
      if (flag.id) {
        await base44.entities.FeatureFlag.update(flag.id, { enabled: newEnabled });
      } else {
        await base44.entities.FeatureFlag.create({
          key: flag.key,
          label: flag.label,
          description: flag.description,
          module: flag.module,
          enabled: newEnabled,
          is_public: flag.is_public,
          required_permission: flag.required_permission,
        });
      }
      await audit.featureFlag(flag.key, newEnabled);
      refreshFeatureFlags();
      await loadFlags();
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    } finally {
      setToggling(null);
    }
  };

  const seedDefaults = async () => {
    setLoading(true);
    try {
      const existing = await fetchFeatureFlags();
      const existingKeys = existing.map((f) => f.key);
      const toCreate = DEFAULT_FEATURE_FLAGS.filter((d) => !existingKeys.includes(d.key));
      if (toCreate.length > 0) {
        await base44.entities.FeatureFlag.bulkCreate(toCreate);
      }
      refreshFeatureFlags();
      await loadFlags();
    } catch (err) {
      console.error('Failed to seed defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 section-pad py-8">
      <div className="container-wide max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4" />
              Platform Configuration
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold text-brand-900">Feature Flags</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Toggle platform modules on or off. Combined with RBAC permissions for layered access control.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={seedDefaults} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Seed Defaults
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/rbac">
                <ArrowLeft className="mr-2 h-4 w-4" /> RBAC Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Flags List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {flags.map((flag) => (
              <Card key={flag.key} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-base font-bold text-brand-900">
                          {flag.label}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${(MODULE_COLORS[flag.module] || 'bg-muted text-muted-foreground')}`}
                        >
                          {flag.module?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{flag.description}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        {flag.is_public ? (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Globe className="h-3.5 w-3.5" /> Public-facing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Lock className="h-3.5 w-3.5" /> Internal
                          </span>
                        )}
                        {flag.required_permission && (
                          <span className="font-mono text-muted-foreground/70">
                            req: {flag.required_permission}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Switch
                        checked={!!flag.enabled}
                        onCheckedChange={() => toggleFlag(flag)}
                        disabled={toggling === flag.key}
                      />
                      {flag.enabled ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">Inactive</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}