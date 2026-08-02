import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/ui/Logo';
import Reveal from '@/components/ui/Reveal';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/about#team' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  services: {
    title: 'Services',
    links: [
      { label: 'Real Estate Sales', href: '/services/sales' },
      { label: 'Construction', href: '/services/construction' },
      { label: 'Property Management', href: '/services/management' },
      { label: 'Estate Development', href: '/services/development' },
      { label: 'Buy2Flip', href: '/buy2flip' },
    ],
  },
  locations: {
    title: 'Locations',
    links: [
      { label: 'Lekki', href: '/properties?loc=lekki' },
      { label: 'Ikoyi', href: '/properties?loc=ikoyi' },
      { label: 'Victoria Island', href: '/properties?loc=vi' },
      { label: 'Abuja', href: '/properties?loc=abuja' },
      { label: 'Port Harcourt', href: '/properties?loc=ph' },
    ],
  },
};

const socials = ['FB', 'IG', 'in', 'X'];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-flame-500/10 blur-3xl" />

      <div className="container-wide section-pad relative">
        <Reveal className="border-b border-white/10 py-12">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <h3 className="font-heading text-2xl font-bold">Stay in the loop</h3>
              <p className="mt-1 text-sm text-white/60">Get the latest property listings and market insights delivered to your inbox.</p>
            </div>
            <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder="Enter your email" className="border-white/20 bg-white/5 text-white placeholder:text-white/40" />
              <Button type="submit" className="shrink-0 bg-flame-500 hover:bg-flame-600 text-white">
                <Send className="mr-1.5 h-4 w-4" />Subscribe
              </Button>
            </form>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Property Question Nigeria Limited is a premier PropTech company transforming Nigeria's real estate landscape through technology, transparency, and trust.
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-flame-500" />Lekki Phase 1, Lagos, Nigeria</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-flame-500" />+234 800 000 0000</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-flame-500" />info@propertyquestion.com</div>
            </div>
          </div>

          {Object.values(footerLinks).map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-white/60 transition-colors hover:text-flame-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 md:flex-row">
          <p className="text-xs text-white/50">© 2026 Property Question Nigeria Limited. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a key={s} href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white transition-colors hover:bg-flame-500">
                {s}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <Link to="/privacy" className="hover:text-flame-400">Privacy</Link>
            <Link to="/terms" className="hover:text-flame-400">Terms</Link>
            <Link to="/cookies" className="hover:text-flame-400">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}