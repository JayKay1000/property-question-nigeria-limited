import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const FALLBACK_TAGLINES = [
  { tagline_text: 'The Future of Nigerian Real Estate', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Building Tomorrow\u2019s Communities Today', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Where Vision Meets Valuable Property', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Turning Land Into Lasting Value', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Your Trusted Partner in Real Estate Excellence', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Connecting People to Exceptional Properties', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Creating Sustainable Property Opportunities', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Discover Properties. Build Wealth. Secure Your Future.', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Smart Real Estate Solutions for Modern Living', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Premium Properties. Trusted Professionals. Proven Results.', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Real Estate. Construction. Property Management. All Under One Roof.', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Discover Possibilities. Build with Confidence.', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Nigeria\u2019s Trusted Property Experts', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Building Dreams One Property at a Time', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Find the Right Property with Confidence', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'The Home of Trusted Real Estate Solutions', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Experience Excellence in Every Square Metre', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Your Journey to Property Ownership Starts Here', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Transforming Property into Opportunity', display_duration: 5, animation_style: 'default', is_special: false },
  { tagline_text: 'Welcome To Property Question Nigeria Limited', display_duration: 9, animation_style: 'default', is_special: true },
];

const EASE = [0.22, 1, 0.36, 1];

function TypingTagline({ text }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const perChar = Math.max(30, Math.min(70, (1800) / Math.max(text.length, 1)));
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, perChar);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {shown}
      <span className="ml-0.5 inline-block w-[2px] -translate-y-0.5 animate-pulse bg-current align-middle" style={{ height: '0.9em' }} />
    </span>
  );
}

function AnimatedTagline({ text, style, special }) {
  const words = text.split(' ');
  const enter = special ? 1.1 : 0.7;

  if (style === 'typing') {
    return (
      <motion.div
        key={text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease: EASE }}>
        <TypingTagline text={text} />
      </motion.div>
    );
  }

  if (style === 'word_by_word') {
    return (
      <motion.div
        key={text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
        transition={{ duration: 0.4 }}>
        {words.map((w, i) => (
          <motion.span
            key={`${text}-${i}`}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
            className="inline-block"
            style={{ marginRight: '0.28em' }}>
            {w}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  if (style === 'slide') {
    return (
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 44, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -44, scale: 0.98 }}
        transition={{ duration: enter, ease: EASE }}>
        {text}
      </motion.div>
    );
  }

  if (style === 'blur') {
    return (
      <motion.div
        key={text}
        initial={{ opacity: 0, filter: 'blur(18px)', scale: 1.04 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        exit={{ opacity: 0, filter: 'blur(18px)', scale: 1.04 }}
        transition={{ duration: enter, ease: EASE }}>
        {text}
      </motion.div>
    );
  }

  // fade (default)
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: special ? 1.3 : 0.8, ease: EASE }}>
      {text}
    </motion.div>
  );
}

export default function HeroTaglineRotator({ onSpecialChange, className = '' }) {
  const [taglines, setTaglines] = useState(FALLBACK_TAGLINES);
  const [globalStyle, setGlobalStyle] = useState('fade');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tl, settings] = await Promise.all([
          base44.entities.HeroTagline.filter({ is_enabled: true }, 'sort_order', 100),
          base44.entities.SiteContent.filter({ content_key: 'hero_tagline_settings' }, '-updated_date', 1),
        ]);
        if (!cancelled) {
          if (Array.isArray(tl) && tl.length) setTaglines(tl);
          if (Array.isArray(settings) && settings[0]?.metadata?.animation_style) {
            setGlobalStyle(settings[0].metadata.animation_style);
          }
        }
      } catch { /* keep fallback */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const current = taglines[index % taglines.length];
  const isSpecial = !!current?.is_special;
  const style = (current?.animation_style && current.animation_style !== 'default')
    ? current.animation_style
    : globalStyle;
  const holdSeconds = isSpecial ? Math.max(current?.display_duration || 9, 9) : (current?.display_duration || 5);

  useEffect(() => {
    onSpecialChange?.(isSpecial);
  }, [isSpecial, onSpecialChange]);

  useEffect(() => {
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % Math.max(taglines.length, 1));
    }, holdSeconds * 1000);
    return () => clearTimeout(id);
  }, [index, holdSeconds, taglines.length]);

  if (!current) return null;

  return (
    <div className={`relative ${className}`}>
      <h1 aria-live="polite" className="font-heading font-extrabold leading-[1.05] tracking-tight">
        <span
          className={`block transition-all duration-700 ${
            isSpecial
              ? 'bg-gradient-to-r from-flame-400 via-flame-500 to-ice-300 bg-clip-text text-transparent'
              : 'text-white'
          }`}
          style={isSpecial ? { textShadow: '0 0 38px rgba(255,122,0,0.45)' } : undefined}>
          <AnimatePresence mode="wait">
            <AnimatedTagline
              key={`${current.tagline_text}-${index}`}
              text={current.tagline_text}
              style={style}
              special={isSpecial} />
          </AnimatePresence>
        </span>
      </h1>

      <div className="relative mt-3 h-[3px] w-full max-w-md">
        <AnimatePresence>
          {isSpecial && (
            <motion.div
              key="underline"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
              className="h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-flame-400 to-ice-300"
              style={{ boxShadow: '0 0 18px rgba(255,122,0,0.6)' }} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}