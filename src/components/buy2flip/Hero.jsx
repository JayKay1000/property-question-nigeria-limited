import { ArrowRight, ExternalLink } from 'lucide-react';

const VIDEO_URL = 'https://media.base44.com/videos/public/6a6f7e5cd57da090e5283ea3/8e72daf19_Buy2Flip_Hero_Video.mp4';
const POSTER_URL = 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1920&q=80';

export default function Hero({ onContinue }) {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={POSTER_URL}
        className="absolute inset-0 h-full w-full object-cover">
        
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-950/60 to-brand-950/85" />
      <div className="absolute inset-0 bg-brand-950/30" />

      {/* Content */}
      <div className="container-wide relative z-10 px-4 text-center sm:px-6 lg:px-8">
        {/* Buy2Flip logo placeholder */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 text-2xl font-bold text-white shadow-glow-flame sm:h-24 sm:w-24 sm:text-3xl">
          B2F
        </div>

        <span className="inline-block rounded-full bg-flame-500/20 px-4 py-1.5 text-sm font-medium text-flame-300 backdrop-blur">
          A Property Question Nigeria Limited Platform
        </span>

        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-heading font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Flip Properties.{' '}
          <span className="bg-gradient-to-r from-flame-400 to-flame-500 bg-clip-text text-transparent">
            Build Wealth.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">Buy2Flip is Nigeria's premier property flipping platform — connecting subscribers with verified, high-potential real estate opportunities. Browse curated listings, track project progress, and s with confidence.



        </p>

        <button
          onClick={onContinue}
          className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-flame-500 px-7 py-4 text-base font-heading font-semibold text-white shadow-glow-flame transition-all hover:bg-flame-600 hover:shadow-lg active:scale-[0.98] sm:text-lg">
          
          Continue to the Official Buy2Flip Platform
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-1.5 text-xs text-brand-200">
          <ExternalLink className="h-3 w-3 shrink-0" />
          You are leaving the Property Question Nigeria Limited website and will be redirected to the
          official Buy2Flip platform.
        </p>
      </div>
    </section>);

}