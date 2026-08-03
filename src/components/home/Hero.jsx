import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80&auto=format&fit=crop';
const HERO_VIDEO = 'https://media.base44.com/videos/public/6a6f7e5cd57da090e5283ea3/f7b76c3c0_Hero_Video.mp4';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_IMAGE}
          className="h-full w-full object-cover">
          
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/70 to-brand-800/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-transparent" />
        <div className="absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-ice-400/20 blur-3xl" />
      </div>

      <div className="container-wide section-pad relative z-10 py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md" translate="no">Nigeria's Premier Real Estate Platform</span>
          </motion.div>

          <motion.h1
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            
            The Future of
            <span className="block bg-gradient-to-r from-flame-400 to-flame-600 bg-clip-text text-transparent">
              Nigerian Real Estate
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            
            From property sales and construction to estate development and Buy2Flip investments — we're redefining how Nigerians buy, sell, and invest in real estate.
          </motion.p>

          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-4">
            
            <Button asChild size="lg" className="bg-flame-500 hover:bg-flame-600 text-white shadow-glow-flame">
              <Link to="/properties">Explore Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:text-white">
              <Link to="/services"><Play className="mr-2 h-4 w-4" />Our Services</Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-8">
            
            {[
            { value: '₦200B+', label: 'Property Value Sold' },
            { value: '1,200+', label: 'Happy Clients' },
            { value: '45+', label: 'Estate Projects' }].
            map((stat) =>
            <div key={stat.label}>
                <div className="font-heading text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block">
        
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-2 w-1 rounded-full bg-white/70" />
          
        </div>
      </motion.div>
    </section>);

}