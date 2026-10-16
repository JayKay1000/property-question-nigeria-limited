import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const cols = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Explore Properties', href: '/marketplace#explore' },
      { label: 'For Sale', href: '/properties?purpose=sale' },
      { label: 'For Rent', href: '/properties?purpose=rent' },
      { label: 'Land & Plots', href: '/properties?type=land' },
      { label: 'Commercial', href: '/properties?type=commercial' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'New Developments', href: '/projects' },
      { label: 'Featured Listings', href: '/properties?tag=luxury' },
      { label: 'Buy2Flip Deals', href: '/buy2flip' },
      { label: 'Find an Agent', href: '/agents' },
      { label: 'Submit a Property', href: '/submit' },
    ],
  },
  {
    title: 'PQNL',
    links: [
      { label: 'Back to Website', href: '/' },
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog & Insights', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

export default function MarketplaceFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Nigeria's property classifieds marketplace, powered by Property Question Nigeria Limited.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" /> Suite 43, Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-flame-500" /> +234 903 339 3000</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-flame-500" /> info@propertyquestion.net</div>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-900">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-flame-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 Property Question Nigeria Limited. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-flame-600">Privacy</Link>
            <Link to="/terms" className="hover:text-flame-600">Terms</Link>
            <Link to="/cookies" className="hover:text-flame-600">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}