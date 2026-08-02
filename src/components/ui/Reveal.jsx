import { motion } from 'framer-motion';

export default function Reveal({ children, delay = 0, y = 24, className, once = true }) {
  return (
    <motion.div
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}