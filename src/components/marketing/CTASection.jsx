import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, Search } from 'lucide-react';

export default function CTASection({
  title = 'Ready to Find Your Perfect Property?',
  subtitle = 'Schedule a consultation with our experts, book an inspection, or explore our premium listings today.',
  primaryLabel = 'Schedule Consultation',
  primaryHref = '/contact',
  secondaryLabel = 'Browse Properties',
  secondaryHref = '/properties',
  variant = 'navy'
}) {
  const bg = variant === 'orange'
    ? 'bg-gradient-to-r from-flame-500 to-flame-600'
    : 'bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950';

  return (
    <section className={`relative overflow-hidden ${bg} text-white section-pad py-16 lg:py-24`}>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]" />
      <div className="relative container-wide text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">{title}</h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">{subtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-flame-500 hover:bg-flame-600 text-white border-0">
            <Link to={primaryHref}>
              <Calendar className="w-4 h-4 mr-2" /> {primaryLabel}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
            <Link to={secondaryHref}>
              <Search className="w-4 h-4 mr-2" /> {secondaryLabel}
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
            <a href="tel:+2348000000000">
              <Phone className="w-4 h-4 mr-2" /> Call Us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}