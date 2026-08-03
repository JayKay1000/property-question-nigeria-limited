import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortalSidebar from '@/components/customer/PortalSidebar';
import PortalOverview from '@/components/customer/PortalOverview';
import SavedProperties from '@/components/customer/SavedProperties';
import EnquiryHistory from '@/components/customer/EnquiryHistory';
import InspectionBookings from '@/components/customer/InspectionBookings';
import DocumentCentre from '@/components/customer/DocumentCentre';
import NotificationCentre from '@/components/customer/NotificationCentre';
import SupportCentre from '@/components/customer/SupportCentre';
import Buy2FlipGateway from '@/components/customer/Buy2FlipGateway';
import ProfileManagement from '@/components/customer/ProfileManagement';

export default function CustomerPortal() {
  const [params, setParams] = useSearchParams();
  const [active, setActive] = useState(params.get('section') || 'overview');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [savedProps, setSavedProps] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [documents, setDocuments] = useState([]);

  const loadData = useCallback(async (u) => {
    if (!u) return;
    const [saved, enqs, insps, notifs, tkts, cust] = await Promise.all([
      base44.entities.SavedProperty.filter({ user_id: u.id }, '-saved_date', 50).catch(() => []),
      base44.entities.PropertyEnquiry.filter({ $or: [{ customer_id: u.id }, { created_by_id: u.id }] }, '-created_date', 50).catch(() => []),
      base44.entities.InspectionRequest.filter({ $or: [{ customer_id: u.id }, { created_by_id: u.id }] }, '-created_date', 50).catch(() => []),
      base44.entities.Notification.filter({ recipient_id: u.id }, '-created_date', 50).catch(() => []),
      base44.entities.SupportTicket.filter({ customer_id: u.id }, '-created_date', 50).catch(() => []),
      base44.entities.Customer.filter({ $or: [{ user_id: u.id }, { created_by_id: u.id }] }, '-created_date', 1).catch(() => []),
    ]);
    setSavedProps(saved);
    setEnquiries(enqs);
    setInspections(insps);
    setNotifications(notifs);
    setTickets(tkts);
    setCustomer(cust[0] || { full_name: u.full_name || u.email, email: u.email, phone: '' });
  }, []);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      await loadData(u);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [loadData]);

  const setSection = (key) => {
    setActive(key);
    setParams({ section: key });
  };

  const timeline = [
    ...savedProps.map((s) => ({ label: `Saved: ${s.property_title || 'Property'}`, date: s.saved_date || s.created_date })),
    ...enquiries.map((e) => ({ label: `Enquiry: ${e.property_title || 'General'}`, date: e.created_date })),
    ...inspections.map((i) => ({ label: `Inspection: ${i.property_title || 'Property'}`, date: i.created_date })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50">
        <div className="h-10 w-10 border-4 border-brand-200 border-t-flame-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ice-50 pt-16 lg:pt-20">
      <PortalSidebar active={active} setActive={setSection} unreadCount={unreadCount} onClose={() => setMobileSidebar(false)} mobileOpen={mobileSidebar} />
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-brand-100 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileSidebar(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 text-brand-900"><Menu className="h-5 w-5" /></button>
          <span className="font-heading text-base font-bold text-brand-900">Customer Portal</span>
        </div>

        <main className="container-wide section-pad py-6">
          {active === 'overview' && <PortalOverview customer={customer} savedProps={savedProps} enquiries={enquiries} inspections={inspections} notifications={notifications} timeline={timeline} />}
          {active === 'saved' && <SavedProperties savedProps={savedProps} onRemove={(id) => setSavedProps(savedProps.filter((s) => s.id !== id))} />}
          {active === 'enquiries' && <EnquiryHistory enquiries={enquiries} userId={user?.id} userName={customer?.full_name} userEmail={customer?.email} userPhone={customer?.phone} />}
          {active === 'inspections' && <InspectionBookings inspections={inspections} userId={user?.id} onRefresh={() => loadData(user)} />}
          {active === 'documents' && <DocumentCentre documents={documents} />}
          {active === 'notifications' && <NotificationCentre notifications={notifications} onRefresh={() => loadData(user)} />}
          {active === 'support' && <SupportCentre tickets={tickets} userId={user?.id} userName={customer?.full_name} userEmail={customer?.email} userPhone={customer?.phone} onRefresh={() => loadData(user)} />}
          {active === 'buy2flip' && <Buy2FlipGateway />}
          {active === 'profile' && <ProfileManagement customer={customer} user={user} onUpdate={() => loadData(user)} />}
        </main>
      </div>
    </div>
  );
}