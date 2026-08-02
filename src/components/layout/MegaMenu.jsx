import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function MegaMenu({ item }) {
  if (!item?.mega) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-full"
    >
      <div className="container-wide section-pad">
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-premium-lg">
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            {item.mega.sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-flame-600">
                  {section.title}
                </h3>
                <ul className="space-y-0.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="group flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-brand-50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-brand-900 group-hover:text-flame-600">
                            {link.label}
                          </div>
                          {link.desc && (
                            <div className="text-xs text-muted-foreground">{link.desc}</div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-flame-500 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}