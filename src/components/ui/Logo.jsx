import { Link } from 'react-router-dom';

export default function Logo({ className = '', variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl shadow-premium transition-transform group-hover:scale-105 ${
        isLight ? 'bg-white/10 backdrop-blur-md ring-1 ring-white/25' : 'bg-gradient-to-br from-brand-700 to-brand-900'
      }`}>
        <span className="font-heading text-lg font-extrabold text-white">PQ</span>
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-flame-500 ring-2 ring-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-heading text-sm font-extrabold tracking-tight ${isLight ? 'text-white' : 'text-brand-800'}`}>
          PROPERTY QUESTION
        </span>
        <span className="font-heading text-[10px] font-semibold tracking-[0.2em] text-flame-500">
          NIGERIA LIMITED
        </span>
      </div>
    </Link>
  );
}