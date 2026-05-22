"use client";

import { useState } from "react";
import { useAuth } from "@/context/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  LuMail, LuLock, LuUser, LuArrowRight, LuArrowLeft, LuCheck,
  LuBriefcase,
} from "react-icons/lu";
import AuthShowcase from "@/components/auth/AuthShowcase";
import AuthGridBackground from "@/components/auth/AuthGridBackground";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { getPostAuthPath } from "@/utils/authRoutes";

const roles = [
  {
    value: "candidate", label: "Candidate", icon: LuBriefcase,
    desc: "Apply for jobs, complete assessments, and track your applications.",
    benefits: ["AI-powered job matching", "Adaptive skill assessments", "Integrity-verified profile"],
  },
];

const steps = [
  { label: "Start", desc: "Candidate signup" },
  { label: "Email", desc: "Verify your email" },
  { label: "Profile", desc: "Set up your account" },
];

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
      setError(err.message || "Failed to send code");
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
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (s) => { if (s < step) { setStep(s); setError(""); } };

  const stepIndicator = (
    <div className="flex items-center justify-center mb-5">
      {steps.map((s, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isCurrent = num === step;
        return (
          <div key={num} className="flex items-center">
            <button
              onClick={() => goToStep(num)}
              disabled={num > step}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isCurrent
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-border text-foreground/30 bg-muted"
                } ${num < step ? "cursor-pointer hover:border-emerald-400" : "cursor-default"}`}
              >
                {isDone ? <LuCheck className="w-4 h-4" /> : <span>{num}</span>}
              </div>
              <span className={`text-[11px] font-semibold tracking-wider ${isCurrent ? "text-emerald-400" : "text-foreground/30"}`}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-10 h-0.5 mx-1 transition-colors ${num <= step ? "bg-emerald-500/50" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-screen max-w-full overflow-hidden">
      {/* Grid stands in for the showcase panel below lg */}
      <AuthGridBackground className="lg:hidden" />
      <div className="relative flex min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2.5">
              <Image src="/deepscreen.webp" alt="DeepScreen" width={36} height={36} className="h-9 w-9 object-contain" priority />
              <span className="text-lg font-bold text-foreground">DeepScreen</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Create your candidate account</h1>
            <p className="text-foreground/40 text-xs mt-0.5">
              {step === 1 ? "Apply to jobs, take assessments, and track applications" : step === 2 ? "Enter your email address" : `Code sent to ${formData.email}`}
            </p>
          </div>

          {stepIndicator}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-3">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const active = role === r.value;
                    return (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          active
                            ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20"
                            : "bg-muted border-border hover:border-foreground/20"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                          active ? "bg-emerald-500/20" : "bg-background"
                        }`}>
                          <Icon className={`w-6 h-6 ${active ? "text-emerald-400" : "text-foreground/50"}`} />
                        </div>
                        <p className="text-sm font-bold text-foreground mb-0.5">{r.label}</p>
                        <p className="text-xs text-foreground/40 leading-relaxed">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="relative my-1.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Why {roles.find((r) => r.value === role)?.label}?
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {roles.find((r) => r.value === role)?.benefits.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                      <LuCheck className="w-3.5 h-3.5" /> {b}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Continue as {roles.find((r) => r.value === role)?.label}
                  <LuArrowRight className="w-5 h-5" />
                </button>

                <div className="relative my-1.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Or sign up with
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <GoogleAuthButton
                  label="Sign up with Google"
                  disabled={loading}
                  onSuccess={(data) => router.push(getPostAuthPath(data))}
                  onError={(err) => setError(getAuthErrorMessage(err, "Google sign-up failed. Please try again."))}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestCode}
                className="space-y-3"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="register-email" className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 py-3 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <LuArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.email}
                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {loading ? "Sending code..." : "Send Verification Code"}
                    {!loading && <LuArrowRight className="w-5 h-5" />}
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
                className="space-y-3"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <div className="relative mb-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Verification
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-code" className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Verification Code</label>
                  <input
                    id="register-code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm text-center tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="relative my-1.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Your Profile
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="register-first-name" className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                      <input
                        id="register-first-name"
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="register-last-name" className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                      <input
                        id="register-last-name"
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-password" className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      id="register-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(2); setError(""); }}
                    className="flex-1 py-3 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <LuArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {loading ? "Creating..." : "Create Account"}
                    {!loading && <LuCheck className="w-5 h-5" />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-border" />
              </div>
            </div>
            <p className="text-sm text-foreground/40">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-emerald-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-foreground/30 mt-1">
              Recruiters are invited by organization owners
            </p>
          </div>
        </motion.div>
      </div>

      <AuthShowcase />
    </div>
  );
}
