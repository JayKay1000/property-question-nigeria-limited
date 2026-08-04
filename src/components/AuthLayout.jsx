import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Award, Users } from "lucide-react";
import Logo from "@/components/ui/Logo";

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop';

const trustBadges = [
{ icon: ShieldCheck, label: 'Bank-grade security' },
{ icon: Award, label: 'Award-winning service' },
{ icon: Users, label: '1,200+ happy clients' }];


export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Hero side */}
      <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden">
        <img src={HERO_IMAGE} alt="Luxury Nigerian real estate" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-900/85 to-brand-800/70" />
        <div className="relative z-10 p-10 xl:p-14">
          <Link to="/"><Logo variant="light" /></Link>
        </div>
        <div className="relative z-10 p-10 xl:p-14">
          <h2 className="font-heading text-3xl font-bold leading-tight text-white xl:text-4xl">Nigeria's Premier
Real Estate A
          </h2>
          <p className="mt-3 max-w-sm text-white/70">
            Buy, sell, build, and invest in real estate with confidence and transparency.
          </p>
          <div className="mt-8 space-y-3">
            {trustBadges.map((badge) =>
            <div key={badge.label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <badge.icon className="h-4 w-4 text-flame-400" />
                </div>
                <span className="text-sm text-white/80">{badge.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>
          <div className="mb-6 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-premium sm:p-8">
            {children}
          </div>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>);

}