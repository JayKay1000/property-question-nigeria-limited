import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, User, Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { base44 } from '@/api/base44Client';
import { normalizePhone, isValidEmail } from '@/lib/marketplace-utils';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';

export default function MarketplaceAgentRegister() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading'); // loading | loggedIn | notLoggedIn | otp | submitting
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', terms: false });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const user = await base44.auth.me();
          const existing = await base44.entities.Agent.filter({ user_id: user.id });
          if (existing.length > 0) {
            navigate('/marketplace/agent/profile');
            return;
          }
          setForm((p) => ({ ...p, email: user.email || '', firstName: user.full_name?.split(' ')[0] || '' }));
          setPhase('loggedIn');
        } else {
          setPhase('notLoggedIn');
        }
      } catch {
        setPhase('notLoggedIn');
      }
    })();
  }, [navigate]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.lastName.trim()) return 'Last name is required.';
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!isValidEmail(form.email)) return 'A valid email address is required.';
    if (phase === 'notLoggedIn' && form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!form.terms) return 'You must accept the marketplace terms to continue.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    try {
      if (phase === 'notLoggedIn') {
        await base44.auth.register({ email: form.email.trim().toLowerCase(), password: form.password });
        setPhase('otp');
      } else {
        await createAgentRecord();
      }
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) { setError('Enter the 6-digit code.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const result = await base44.auth.verifyOtp({ email: form.email.trim().toLowerCase(), otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
        await base44.auth.updateMe({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: normalizePhone(form.phone),
        });
        await createAgentRecord();
      }
    } catch (e) {
      setError(e.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const createAgentRecord = async () => {
    const user = await base44.auth.me();
    const existing = await base44.entities.Agent.filter({ user_id: user.id });
    if (existing.length > 0) {
      window.location.href = '/marketplace/agent/profile';
      return;
    }
    await base44.entities.Agent.create({
      user_id: user.id,
      full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: normalizePhone(form.phone),
      status: 'active',
      verification_status: 'unverified',
      tier: 'basic',
      identity_verification_status: 'not_submitted',
      address_verification_status: 'not_submitted',
      marketplace_terms_accepted: true,
      marketplace_terms_accepted_at: new Date().toISOString(),
    });
    window.location.href = '/marketplace/agent/profile';
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#fbfaf9]">
        <MarketplaceHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
        </div>
        <MarketplaceFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      <MarketplaceHeader />
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <Link to="/marketplace" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flame-50">
              <ShieldCheck className="h-6 w-6 text-flame-600" />
            </div>
            <h1 className="mt-3 font-heading text-xl font-bold text-brand-900">Become a Marketplace Agent</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {phase === 'otp' ? 'Enter the verification code sent to your email.' : 'Register free and start advertising properties across Nigeria.'}
            </p>
          </div>

          {phase === 'otp' ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-center text-sm text-error">{error}</p>}
              <Button onClick={handleVerifyOtp} disabled={submitting} className="w-full bg-flame-500 text-white hover:bg-flame-600">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : 'Verify & Continue'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-brand-800">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="John" className="h-10 pl-9" />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-brand-800">Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Doe" className="h-10" />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-semibold text-brand-800">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234 801 234 5678" className="h-10 pl-9" />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-semibold text-brand-800">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={phase === 'loggedIn'} placeholder="you@email.com" className="h-10 pl-9 disabled:opacity-60" />
                </div>
              </div>

              {phase === 'notLoggedIn' && (
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-brand-800">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 8 characters" className="h-10 pl-9 pr-9" />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-900" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-brand-50/50 p-3">
                <Checkbox checked={form.terms} onCheckedChange={(c) => set('terms', !!c)} className="mt-0.5" />
                <span className="text-xs leading-relaxed text-brand-700">
                  I accept the PQNL Marketplace <Link to="/terms" className="text-flame-600 underline">Terms</Link> and <Link to="/privacy" className="text-flame-600 underline">Privacy Notice</Link>. I understand that verification documents are reviewed confidentially and my tier is determined by approved verification only.
                </span>
              </label>

              {error && <p className="text-sm text-error">{error}</p>}

              <Button onClick={handleRegister} disabled={submitting} className="w-full bg-flame-500 text-white hover:bg-flame-600">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering…</> : <>Register as Agent <ArrowRight className="ml-1.5 h-4 w-4" /></>}
              </Button>

              {phase === 'notLoggedIn' && (
                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login?returnTo=/marketplace/agent/register" className="font-semibold text-flame-600 hover:underline">Sign in</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tier preview */}
        {phase !== 'otp' && (
          <div className="mt-5 rounded-xl border border-border bg-white p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Three Free Tiers
            </h3>
            <div className="space-y-1.5 text-xs text-brand-700">
              <div className="flex justify-between"><span>Tier 1 — Basic</span><span className="font-semibold">10 listings</span></div>
              <div className="flex justify-between"><span>Tier 2 — Identity Verified</span><span className="font-semibold">50 listings</span></div>
              <div className="flex justify-between"><span>Tier 3 — Address Verified</span><span className="font-semibold">Unlimited</span></div>
            </div>
          </div>
        )}
      </div>
      <MarketplaceFooter />
    </div>
  );
}