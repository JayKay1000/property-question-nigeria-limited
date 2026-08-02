import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Reveal({ children, delay = 0, y = 24, className, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}