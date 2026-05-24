"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineEnvelope, HiOutlineKey, HiOutlineUser, HiOutlineLockClosed,
  HiOutlineShieldCheck, HiOutlineIdentification,
  HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheck, HiOutlineBuildingOffice2, HiOutlineArrowPath,
} from "react-icons/hi2";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import FormError from "@/components/auth/FormError";
import { STAFF_SHOWCASE } from "@/components/auth/showcaseContent";
import { TextField } from "@/components/forms/FormFields";
import { primaryButton, secondaryButton } from "@/components/ui/styles";

const steps = [
  { label: "Account", icon: HiOutlineUser },
  { label: "Verify", icon: HiOutlineShieldCheck },
  { label: "Profile", icon: HiOutlineIdentification },
];

const backButton = `${secondaryButton} flex-1`;

// Raw JSON or object errors are not for people to read; fall back to a plain sentence.
function readableError(err, fallback) {
  const text = typeof err?.message === "string" ? err.message.trim() : "";
  if (!text || text.startsWith("{") || text.startsWith("[") || text === "[object Object]") return fallback;
  return text;
}

export default function StaffRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "", code: "", first_name: "", last_name: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestStaffCode, registerStaff } = useAuth();
  const router = useRouter();
  const StepIcon = steps[step - 1].icon;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "code") setCodeError("");
  };

  const goToStep = (n) => { setStep(n); setError(""); setCodeError(""); };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestStaffCode(formData.email);
      setStep(2);
    } catch (err) {
      setError(readableError(err, "We could not send the code. Check the address and try again."));
    } finally {
      setLoading(false);
    }
  };

  // The code is checked by the server as part of registration, so this step only
  // confirms the format before moving on.
  const handleVerify = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(formData.code)) {
      setCodeError("Enter the 6-digit code from your email.");
      return;
    }
    goToStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== confirmPassword) {
      setConfirmError("Passwords do not match. Re-type the same password in both fields.");
      return;
    }
    setLoading(true);
    try {
      await registerStaff(formData);
      router.replace("/organizations");
    } catch (err) {
      setError(readableError(err, "We could not create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showcase={STAFF_SHOWCASE}>
      <div className="mb-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          <HiOutlineBuildingOffice2 className="h-3.5 w-3.5" aria-hidden="true" />
          Staff Portal
        </span>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10">
            <StepIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Staff access</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 1 && "Enter your work email to get started"}
              {step === 2 && `Staff code sent to ${formData.email}`}
              {step === 3 && "Add your name and set a password"}
            </p>
          </div>
        </div>
      </div>

      <StepIndicator steps={steps} current={step} onSelect={goToStep} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleRequestCode}
            className="space-y-4"
          >
            <FormError title="Could not send the code" message={error} onDismiss={() => setError("")} />

            <TextField
              id="email"
              label="Work Email"
              icon={HiOutlineEnvelope}
              hint="Use your work email. Your organization invite is sent here."
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
            />

            <p className="text-xs text-muted-foreground">Next we send a 6-digit code to your email.</p>

            <button type="submit" disabled={loading} className={`${primaryButton} w-full`}>
              {loading && <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {loading ? "Sending code..." : "Continue with email"}
              {!loading && <HiOutlineArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleVerify}
            className="space-y-4"
          >
            <FormError title="Could not verify you" message={error} onDismiss={() => setError("")} />

            <TextField
              id="code"
              label="Verification Code"
              icon={HiOutlineKey}
              hint="Enter the 6-digit code we just emailed you. It expires in 15 minutes."
              error={codeError}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={formData.code}
              onChange={handleChange}
              className="text-center text-lg font-semibold tracking-[0.5em]"
              placeholder="000000"
              maxLength={6}
              required
            />

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => goToStep(1)} className={backButton}>
                <HiOutlineArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back
              </button>
              <button type="submit" className={`${primaryButton} flex-[2]`}>
                Continue
                <HiOutlineArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <FormError title="Could not create your account" message={error} onDismiss={() => setError("")} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="first_name"
                label="First Name"
                icon={HiOutlineUser}
                hint="Your first name, as your team will see it."
                name="first_name"
                type="text"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Jane"
                required
              />
              <TextField
                id="last_name"
                label="Last Name"
                icon={HiOutlineUser}
                hint="Your last name, as your team will see it."
                name="last_name"
                type="text"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Smith"
                required
              />
            </div>

            <TextField
              id="password"
              label="Password"
              icon={HiOutlineLockClosed}
              hint="At least 8 characters. Use a mix you do not use elsewhere."
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <TextField
              id="confirm_password"
              label="Confirm password"
              icon={HiOutlineLockClosed}
              hint={confirmPassword && confirmPassword === formData.password ? "Passwords match." : "Re-type the password above."}
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
              error={confirmError}
              placeholder="••••••••"
              required
            />

            <p className="text-xs text-muted-foreground">After this you will create your organization.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => goToStep(2)} className={backButton}>
                <HiOutlineArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back
              </button>
              <button type="submit" disabled={loading} className={`${primaryButton} flex-[2]`}>
                {loading && <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                {loading ? "Creating..." : "Create account"}
                {!loading && <HiOutlineCheck className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
