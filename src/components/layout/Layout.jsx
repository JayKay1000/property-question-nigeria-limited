import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTopButton from './ScrollToTopButton';
import CookieConsent from './CookieConsent';
import FloatingActions from './FloatingActions';
import BottomTabBar from './BottomTabBar';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <div className="h-16 md:hidden" aria-hidden="true" />
      <FloatingActions />
      <ScrollToTopButton />
      <CookieConsent />
      <BottomTabBar />
    </div>
  );
}