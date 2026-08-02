import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import Hero from '@/components/buy2flip/Hero';
import Benefits from '@/components/buy2flip/Benefits';
import FAQ from '@/components/buy2flip/FAQ';
import SecurityNotice from '@/components/buy2flip/SecurityNotice';
import CTABanner from '@/components/buy2flip/CTABanner';
import Buy2FlipFooter from '@/components/buy2flip/Buy2FlipFooter';
import RedirectOverlay from '@/components/buy2flip/RedirectOverlay';

const BUY2FLIP_URL = 'https://www.buy2flip.net';

export default function Buy2Flip() {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleContinueClick = (source) => {
    base44.analytics.track({
      eventName: 'buy2flip_outbound_click',
      properties: { source },
    });
    setShowOverlay(true);
  };

  const handleConfirmRedirect = () => {
    base44.analytics.track({
      eventName: 'buy2flip_redirect_confirmed',
      properties: { destination: BUY2FLIP_URL },
    });
    window.open(BUY2FLIP_URL, '_blank', 'noopener,noreferrer');
    setShowOverlay(false);
  };

  return (
    <>
      <Hero onContinue={() => handleContinueClick('hero_button')} />
      <Benefits />
      <FAQ />
      <SecurityNotice />
      <CTABanner onContinue={() => handleContinueClick('cta_button')} />
      <Buy2FlipFooter onVisit={() => handleContinueClick('footer_link')} />
      <RedirectOverlay
        show={showOverlay}
        onConfirm={handleConfirmRedirect}
        onCancel={() => setShowOverlay(false)}
      />
    </>
  );
}