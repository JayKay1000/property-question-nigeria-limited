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
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import PropertyCompare from '@/pages/PropertyCompare';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectCompare from '@/pages/ProjectCompare';
import Tours from '@/pages/Tours';
import TourDetail from '@/pages/TourDetail';
import GISMap from '@/pages/GISMap';
import Agents from '@/pages/Agents';
import AgentRegister from '@/pages/AgentRegister';
import AgentDetail from '@/pages/AgentDetail';
import PropertySubmit from '@/pages/PropertySubmit';
import SubmissionTrack from '@/pages/SubmissionTrack';
import CustomerPortal from '@/pages/CustomerPortal';
import Search from '@/pages/Search';
import Notifications from '@/pages/Notifications';
import NotificationSettings from '@/pages/NotificationSettings';
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
import GISCommandCenter from '@/pages/admin/GISCommandCenter';
import ProjectOperations from '@/pages/admin/ProjectOperations';
import CRMOperations from '@/pages/admin/CRMOperations';
import MediaDocumentCenter from '@/pages/admin/MediaDocumentCenter';
import OperationsIntelligenceCenter from '@/pages/admin/OperationsIntelligenceCenter';
import NotificationCenterAdmin from '@/pages/admin/NotificationCenterAdmin';
import CMSDashboard from '@/pages/admin/CMSDashboard';
import WorkflowEngine from '@/pages/admin/WorkflowEngine';
import AIIntelligenceCenter from '@/pages/admin/AIIntelligenceCenter';
import FinancialCenter from '@/pages/admin/FinancialCenter';
import MarketingCenter from '@/pages/admin/MarketingCenter';
import APIGatewayCenter from '@/pages/admin/APIGatewayCenter';
import SchedulingCenter from '@/pages/admin/SchedulingCenter';
import UnifiedCommandCenter from '@/pages/admin/UnifiedCommandCenter';
import DocumentSigningCenter from '@/pages/admin/DocumentSigningCenter';
import MediaOpsCenter from '@/pages/admin/MediaOpsCenter';
import SecurityOpsCenter from '@/pages/admin/SecurityOpsCenter';
import UploadCenter from '@/pages/admin/UploadCenter';
import AboutUs from '@/pages/AboutUs';
import Services from '@/pages/Services';
import Blog from '@/pages/Blog';
import BlogDetail from '@/pages/BlogDetail';
import NewsPage from '@/pages/News';
import NewsDetail from '@/pages/NewsDetail';
import Careers from '@/pages/Careers';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Testimonials from '@/pages/Testimonials';
import CSR from '@/pages/CSR';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';
import CookiePolicy from '@/pages/CookiePolicy';
import AccessibilityStatement from '@/pages/AccessibilityStatement';
import Sitemap from '@/pages/Sitemap';
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
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/compare" element={<PropertyCompare />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/compare" element={<ProjectCompare />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/gis" element={<GISMap />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/register" element={<AgentRegister />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/submit" element={<PropertySubmit />} />
        <Route path="/submit/track" element={<SubmissionTrack />} />
        <Route path="/portal" element={<CustomerPortal />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/csr" element={<CSR />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/accessibility" element={<AccessibilityStatement />} />
        <Route path="/sitemap" element={<Sitemap />} />
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
          <Route path="/admin/gis" element={
            <RequirePermission permission="properties.view">
              <GISCommandCenter />
            </RequirePermission>
          } />
          <Route path="/admin/projects" element={
            <RequirePermission permission="properties.view">
              <ProjectOperations />
            </RequirePermission>
          } />
          <Route path="/admin/crm" element={
            <RequirePermission permission="properties.view">
              <CRMOperations />
            </RequirePermission>
          } />
          <Route path="/admin/media-docs" element={
            <RequirePermission permission="properties.view">
              <MediaDocumentCenter />
            </RequirePermission>
          } />
          <Route path="/admin/intelligence" element={
            <RequirePermission permission="security.view">
              <OperationsIntelligenceCenter />
            </RequirePermission>
          } />
          <Route path="/admin/notifications" element={
            <RequirePermission permission="security.view">
              <NotificationCenterAdmin />
            </RequirePermission>
          } />
          <Route path="/admin/cms" element={
            <RequirePermission permission="security.view">
              <CMSDashboard />
            </RequirePermission>
          } />
          <Route path="/admin/workflows" element={
            <RequirePermission permission="security.view">
              <WorkflowEngine />
            </RequirePermission>
          } />
          <Route path="/admin/ai" element={
            <RequirePermission permission="security.view">
              <AIIntelligenceCenter />
            </RequirePermission>
          } />
          <Route path="/admin/finance" element={
            <RequirePermission permission="security.view">
              <FinancialCenter />
            </RequirePermission>
          } />
          <Route path="/admin/marketing" element={
            <RequirePermission permission="security.view">
              <MarketingCenter />
            </RequirePermission>
          } />
          <Route path="/admin/api-gateway" element={
            <RequirePermission permission="security.view">
              <APIGatewayCenter />
            </RequirePermission>
          } />
          <Route path="/admin/scheduling" element={
            <RequirePermission permission="security.view">
              <SchedulingCenter />
            </RequirePermission>
          } />
          <Route path="/admin/command-center" element={
            <RequirePermission permission="security.view">
              <UnifiedCommandCenter />
            </RequirePermission>
          } />
          <Route path="/admin/dms" element={
            <RequirePermission permission="security.view">
              <DocumentSigningCenter />
            </RequirePermission>
          } />
          <Route path="/admin/media-ops" element={
            <RequirePermission permission="security.view">
              <MediaOpsCenter />
            </RequirePermission>
          } />
          <Route path="/admin/security-ops" element={
            <RequirePermission permission="security.view">
              <SecurityOpsCenter />
            </RequirePermission>
          } />
          <Route path="/admin/upload" element={
            <RequirePermission permission="properties.view">
              <UploadCenter />
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