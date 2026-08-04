import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

import AccountTypeSelector from "@/components/auth/AccountTypeSelector";
import RegisterProgressBar from "@/components/auth/RegisterProgressBar";
import ConfirmationScreen from "@/components/auth/ConfirmationScreen";
import CredentialsStep from "@/components/auth/steps/CredentialsStep";
import PersonalStep from "@/components/auth/steps/PersonalStep";
import OwnerPropertyStep from "@/components/auth/steps/OwnerPropertyStep";
import CorporateStep from "@/components/auth/steps/CorporateStep";
import ConsentStep from "@/components/auth/steps/ConsentStep";
import AgentPersonalStep from "@/components/auth/steps/AgentPersonalStep";
import AgentProfessionalStep from "@/components/auth/steps/AgentProfessionalStep";
import AgentIdentityStep from "@/components/auth/steps/AgentIdentityStep";
import AgentBankingStep from "@/components/auth/steps/AgentBankingStep";
import AgentDeclarationStep from "@/components/auth/steps/AgentDeclarationStep";
import ReviewStep from "@/components/auth/steps/ReviewStep";

const DRAFT_KEY = "pq_register_draft_v1";

const STEP_CONFIGS = {
  customer: [
    { key: "credentials", label: "Account" },
    { key: "personal", label: "Personal" },
    { key: "consent", label: "Consent" },
    { key: "review", label: "Review" },
  ],
  owner: [
    { key: "credentials", label: "Account" },
    { key: "personal", label: "Personal" },
    { key: "property", label: "Property" },
    { key: "consent", label: "Consent" },
    { key: "review", label: "Review" },
  ],
  corporate: [
    { key: "credentials", label: "Account" },
    { key: "personal", label: "Personal" },
    { key: "corporate", label: "Company" },
    { key: "consent", label: "Consent" },
    { key: "review", label: "Review" },
  ],
  agent: [
    { key: "personal", label: "Personal" },
    { key: "professional", label: "Professional" },
    { key: "identity", label: "Identity" },
    { key: "banking", label: "Banking" },
    { key: "declaration", label: "Declaration" },
    { key: "review", label: "Review" },
  ],
};

const TITLE_MAP = {
  customer: "Create a Customer Account",
  owner: "Register as a Property Owner",
  agent: "Become a Verified Agent",
  corporate: "Register a Corporate Account",
};

const REQUIRED_AGENT_DOCS = ["passport_photograph", "government_id", "utility_bill", "proof_of_address", "selfie_with_id"];

function blankForm() {
  return {
    accountType: "",
    email: "", password: "", confirmPassword: "",
    firstName: "", middleName: "", lastName: "", phone: "",
    country: "Nigeria", state: "", city: "", address: "",
    propertyType: "", propertyLocation: "", reasonForListing: "", preferredContact: "",
    companyName: "", companyRegNumber: "", companyAddress: "", contactRole: "",
    gender: "", dateOfBirth: "", nationality: "Nigeria", lga: "",
    occupation: "", yearsExperience: "", realEstateExperience: "", company: "", linkedin: "",
    certifications: "", areasOfOperation: "", preferredStates: "", languages: "", bio: "",
    bankAccountName: "", bankAccountNumber: "", bankName: "",
    emergencyName: "", emergencyRelationship: "", emergencyPhone: "", emergencyEmail: "",
    decCertCorrect: false, decAgreeTerms: false, decUnderstandVerify: false,
    electronicSignature: "", declarationDate: "",
    termsAccepted: false, privacyAccepted: false, cookieAccepted: false, dataProcessingAccepted: false,
  };
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Register() {
  const [phase, setPhase] = useState("select"); // select | form | otp | done
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(blankForm);
  const [docs, setDocs] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setDoc = (key, url) => setDocs((p) => ({ ...p, [key]: url }));

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft?.form?.accountType && STEP_CONFIGS[draft.form.accountType]) {
      setForm((p) => ({ ...p, ...draft.form }));
      if (draft.docs) setDocs(draft.docs);
      if (typeof draft.step === "number") setStep(draft.step);
      setPhase("form");
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const preset = urlParams.get("type");
    if (preset && STEP_CONFIGS[preset]) {
      setForm((p) => ({ ...p, accountType: preset }));
      setPhase("form");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist progress
  useEffect(() => {
    if (phase === "form" && form.accountType) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, docs, step }));
    }
  }, [form, docs, step, phase]);

  const steps = useMemo(() => (form.accountType ? STEP_CONFIGS[form.accountType] : []), [form.accountType]);

  const handleSelectType = (type) => {
    setForm((p) => ({ ...p, accountType: type }));
    setStep(0);
    setError("");
    setPhase("form");
  };

  const validateStep = (stepKey) => {
    const f = form;
    const req = (val, msg) => (val && val.trim() ? null : msg);
    if (stepKey === "credentials") {
      if (!f.email) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(f.email)) return "Please enter a valid email address";
      if (f.password.length < 8) return "Password must be at least 8 characters";
      if (f.password !== f.confirmPassword) return "Passwords do not match";
      return null;
    }
    if (stepKey === "personal") {
      if (f.accountType === "agent") {
        if (req(f.firstName, "First name is required")) return req(f.firstName, "First name is required");
        if (req(f.lastName, "Last name is required")) return req(f.lastName, "Last name is required");
        if (req(f.dateOfBirth, "Date of birth is required")) return req(f.dateOfBirth, "Date of birth is required");
        if (req(f.address, "Residential address is required")) return req(f.address, "Residential address is required");
        if (req(f.city, "City is required")) return req(f.city, "City is required");
        if (req(f.state, "State is required")) return req(f.state, "State is required");
        if (req(f.phone, "Phone number is required")) return req(f.phone, "Phone number is required");
        if (!f.email) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(f.email)) return "Please enter a valid email address";
        if (f.password.length < 8) return "Password must be at least 8 characters";
        if (f.password !== f.confirmPassword) return "Passwords do not match";
        return null;
      }
      if (req(f.firstName, "First name is required")) return req(f.firstName, "First name is required");
      if (req(f.lastName, "Last name is required")) return req(f.lastName, "Last name is required");
      if (req(f.phone, "Phone number is required")) return req(f.phone, "Phone number is required");
      if (req(f.state, "State is required")) return req(f.state, "State is required");
      if (req(f.city, "City is required")) return req(f.city, "City is required");
      return null;
    }
    if (stepKey === "property") {
      if (req(f.propertyType, "Property type is required")) return req(f.propertyType, "Property type is required");
      if (req(f.propertyLocation, "Property location is required")) return req(f.propertyLocation, "Property location is required");
      if (req(f.reasonForListing, "Reason for listing is required")) return req(f.reasonForListing, "Reason for listing is required");
      return null;
    }
    if (stepKey === "corporate") {
      if (req(f.companyName, "Company name is required")) return req(f.companyName, "Company name is required");
      if (req(f.contactRole, "Your role is required")) return req(f.contactRole, "Your role is required");
      return null;
    }
    if (stepKey === "consent") {
      if (!f.termsAccepted || !f.privacyAccepted || !f.cookieAccepted || !f.dataProcessingAccepted)
        return "Please accept all required terms to continue";
      return null;
    }
    if (stepKey === "professional") {
      if (req(f.occupation, "Occupation is required")) return req(f.occupation, "Occupation is required");
      if (req(f.areasOfOperation, "Areas of operation is required")) return req(f.areasOfOperation, "Areas of operation is required");
      if (req(f.languages, "Languages spoken is required")) return req(f.languages, "Languages spoken is required");
      return null;
    }
    if (stepKey === "identity") {
      const missing = REQUIRED_AGENT_DOCS.filter((d) => !docs[d]);
      if (missing.length) return "Please upload all required documents";
      return null;
    }
    if (stepKey === "banking") {
      if (req(f.bankAccountName, "Account name is required")) return req(f.bankAccountName, "Account name is required");
      if (req(f.bankAccountNumber, "Account number is required")) return req(f.bankAccountNumber, "Account number is required");
      if (req(f.bankName, "Bank name is required")) return req(f.bankName, "Bank name is required");
      if (req(f.emergencyName, "Emergency contact name is required")) return req(f.emergencyName, "Emergency contact name is required");
      if (req(f.emergencyPhone, "Emergency contact phone is required")) return req(f.emergencyPhone, "Emergency contact phone is required");
      return null;
    }
    if (stepKey === "declaration") {
      if (!f.decCertCorrect || !f.decAgreeTerms || !f.decUnderstandVerify)
        return "Please confirm all declarations to continue";
      if (req(f.electronicSignature, "Electronic signature is required")) return req(f.electronicSignature, "Electronic signature is required");
      return null;
    }
    return null;
  };

  const handleNext = () => {
    const stepKey = steps[step]?.key;
    const err = validateStep(stepKey);
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError("");
    if (step === 0) {
      setPhase("select");
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, docs, step }));
    toast({ title: "Progress saved", description: "You can return later to continue your registration." });
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  const handleSubmit = async () => {
    // Validate all steps
    for (const s of steps) {
      const err = validateStep(s.key);
      if (err) { setError(err); setStep(steps.findIndex((x) => x.key === s.key)); return; }
    }
    setLoading(true);
    setError("");
    try {
      await base44.auth.register({ email: form.email, password: form.password });
      setPhase("otp");
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
      const result = await base44.auth.verifyOtp({ email: form.email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);

        // Build profile payload
        const profile = {
          first_name: form.firstName,
          middle_name: form.middleName,
          last_name: form.lastName,
          phone: form.phone,
          country: form.country,
          state: form.state,
          city: form.city,
          address: form.address,
          account_type: form.accountType,
          account_status: "email_verified",
        };
        if (form.accountType === "owner") {
          profile.property_type = form.propertyType;
          profile.property_location = form.propertyLocation;
          profile.reason_for_listing = form.reasonForListing;
          profile.preferred_contact = form.preferredContact;
        }
        if (form.accountType === "corporate") {
          profile.company_name = form.companyName;
          profile.company_reg_number = form.companyRegNumber;
          profile.company_address = form.companyAddress;
          profile.contact_role = form.contactRole;
        }

        try {
          await base44.auth.updateMe(profile);
        } catch (profileErr) {
          console.error("Profile save failed:", profileErr);
        }

        // Agent: create application record + documents
        if (form.accountType === "agent") {
          try {
            const me = await base44.auth.me();
            const fullName = `${form.firstName} ${form.lastName}`.trim();
            const agent = await base44.entities.Agent.create({
              user_id: me.id,
              full_name: fullName,
              email: form.email,
              phone: form.phone,
              photo_url: docs.passport_photograph || "",
              specialization: "residential",
              service_areas: (form.areasOfOperation || "").split(",").map((s) => s.trim()).filter(Boolean),
              languages: (form.languages || "").split(",").map((s) => s.trim()).filter(Boolean),
              status: "pending",
              verification_status: "unverified",
              metadata: {
                gender: form.gender,
                date_of_birth: form.dateOfBirth,
                nationality: form.nationality,
                lga: form.lga,
                occupation: form.occupation,
                years_experience: form.yearsExperience,
                real_estate_experience: form.realEstateExperience,
                company: form.company,
                linkedin: form.linkedin,
                certifications: form.certifications,
                preferred_states: form.preferredStates,
                bio: form.bio,
                bank_account_name: form.bankAccountName,
                bank_account_number: form.bankAccountNumber,
                bank_name: form.bankName,
                emergency_name: form.emergencyName,
                emergency_relationship: form.emergencyRelationship,
                emergency_phone: form.emergencyPhone,
                emergency_email: form.emergencyEmail,
                electronic_signature: form.electronicSignature,
                declaration_date: form.declarationDate,
                account_type: form.accountType,
              },
            });

            const docEntries = Object.entries(docs).filter(([, url]) => url);
            for (const [type, url] of docEntries) {
              await base44.entities.AgentDocument.create({
                document_id: `doc-${Date.now()}-${type}`,
                agent_id: agent.id,
                agent_name: fullName,
                document_type: type,
                file_url: url,
                verification_status: "pending",
                is_confidential: true,
              });
            }
          } catch (agentErr) {
            console.error("Agent application creation failed:", agentErr);
          }
        }

        localStorage.removeItem(DRAFT_KEY);
        setPhase("done");
      }
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(form.email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  /* ── Confirmation ── */
  if (phase === "done") {
    return (
      <AuthLayout title="Welcome to Property Question Nigeria">
        <ConfirmationScreen accountType={form.accountType} email={form.email} />
      </AuthLayout>
    );
  }

  /* ── OTP ── */
  if (phase === "otp") {
    return (
      <AuthLayout title="Verify your email" subtitle={`We sent a 6-digit code to ${form.email}`}>
        {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium bg-flame-500 hover:bg-flame-600 text-white" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify & Continue"}
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="font-medium text-flame-600 hover:underline">Resend</button>
        </p>
      </AuthLayout>
    );
  }

  /* ── Account type selection ── */
  if (phase === "select") {
    return (
      <AuthLayout
        title="Create your account"
        subtitle="Choose an account type to begin"
        footer={
          <>
            Already have an account?{" "}
            <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium text-flame-600 hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <Button variant="outline" className="w-full h-11 mb-4 border-brand-200 hover:bg-brand-50" onClick={handleGoogle}>
          <GoogleIcon className="w-5 h-5 mr-2" />Continue with Google
        </Button>
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-100" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-muted-foreground">or choose an account type</span></div>
        </div>
        <AccountTypeSelector value="" onSelect={handleSelectType} />
      </AuthLayout>
    );
  }

  /* ── Wizard ── */
  const currentKey = steps[step]?.key;
  const renderStep = () => {
    switch (currentKey) {
      case "credentials": return <CredentialsStep form={form} set={set} />;
      case "personal": return form.accountType === "agent" ? <AgentPersonalStep form={form} set={set} /> : <PersonalStep form={form} set={set} />;
      case "property": return <OwnerPropertyStep form={form} set={set} />;
      case "corporate": return <CorporateStep form={form} set={set} />;
      case "consent": return <ConsentStep form={form} set={set} />;
      case "professional": return <AgentProfessionalStep form={form} set={set} />;
      case "identity": return <AgentIdentityStep docs={docs} setDoc={setDoc} />;
      case "banking": return <AgentBankingStep form={form} set={set} />;
      case "declaration": return <AgentDeclarationStep form={form} set={set} />;
      case "review": return <ReviewStep form={form} docs={docs} />;
      default: return null;
    }
  };

  return (
    <AuthLayout
      title={TITLE_MAP[form.accountType] || "Create your account"}
      subtitle="Join Nigeria's premier PropTech platform"
      footer={
        <>
          Already have an account?{" "}
          <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium text-flame-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterProgressBar steps={steps} current={step} />

      {error && <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentKey}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={handleBack} className="h-11 px-4 border-brand-200" disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-1" />Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={handleNext} className="h-11 flex-1 bg-flame-500 hover:bg-flame-600 text-white">
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="h-11 flex-1 bg-flame-500 hover:bg-flame-600 text-white" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : <><CheckCircle className="w-4 h-4 mr-2" />Submit Application</>}
          </Button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Mail className="h-3.5 w-3.5" />
        <button onClick={handleSaveDraft} className="font-medium text-brand-700 hover:underline">Save progress & continue later</button>
      </div>
    </AuthLayout>
  );
}