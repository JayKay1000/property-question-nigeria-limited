import { MessageCircle } from 'lucide-react';

export default function FloatingActions() {
  return (
    <a
      href="https://wa.me/2349033393000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-premium-lg transition-transform hover:scale-110"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-20" />
    </a>
  );
}