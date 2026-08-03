import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { Home, Building2, HardHat, MapPin, Headphones, Users, FileText, Briefcase, Heart, Search, HelpCircle, Mail, BookOpen, Newspaper, Shield } from 'lucide-react';

const sections = [
  {
    title: 'Main Pages',
    icon: Home,
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Testimonials', href: '/testimonials' },
    ],
  },
  {
    title: 'Property & Projects',
    icon: Building2,
    links: [
      { label: 'Property Listings', href: '/properties' },
      { label: 'Projects', href: '/projects' },
      { label: 'Property Tours', href: '/tours' },
      { label: 'GIS & Location Intelligence', href: '/gis' },
      { label: 'Property Owner Submission', href: '/submit' },
      { label: 'Agents', href: '/agents' },
    ],
  },
  {
    title: 'Resources',
    icon: BookOpen,
    links: [
      { label: 'Blog & Insights', href: '/blog' },
      { label: 'News & Announcements', href: '/news' },
      { label: 'Careers', href: '/careers' },
      { label: 'Corporate Social Responsibility', href: '/csr' },
      { label: 'Buy2Flip', href: '/buy2flip' },
      { label: 'Customer Portal', href: '/portal' },
    ],
  },
  {
    title: 'Legal & Policies',
    icon: Shield,
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Accessibility Statement', href: '/accessibility' },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Sitemap"
        subtitle="Find everything on our website — all pages organised in one place."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sitemap' }]}
      />
      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sections.map((section) => (
              <Card key={section.title} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-flame-50 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-flame-600" />
                  </div>
                  <h2 className="text-lg font-heading font-bold">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-muted-foreground hover:text-flame-600 transition-colors flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-flame-400" /> {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}