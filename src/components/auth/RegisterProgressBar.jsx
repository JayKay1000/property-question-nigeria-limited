import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function RegisterProgressBar({ steps, current }) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {current + 1} of {steps.length}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-flame-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="mt-3 hidden flex-wrap gap-x-4 gap-y-1.5 sm:flex">
        {steps.map((s, i) => (
          <div key={s.key} className={`flex items-center gap-1.5 text-xs ${i <= current ? "text-brand-900" : "text-muted-foreground/50"}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
              i < current ? "bg-success text-white" : i === current ? "bg-flame-500 text-white" : "bg-brand-100 text-muted-foreground"
            }`}>
              {i < current ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}