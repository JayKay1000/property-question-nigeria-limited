import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHero({ title, subtitle, breadcrumbs = [], backgroundImage, align = 'center' }) {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      {backgroundImage && (
        <div className="absolute inset-0">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-900/70 to-brand-900/90" />
        </div>
      )}
      {!backgroundImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flame-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ice-500/10 rounded-full blur-[100px]" />
        </>
      )}
      <div className="relative section-pad py-20 lg:py-28">
        <div className={`container-wide ${align === 'center' ? 'text-center' : 'text-left'}`}>
          {breadcrumbs.length > 0 && (
            <nav className={`flex items-center gap-1.5 text-sm text-white/60 mb-6 ${align === 'center' ? 'justify-center' : ''}`}>
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
                  {bc.href ? (
                    <Link to={bc.href} className="hover:text-flame-400 transition-colors">{bc.label}</Link>
                  ) : (
                    <span className="text-white/80">{bc.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-5">
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg md:text-xl text-white/70 max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}