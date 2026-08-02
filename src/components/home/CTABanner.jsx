import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/ui/Reveal';

const BG_IMAGE = 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1920&q=80&auto=format&fit=crop';

export default function CTABanner() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Reveal className="mx-auto max-w-[1440px]">
        <div className="relative overflow-hidden rounded-3xl">
          <img src={BG_IMAGE} alt="Get started" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/85 to-brand-800/70" />
          <div className="relative z-10 px-6 py-14 text-center sm:px-12 lg:py-20 lg:text-left">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Ready to find your <span className="text-flame-400">dream property?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/80 lg:mx-0">
                Let our expert team guide you through every step — from discovery to handover.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Button asChild size="lg" className="bg-flame-500 hover:bg-flame-600 text-white shadow-glow-flame">
                  <Link to="/properties">Browse Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:text-white">
                  <Link to="/contact"><Phone className="mr-2 h-4 w-4" />Talk to an Agent</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}