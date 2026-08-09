import { ExternalLink, ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

export default function CTABanner({ onContinue }) {
  return (
    <section className="section-pad py-20">
      <div className="container-wide">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-flame-500/20 blur-3xl" />
            <div className="relative">
              <h2 className="mb-4 text-3xl font-heading font-bold text-white sm:text-4xl">
                Ready to Start Flipping?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-brand-200">
                Join Buy2Flip today and access premium property investment opportunities across Nigeria.
              </p>
              <button
                onClick={onContinue}
                className="group inline-flex items-center gap-3 rounded-xl bg-flame-500 px-8 py-4 text-base font-heading font-semibold text-white shadow-glow-flame transition-all hover:bg-flame-600 hover:shadow-lg active:scale-[0.98] sm:text-lg"
              >
                Continue to Buy2Flip
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-1.5 text-xs text-brand-300">
                <ExternalLink className="h-3 w-3 shrink-0" />
                You are leaving the Property Question Nigeria Limited website and will be redirected to the
                official Buy2Flip platform.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}