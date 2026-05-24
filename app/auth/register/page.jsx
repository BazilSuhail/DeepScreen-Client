"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineCheck,
  HiOutlineBriefcase, HiOutlineKey, HiOutlineSparkles, HiOutlineIdentification, HiOutlineArrowPath,
} from "react-icons/hi2";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import FormError from "@/components/auth/FormError";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { TextField } from "@/components/forms/FormFields";
import { primaryButton, secondaryButton, iconTile, badge } from "@/components/ui/styles";
import { base } from "@/constants/motion";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { getPostAuthPath } from "@/utils/authRoutes";
import { completeDesktopHandoff } from "@/utils/desktopHandoff";

const roles = [
  {
    value: "candidate", label: "Candidate", icon: HiOutlineBriefcase,
    desc: "Apply for jobs, complete assessments, and track your applications.",
    benefits: ["AI-powered job matching", "Adaptive skill assessments", "Integrity-verified profile"],
  },
];

const steps = [
  { label: "Start", desc: "Candidate signup", icon: HiOutlineSparkles },
  { label: "Email", desc: "Verify your email", icon: HiOutlineEnvelope },
  { label: "Profile", desc: "Set up your account", icon: HiOutlineIdentification },
];

const slide = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: base,
};

const Spinner = () => <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("candidate");
  const [formData, setFormData] = useState({ email: "", password: "", code: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestCode, register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestCode(formData.email);
      setStep(3);
    } catch (err) {
      setError(getAuthErrorMessage(err, "Failed to send code"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({ ...formData, role });
      router.push(getPostAuthPath(data));
    } catch (err) {
      setError(getAuthErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (s) => { if (s < step) { setStep(s); setError(""); } };

  const activeRole = roles.find((r) => r.value === role);

  return (
    <AuthLayout maxWidth="max-w-md">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create your candidate account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === 1 ? "Apply to jobs, take assessments, and track applications." : step === 2 ? "Enter your email address." : `Code sent to ${formData.email}`}
        </p>
      </div>

      <StepIndicator steps={steps} current={step} onSelect={goToStep} />

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <motion.div key="step1" {...slide} className="space-y-4">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRole(r.value)}
                  className={`flex w-full items-start gap-4 rounded-md border p-4 text-left transition-colors ${
                    active
                      ? "border-emerald-500 bg-emerald-50/70 dark:border-emerald-500/50 dark:bg-emerald-500/10"
                      : "border-border bg-card hover:border-emerald-300"
                  }`}
                >
                  <span className={`${iconTile} h-11 w-11 ${active ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{r.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{r.desc}</span>
                  </span>
                </button>
              );
            })}

            <ul className="flex flex-wrap gap-2" aria-label={`Why ${activeRole?.label}`}>
              {activeRole?.benefits.map((b) => (
                <li key={b} className={`${badge} bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
                  <HiOutlineCheck className="h-3.5 w-3.5" aria-hidden="true" /> {b}
                </li>
              ))}
            </ul>

            <button type="button" onClick={() => setStep(2)} className={`${primaryButton} w-full`}>
              Continue as {activeRole?.label}
              <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Or sign up with</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <FormError title="Couldn't sign you up" message={error} onDismiss={() => setError("")} />

            <GoogleAuthButton
              label="Sign up with Google"
              disabled={loading}
              onSuccess={(data) => {
                if (!completeDesktopHandoff(data)) router.push(getPostAuthPath(data));
              }}
              onError={(err) => setError(getAuthErrorMessage(err, "Google sign-up failed. Please try again."))}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.form key="step2" {...slide} onSubmit={handleRequestCode} className="space-y-4">
            <FormError title="Couldn't send the code" message={error} onDismiss={() => setError("")} />

            <TextField
              id="register-email"
              name="email"
              type="email"
              label="Email"
              icon={HiOutlineEnvelope}
              hint="We'll send a 6-digit verification code here."
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setStep(1); setError(""); }} className={`${secondaryButton} flex-1`}>
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <button type="submit" disabled={loading || !formData.email} aria-busy={loading} className={`${primaryButton} flex-[2]`}>
                {loading ? <><Spinner /> Sending code...</> : <>Send code <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form key="step3" {...slide} onSubmit={handleRegister} className="space-y-4">
            <FormError title="Couldn't create your account" message={error} onDismiss={() => setError("")} />

            <TextField
              id="register-code"
              name="code"
              type="text"
              label="Verification code"
              icon={HiOutlineKey}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={formData.code}
              onChange={handleChange}
              className="text-center text-lg font-semibold tracking-[0.5em]"
              placeholder="000000"
              maxLength={6}
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="register-first-name"
                name="first_name"
                type="text"
                label="First name"
                icon={HiOutlineUser}
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                required
              />
              <TextField
                id="register-last-name"
                name="last_name"
                type="text"
                label="Last name"
                icon={HiOutlineUser}
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>

            <TextField
              id="register-password"
              name="password"
              type="password"
              label="Password"
              icon={HiOutlineLockClosed}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setStep(2); setError(""); }} className={`${secondaryButton} flex-1`}>
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <button type="submit" disabled={loading} aria-busy={loading} className={`${primaryButton} flex-[2]`}>
                {loading ? <><Spinner /> Creating...</> : <>Create account <HiOutlineCheck className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-1 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">Recruiters are invited by organization owners.</p>
      </div>
    </AuthLayout>
  );
}
