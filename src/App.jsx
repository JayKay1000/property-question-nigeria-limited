import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from '@/pages/Home';
import Buy2Flip from '@/pages/Buy2Flip';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AccessDenied from '@/pages/AccessDenied';
import RBACDashboard from '@/pages/admin/RBACDashboard';
import AuditLogs from '@/pages/admin/AuditLogs';
import FeatureFlags from '@/pages/admin/FeatureFlags';
import SOCDashboard from '@/pages/admin/SOCDashboard';
import DatabaseGovernance from '@/pages/admin/DatabaseGovernance';
import IdentityCenter from '@/pages/admin/IdentityCenter';
import PropertyIntelligence from '@/pages/admin/PropertyIntelligence';
import RequirePermission from '@/lib/rbac/RequirePermission';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import ModulePlaceholder from '@/pages/dashboard/ModulePlaceholder';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/buy2flip" element={<Buy2Flip />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/*" element={<ModulePlaceholder />} />
          <Route path="/admin/rbac" element={
            <RequirePermission permission="security.view">
              <RBACDashboard />
            </RequirePermission>
          } />
          <Route path="/admin/audit-logs" element={
            <RequirePermission permission="security.audit_logs">
              <AuditLogs />
            </RequirePermission>
          } />
          <Route path="/admin/feature-flags" element={
            <RequirePermission permission="security.feature_flags">
              <FeatureFlags />
            </RequirePermission>
          } />
          <Route path="/admin/soc" element={
            <RequirePermission permission="security.view">
              <SOCDashboard />
            </RequirePermission>
          } />
          <Route path="/admin/database" element={
            <RequirePermission permission="security.view">
              <DatabaseGovernance />
            </RequirePermission>
          } />
          <Route path="/admin/identity" element={
            <RequirePermission permission="security.view">
              <IdentityCenter />
            </RequirePermission>
          } />
          <Route path="/admin/property-center" element={
            <RequirePermission permission="properties.view">
              <PropertyIntelligence />
            </RequirePermission>
          } />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App