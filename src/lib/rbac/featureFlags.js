/**
 * Feature Flag Utility
 *
 * Feature flags gate entire modules (Buy2Flip, Property Tours, CRM, etc.).
 * Flags are stored in the FeatureFlag entity and cached client-side.
 * Combined with RBAC: a user only sees a feature if the flag is ON *and*
 * the user has the required permission.
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useRBAC } from './useRBAC';

let flagCache = null;
let loadingPromise = null;

export async function fetchFeatureFlags() {
  if (flagCache) return flagCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = base44.entities.FeatureFlag
    .list()
    .then((flags) => {
      flagCache = flags;
      return flags;
    })
    .catch((err) => {
      console.error('Failed to fetch feature flags:', err);
      flagCache = [];
      return [];
    });

  return loadingPromise;
}

export function refreshFeatureFlags() {
  flagCache = null;
  loadingPromise = null;
  return fetchFeatureFlags();
}

export async function isFeatureEnabled(key) {
  const flags = await fetchFeatureFlags();
  const flag = flags.find((f) => f.key === key);
  return flag ? flag.enabled : false;
}

/**
 * React hook — returns { flags, isEnabled, loading }.
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState(flagCache || []);
  const [loading, setLoading] = useState(!flagCache);

  useEffect(() => {
    fetchFeatureFlags().then((f) => {
      setFlags(f);
      setLoading(false);
    });
  }, []);

  const isEnabled = useCallback(
    (key) => {
      const flag = flags.find((f) => f.key === key);
      return flag ? flag.enabled : false;
    },
    [flags]
  );

  return { flags, isEnabled, loading };
}

/**
 * useFeatureAccess — combines feature flag + RBAC permission check.
 * Returns { enabled, hasAccess, loading }.
 */
export function useFeatureAccess(key, permission) {
  const { isEnabled, loading: flagLoading } = useFeatureFlags();
  const rbac = useRBAC();

  const enabled = isEnabled(key);
  const hasAccess = enabled && (!permission || rbac.hasPermission(permission));

  return { enabled, hasAccess, loading: flagLoading };
}

/**
 * useFeatureEnabled — simple boolean hook for a single flag.
 */
export function useFeatureEnabled(key) {
  const { isEnabled, loading } = useFeatureFlags();
  return { enabled: isEnabled(key), loading };
}

/**
 * Default feature flags to seed the database.
 */
export const DEFAULT_FEATURE_FLAGS = [
  { key: 'buy2flip', label: 'Buy2Flip', description: 'Enable Buy2Flip investment module', module: 'buy2flip', enabled: true, is_public: true, required_permission: 'buy2flip.view' },
  { key: 'property_tours', label: 'Property Tours', description: 'Enable interactive property tour platform', module: 'property_tours', enabled: true, is_public: true, required_permission: 'tours.view' },
  { key: 'crm', label: 'CRM', description: 'Enable customer relationship management', module: 'crm', enabled: true, is_public: false, required_permission: 'crm.view' },
  { key: 'estate_layouts', label: 'Estate Layouts', description: 'Enable interactive plot layout viewer', module: 'estate_layouts', enabled: true, is_public: true, required_permission: 'estate.view' },
  { key: 'ai_features', label: 'AI Features', description: 'Enable AI-powered features and assistant', module: 'ai_features', enabled: false, is_public: true },
  { key: 'payment_gateway', label: 'Payment Gateway', description: 'Enable online payment processing', module: 'payment_gateway', enabled: false, is_public: true },
];