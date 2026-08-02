import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, ArrowRight, User, Phone, MapPin, FileText, CheckCircle,
} from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import StepIndicator from "@/components/auth/StepIndicator";

const stepLabels = ["Account", "Personal", "Preferences", "Consent"];
const countries = ["Nigeria", "Ghana", "United Kingdom", "United States", "Canada", "South Africa", "UAE", "Other"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "", password: "", confirmPassword: "",
    firstName: "", middleName: "", lastName: "", phone: "",
    country: "Nigeria", state: "", city: "", address: "",
    referralCode: "", communicationPreference: "email",
    marketingConsent: false, newsletterSubscribed: false,
    termsAccepted: false, privacyAccepted: false,
    cookieAccepted: false, dataProcessingAccepted: false,
  });

  const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!formData.email) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(formData.email)) return "Please enter a valid email address";
      if (formData.password.length < 8) return "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    }
    if (step === 1) {
      if (!formData.firstName.trim()) return "First name is required";
      if (!formData.lastName.trim()) return "Last name is required";
      if (!formData.phone.trim()) return "Phone number is required";
      if (!formData.state.trim()) return "State is required";
      if (!formData.city.trim()) return "City is required";
    }
    if (step === 3) {
      if (!formData.termsAccepted || !formData.privacyAccepted || !formData.cookieAccepted || !formData.dataProcessingAccepted)
        return "Please accept all required terms to continue";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await base44.auth.register({ email: formData.email, password: formData.password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: formData.email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
        try {
          await base44.auth.updateMe({
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            phone: formData.phone,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            address: formData.address,
            referral_code: formData.referralCode,
            communication_preference: formData.communicationPreference,
            marketing_consent: formData.marketingConsent,
            newsletter_subscribed: formData.newsletterSubscribed,
            account_status: "email_verified",
          });
        } catch (profileErr) {
          console.error("Profile save failed:", profileErr);
        }
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(formData.email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  /* ── OTP Screen ── */
  if (showOtp) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${formData.email}`}
      >
        {error && (
          <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium bg-flame-500 hover:bg-flame-600 text-white"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify & Continue"}
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="font-medium text-flame-600 hover:underline">Resend</button>
        </p>
      </AuthLayout>
    );
  }

  /* ── Wizard ── */
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Nigeria's premier PropTech platform"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="font-medium text-flame-600 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      {step === 0 && (
        <>
          <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6 border-brand-200 hover:bg-brand-50" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />Continue with Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-100" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-muted-foreground">or</span></div>
          </div>
        </>
      )}

      <StepIndicator steps={stepLabels} current={step} />

      {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com"
                    value={formData.email} onChange={(e) => set("email", e.target.value)} className="pl-10 h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                    placeholder="••••••••" value={formData.password} onChange={(e) => set("password", e.target.value)}
                    className="pl-10 pr-10 h-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-800">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={formData.password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password"
                    placeholder="••••••••" value={formData.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)} className="pl-10 h-12" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name <span className="text-error">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="firstName" autoFocus placeholder="John" value={formData.firstName}
                      onChange={(e) => set("firstName", e.target.value)} className="pl-10 h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name <span className="text-error">*</span></Label>
                  <Input id="lastName" placeholder="Doe" value={formData.lastName}
                    onChange={(e) => set("lastName", e.target.value)} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="middleName" placeholder="Oluwaseun" value={formData.middleName}
                  onChange={(e) => set("middleName", e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number <span className="text-error">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="+234 800 000 0000" value={formData.phone}
                    onChange={(e) => set("phone", e.target.value)} className="pl-10 h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-error">*</span></Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="state" placeholder="Lagos" value={formData.state}
                      onChange={(e) => set("state", e.target.value)} className="pl-10 h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-error">*</span></Label>
                  <Input id="city" placeholder="Lekki" value={formData.city}
                    onChange={(e) => set("city", e.target.value)} className="h-12" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Residential address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <textarea id="address" rows={2} placeholder="Enter your residential address" value={formData.address}
                  onChange={(e) => set("address", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral">Referral code <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="referral" placeholder="PQ-XXXX" value={formData.referralCode}
                  onChange={(e) => set("referralCode", e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comm">Preferred communication method</Label>
                <Select value={formData.communicationPreference} onValueChange={(v) => set("communicationPreference", v)}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Both Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox id="marketing" checked={formData.marketingConsent} onCheckedChange={(v) => set("marketingConsent", !!v)} className="mt-0.5" />
                  <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer text-muted-foreground">
                    I consent to receive marketing communications about properties and offers
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="newsletter" checked={formData.newsletterSubscribed} onCheckedChange={(v) => set("newsletterSubscribed", !!v)} className="mt-0.5" />
                  <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer text-muted-foreground">
                    Subscribe to our weekly newsletter with market insights
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Consent */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-brand-50 p-4">
                <p className="text-sm text-brand-800">
                  Please review and accept our legal documents to create your account. Your consent will be recorded with a timestamp.
                </p>
              </div>
              {[
                { key: "termsAccepted", label: "Terms of Service", link: "/terms" },
                { key: "privacyAccepted", label: "Privacy Policy", link: "/privacy" },
                { key: "cookieAccepted", label: "Cookie Policy", link: "/cookies" },
                { key: "dataProcessingAccepted", label: "Data Processing Consent", link: "/privacy" },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-3 rounded-lg border border-brand-100 p-3">
                  <Checkbox id={item.key} checked={formData[item.key]} onCheckedChange={(v) => set(item.key, !!v)} className="mt-0.5" />
                  <Label htmlFor={item.key} className="text-sm font-normal cursor-pointer">
                    I agree to the{" "}
                    <Link to={item.link} className="font-medium text-flame-600 hover:underline">{item.label}</Link>
                    <span className="text-error"> *</span>
                  </Label>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Your IP address and timestamp will be recorded for audit purposes.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack} className="h-12 px-4 border-brand-200" disabled={loading}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={handleNext} className="h-12 flex-1 bg-flame-500 hover:bg-flame-600 text-white">
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="h-12 flex-1 bg-flame-500 hover:bg-flame-600 text-white" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : <><CheckCircle className="w-4 h-4 mr-2" />Create account</>}
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}