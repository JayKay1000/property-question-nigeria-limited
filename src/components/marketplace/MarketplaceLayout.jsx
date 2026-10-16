import { Outlet } from 'react-router-dom';
import MarketplaceHeader from './MarketplaceHeader';
import MarketplaceFooter from './MarketplaceFooter';

export default function MarketplaceLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf9]">
      <MarketplaceHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketplaceFooter />
    </div>
  );
}