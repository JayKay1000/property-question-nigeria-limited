import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaYoutube,
    FaTiktok
} from "react-icons/fa";

import {
    FaTwitter
} from "react-icons/fa";
import Logo from '@/components/ui/Logo';
import Reveal from '@/components/ui/Reveal';
import NewsletterSignup from '@/components/marketing/NewsletterSignup';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Team', href: '/about#team' },
    { label: 'Careers', href: '/careers' },
    { label: 'CSR', href: '/csr' },
    { label: 'Contact', href: '/contact' }]

  },
  resources: {
    title: 'Resources',
    links: [
    { label: 'Blog & Insights', href: '/blog' },
    { label: 'News', href: '/news' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Sitemap', href: '/sitemap' }]

  },
  locations: {
    title: 'Locations',
    links: [
    { label: 'Lekki', href: '/properties?loc=lekki' },
    { label: 'Ikoyi', href: '/properties?loc=ikoyi' },
    { label: 'Victoria Island', href: '/properties?loc=vi' },
    { label: 'Abuja', href: '/properties?loc=abuja' },
    { label: 'Port Harcourt', href: '/properties?loc=ph' }]

  }
};



export default function Footer() {
  const socialLinks = [
    {
        name: "Facebook",
        url: "https://facebook.com/PropertyQuestionNigeriaLtd",
        icon: FaFacebookF,
    },
    {
        name: "Instagram",
        url: "https://instagram.com/propertyquestionnigeria",
        icon: FaInstagram,
    },
    {
        name: "LinkedIn",
        url: "https://linkedin.com/company/property-question-nigeria-limited",
        icon: FaLinkedinIn,
    },
    {
        name: "X",
        url: "https://x.com/propertyquestion",
        icon: FaXTwitter,
    },
    {
        name: "TikTok",
        url: "https://www.tiktok.com/@pqnl_x",
        icon: FaTiktok,
    },
    {
        name: "YouTube",
        url: "https://www.youtube.com/@propertyquestionnigeria",
        icon: FaYoutube,
    },
];
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
            <div className="w-full max-w-md">
              <NewsletterSignup source="footer" compact={true} />
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">Property Question Nigeria Limited is a premier property company transforming Nigeria's real estate landscape through technology, transparency, and trust.

            </p>
            <div className="mt-6 space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-flame-500" />Suite 43, Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos, Nigeria</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-flame-500" />+234 903 339 3000</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-flame-500" />info@propertyquestion.net</div>
            </div>
          </div>

          {Object.values(footerLinks).map((col) =>
          <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) =>
              <li key={link.label}>
                    <Link to={link.href} className="text-sm text-white/60 transition-colors hover:text-flame-400">
                      {link.label}
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 md:flex-row">
          <p className="text-xs text-white/50">© 2026 Property Question Nigeria Limited. All rights reserved.</p>
          <div className="flex items-center gap-3">

  {socialLinks.map((social) => {

    const Icon = social.icon;

    return (
      <a
        key={social.name}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.name}
        title={social.name}
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-white/10
          text-white
          transition-colors
          hover:bg-flame-500
        "
      >
        <Icon size={16} />
      </a>
    );

  })}

</div>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <Link to="/privacy" className="hover:text-flame-400">Privacy</Link>
            <Link to="/terms" className="hover:text-flame-400">Terms</Link>
            <Link to="/cookies" className="hover:text-flame-400">Cookies</Link>
            <Link to="/accessibility" className="hover:text-flame-400">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>);

}