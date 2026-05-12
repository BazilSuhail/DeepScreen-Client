"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  LuMail, LuLock, LuUser, LuArrowRight, LuArrowLeft, LuCheck,
  LuBuilding2, LuBriefcase, LuFileSearch, LuMessageSquare, LuEye,
  LuZap, LuShield, LuTarget, LuStar, LuGlobe,
} from "react-icons/lu";

const slides = [
  { icon: LuFileSearch, title: "Smart CV Parsing", desc: "Section-wise embeddings extract Skills, Experience, Projects, and Summary — not just keywords." },
  { icon: LuMessageSquare, title: "AI-Powered Interviews", desc: "Adaptive questioning with offline TTS and 3D avatar. No cloud dependency for speech synthesis." },
  { icon: LuEye, title: "Integrity-First Proctoring", desc: "OS-level process monitoring catches AI copilots and remote desktop tools browser proctors miss." },
  { icon: LuZap, title: "Rust-Native Speed", desc: "In-process ONNX inference delivers 3-5x faster processing with 60-80% less memory." },
];

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
  const [slideIdx, setSlideIdx] = useState(0);
  const { requestCode, register } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isCurrent = num === step;
        return (
          <div key={num} className="flex items-center">
            <button
              onClick={() => goToStep(num)}
              disabled={num > step}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`lg:w-12 lg:h-12 w-10 h-10 rounded-full flex items-center justify-center lg:text-lg text-base font-bold border-2 transition-all ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isCurrent
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-border text-foreground/30 bg-muted"
                } ${num < step ? "cursor-pointer hover:border-emerald-400" : "cursor-default"}`}
              >
                {isDone ? <LuCheck className="lg:w-6 lg:h-6 w-5 h-5" /> : <span className="lg:text-lg text-base">{num}</span>}
              </div>
              <span className={`lg:text-sm text-xs font-semibold tracking-wider ${isCurrent ? "text-emerald-400" : "text-foreground/30"}`}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`lg:w-16 w-14 h-0.5 mx-2 transition-colors ${num <= step ? "bg-emerald-500/50" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const RoleIcon = roles.find((r) => r.value === role)?.icon || LuBriefcase;

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:max-w-xl max-w-md"
        >
          {/* Brand */}
          <div className="mb-6">
            <div className="flex items-center lg:gap-4 gap-3 mb-6">
              <Image src="/deepscreen.webp" alt="DeepScreen" width={28} height={28} priority />
              <span className="lg:text-2xl text-xl font-bold text-foreground">DeepScreen</span>
            </div>
            <h1 className="lg:text-5xl text-4xl font-bold text-foreground">Get started</h1>
            <p className="text-foreground/40 lg:text-lg text-base mt-1">
              {step === 1 ? "Choose your role to begin" : step === 2 ? "Enter your email address" : `Code sent to ${formData.email}`}
            </p>
          </div>

          <StepIndicator />

          <AnimatePresence mode="wait">
            {/* STEP 1 — Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:space-y-6 space-y-5"
              >
                <div className="grid grid-cols-2 lg:gap-5 gap-4">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const active = role === r.value;
                    return (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`lg:p-5 p-4 rounded-xl border text-left transition-all ${
                          active
                            ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20"
                            : "bg-muted border-border hover:border-foreground/20"
                        }`}
                      >
                        <div className={`lg:w-14 lg:h-14 w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                          active ? "bg-emerald-500/20" : "bg-background"
                        }`}>
                          <Icon className={`lg:w-7 lg:h-7 w-6 h-6 ${active ? "text-emerald-400" : "text-foreground/50"}`} />
                        </div>
                        <p className="lg:text-lg text-base font-bold text-foreground mb-0.5">{r.label}</p>
                        <p className="lg:text-sm text-xs text-foreground/40 leading-relaxed">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 lg:text-sm text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Why {roles.find((r) => r.value === role)?.label}?
                    </span>
                  </div>
                </div>

                {/* Benefit pills */}
                <div className="flex flex-wrap lg:gap-3 gap-2">
                  {roles.find((r) => r.value === role)?.benefits.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5 lg:px-4 lg:py-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 lg:text-sm text-xs font-medium">
                      <LuCheck className="lg:w-4 lg:h-4 w-3.5 h-3.5" /> {b}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full lg:py-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center lg:gap-3 gap-2 lg:text-lg text-base"
                >
                  Continue as {roles.find((r) => r.value === role)?.label}
                  <LuArrowRight className="lg:w-6 lg:h-6 w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Email + Verification Code */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestCode}
                className="lg:space-y-6 space-y-5"
              >
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 lg:text-base text-sm">{error}</div>
                )}

                <div className="lg:space-y-3 space-y-2">
                  <label className="lg:text-base text-sm font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex lg:gap-4 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 lg:py-4 py-3.5 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-semibold transition-all flex items-center justify-center lg:gap-3 gap-2 lg:text-lg text-base"
                  >
                    <LuArrowLeft className="lg:w-6 lg:h-6 w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.email}
                    className="flex-[2] lg:py-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center lg:gap-3 gap-2 disabled:opacity-50 lg:text-lg text-base"
                  >
                    {loading ? "Sending code..." : "Send Verification Code"}
                    {!loading && <LuArrowRight className="lg:w-6 lg:h-6 w-5 h-5" />}
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3 — Code + Name + Password */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister}
                className="lg:space-y-6 space-y-5"
              >
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 lg:text-base text-sm">{error}</div>
                )}

                {/* Code — Separator */}
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 lg:text-sm text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Verification
                    </span>
                  </div>
                </div>

                <div className="lg:space-y-3 space-y-2">
                  <label className="lg:text-base text-sm font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Verification Code</label>
                  <input
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base text-center tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                {/* Name + Password — Separator */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 lg:text-sm text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                      Your Profile
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:gap-5 gap-4">
                  <div className="lg:space-y-3 space-y-2">
                    <label className="lg:text-base text-sm font-semibold text-foreground/50 ml-1 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
                      <input
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="lg:space-y-3 space-y-2">
                    <label className="lg:text-base text-sm font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
                      <input
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:space-y-3 space-y-2">
                  <label className="lg:text-base text-sm font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex lg:gap-4 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(2); setError(""); }}
                    className="flex-1 lg:py-4 py-3.5 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-semibold transition-all flex items-center justify-center lg:gap-3 gap-2 lg:text-lg text-base"
                  >
                    <LuArrowLeft className="lg:w-6 lg:h-6 w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] lg:py-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center lg:gap-3 gap-2 disabled:opacity-50 lg:text-lg text-base"
                  >
                    {loading ? "Creating..." : "Create Account"}
                    {!loading && <LuCheck className="lg:w-6 lg:h-6 w-5 h-5" />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>
            <p className="lg:text-base text-sm text-foreground/40">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-emerald-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <p className="lg:text-base text-sm text-foreground/30 mt-1">
              Recruiters are invited by organization owners
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Slider */}
      <div className="hidden lg:flex flex-1 bg-muted border-l border-border items-center justify-center p-16">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="lg:w-36 lg:h-36 w-28 h-28 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-10">
                {(() => {
                  const Icon = slides[slideIdx].icon;
                  return <Icon className="lg:w-14 lg:h-14 w-12 h-12 text-emerald-400" />;
                })()}
              </div>
              <h3 className="lg:text-5xl text-4xl font-bold text-foreground mb-4">{slides[slideIdx].title}</h3>
              <p className="text-foreground/50 lg:text-xl text-lg leading-relaxed">{slides[slideIdx].desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center lg:gap-4 gap-3 mt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`lg:h-3 h-2.5 rounded-full transition-all ${
                  i === slideIdx ? "bg-emerald-400 w-8" : "bg-muted-foreground/20 hover:bg-muted-foreground/30 lg:w-3 w-2.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
