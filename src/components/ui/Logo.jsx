import { Link } from 'react-router-dom';

const LOGO_URL = 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/3d931c147_Group371.png';

export default function Logo({ className = '', variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <Link to="/" className={`flex items-center group ${className}`}>
      <img
        src={LOGO_URL}
        alt="Property Question Nigeria"
        className={`h-11 w-auto rounded-md object-contain transition-transform group-hover:scale-105 ${
          isLight ? 'ring-1 ring-white/20 shadow-premium' : ''
        }`}
      />
    </Link>
  );
}