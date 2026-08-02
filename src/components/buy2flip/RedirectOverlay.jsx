import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function RedirectOverlay({ show, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-950/95 p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="w-full max-w-md rounded-2xl border border-brand-700 bg-brand-900 p-8 text-center shadow-premium-lg"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 text-2xl font-bold text-white shadow-glow-flame">
              B2F
            </div>
            <h2 className="mb-2 text-2xl font-heading font-bold text-white">You're Almost There</h2>
            <p className="mb-6 text-sm leading-relaxed text-brand-200">
              You are leaving the Property Question Nigeria Limited website and will be redirected to the
              official Buy2Flip platform.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-flame-500 px-6 py-3 text-base font-heading font-semibold text-white shadow-glow-flame transition-all hover:bg-flame-600 active:scale-[0.98]"
              >
                Continue to Buy2Flip <ExternalLink className="h-4 w-4" />
              </button>
              <button onClick={onCancel} className="text-sm text-brand-300 hover:text-white">
                Stay on this site
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}