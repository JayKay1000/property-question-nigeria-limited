import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/ui/Reveal';

function Counter({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [count, setCount] = useState(to);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (value) => setCount(Math.floor(value)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 500, suffix: '+', label: 'Properties Sold' },
  { value: 1200, suffix: '+', label: 'Happy Clients' },
  { value: 45, suffix: '+', label: 'Estate Projects' },
  { value: 15, suffix: '+', label: 'Years of Excellence' },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-brand-900 py-20 lg:py-24">
      <div className="absolute inset-0">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-flame-500/10 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-72 w-72 rounded-full bg-ice-400/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
      </div>
      <div className="container-wide section-pad relative">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1} className="text-center">
              <div className="font-heading text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider text-white/60">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}