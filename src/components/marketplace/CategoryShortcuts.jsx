import { Link } from 'react-router-dom';
import { Tag, Home, Map, Store, Building } from 'lucide-react';

const categories = [
  { label: 'Properties for Sale', desc: 'Buy homes, apartments & more', href: '/properties?purpose=sale', icon: Tag, color: 'bg-flame-50 text-flame-600' },
  { label: 'Properties for Rent', desc: 'Find your next home to rent', href: '/properties?purpose=rent', icon: Home, color: 'bg-ice-50 text-ice-600' },
  { label: 'Land & Plots', desc: 'Buildable plots across Nigeria', href: '/properties?type=land', icon: Map, color: 'bg-success/10 text-success' },
  { label: 'Commercial Properties', desc: 'Offices, shops & warehouses', href: '/properties?type=commercial', icon: Store, color: 'bg-brand-50 text-brand-700' },
  { label: 'New Developments', desc: 'Off-plan & estate projects', href: '/projects', icon: Building, color: 'bg-warning/10 text-warning' },
];

export default function CategoryShortcuts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-1 text-xl font-heading font-bold text-brand-900">Browse by Category</h2>
      <p className="mb-6 text-sm text-muted-foreground">Find exactly what you're looking for across Nigeria's property market.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.label}
              to={cat.href}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:border-flame-300 hover:shadow-card"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${cat.color} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-semibold text-brand-900 group-hover:text-flame-600">{cat.label}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{cat.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}