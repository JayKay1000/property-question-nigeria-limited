import { LayoutDashboard, Heart, MessageSquare, CalendarCheck, FolderOpen, Bell, LifeBuoy, Rocket, UserCircle, X } from 'lucide-react';

const ICONS = { LayoutDashboard, Heart, MessageSquare, CalendarCheck, FolderOpen, Bell, LifeBuoy, Rocket, UserCircle };
const SECTIONS = [
  { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'saved', label: 'Saved Properties', icon: 'Heart' },
  { key: 'enquiries', label: 'My Enquiries', icon: 'MessageSquare' },
  { key: 'inspections', label: 'Inspections', icon: 'CalendarCheck' },
  { key: 'notifications', label: 'Notifications', icon: 'Bell' },
  { key: 'support', label: 'Support', icon: 'LifeBuoy' },
  { key: 'buy2flip', label: 'Buy2Flip', icon: 'Rocket' },
  { key: 'profile', label: 'Profile', icon: 'UserCircle' },
];

export default function PortalSidebar({ active, setActive, unreadCount, onClose, mobileOpen }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-white/10 bg-brand-900 transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-5">
            <span className="font-heading text-lg font-bold text-white">Customer Portal</span>
            <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3">
            {SECTIONS.map((s) => {
              const Icon = ICONS[s.icon];
              const isActive = active === s.key;
              return (
                <button key={s.key} onClick={() => { setActive(s.key); onClose?.(); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-flame-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {s.label}
                  {s.key === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-flame-500 px-1.5 text-[10px] font-bold text-white">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}