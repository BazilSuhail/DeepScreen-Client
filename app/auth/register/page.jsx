"use client";

import { useState } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  LuMail, LuLock, LuUser, LuArrowRight, LuArrowLeft, LuCheck,
  LuBuilding2, LuBriefcase,
} from "react-icons/lu";
import AuthShowcase from "@/components/auth/AuthShowcase";

const roles = [
  {
    value: "candidate", label: "Candidate", icon: LuBriefcase,
    desc: "Apply for jobs, complete assessments, and track your applications.",
    benefits: ["AI-powered job matching", "Adaptive skill assessments", "Integrity-verified profile"],
  },
  {
    value: "staff", label: "Staff", icon: LuBuilding2,
    desc: "Manage platform, organizations, and oversee hiring operations.",
    benefits: ["Org management tools", "Platform integrity monitoring", "Audit assessment results"],
  },
];

const steps = [
  { label: "Role", desc: "Choose your path" },
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
      await register({ ...formData, role });
      window.location.href = "/users/profile/";
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (s) => { if (s < step) { setStep(s); setError(""); } };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isCurrent
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-border text-foreground/30 bg-muted"
                } ${num < step ? "cursor-pointer hover:border-emerald-400" : "cursor-default"}`}
              >
                {isDone ? <LuCheck className="w-5 h-5" /> : <span>{num}</span>}
              </div>
              <span className={`text-xs font-semibold tracking-wider ${isCurrent ? "text-emerald-400" : "text-foreground/30"}`}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1.5 transition-colors ${num <= step ? "bg-emerald-500/50" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <span className="text-lg font-black text-white">D</span>
              </div>
              <span className="text-xl font-bold text-foreground">DeepScreen</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Get started</h1>
            <p className="text-foreground/40 text-sm mt-0.5">
              {step === 1 ? "Choose your role to begin" : step === 2 ? "Enter your email address" : `Code sent to ${formData.email}`}
            </p>
          </div>

          <StepIndicator />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
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

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestCode}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
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
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <div className="relative mb-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Verification
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Verification Code</label>
                  <input
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm text-center tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Your Profile
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                      <input
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                      <input
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
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
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
