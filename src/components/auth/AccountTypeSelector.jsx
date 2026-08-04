import React from "react";
import { motion } from "framer-motion";
import { Home, Building2, Briefcase, Landmark, ArrowRight } from "lucide-react";

const TYPES = [
  { key: "customer", icon: Home, title: "Customer", desc: "I want to browse properties, save favourites, request inspections, and purchase properties." },
  { key: "owner", icon: Building2, title: "Property Owner", desc: "I want to submit my property to Property Question Nigeria Limited for marketing." },
  { key: "agent", icon: Briefcase, title: "Agent", desc: "I want to become a verified marketing partner of Property Question Nigeria Limited." },
  { key: "corporate", icon: Landmark, title: "Corporate Client", desc: "I represent a company or organisation." },
];

export default function AccountTypeSelector({ value, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {TYPES.map((t, i) => {
        const active = value === t.key;
        const Icon = t.icon;
        return (
          <motion.button
            key={t.key}
            type="button"
            onClick={() => onSelect(t.key)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            whileHover={{ y: -5 }}
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-colors ${
              active ? "border-flame-500 bg-flame-50 shadow-glow-flame" : "border-brand-100 bg-white hover:border-flame-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-flame-500 text-white" : "bg-ice-100 text-brand-800 group-hover:bg-flame-100"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-bold text-brand-900">{t.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
              </div>
            </div>
            {active && (
              <span className="absolute right-3 top-3 text-flame-500">
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}