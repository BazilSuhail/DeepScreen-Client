"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  LuMail, LuLock, LuUser, LuArrowRight, LuArrowLeft, LuCheck,
  LuUsers, LuTarget, LuShield, LuBuilding2, LuGlobe, LuBriefcase,
} from "react-icons/lu";
import { BiSolidBarChartSquare } from "react-icons/bi";

const slides = [
  { icon: LuUsers, title: "Smart Candidate Ranking", desc: "Section-weighted embeddings surface the strongest candidates first. Precision@10 improves by 11.4pp over whole-doc retrieval." },
  { icon: LuTarget, title: "Adaptive Assessments", desc: "Coding challenges that adjust difficulty in real-time. Plagiarism detection analyzes solution structure, not just output." },
  { icon: BiSolidBarChartSquare, title: "Data-Driven Decisions", desc: "Integrity scores, competency breakdowns, and evidence packs for every candidate — all in one dashboard." },
  { icon: LuShield, title: "Enterprise-Grade Integrity", desc: "OS-level process monitoring via Tauri. MediaPipe gaze tracking, YOLOv8s detection — all running locally on-device." },
];

const steps = [
  { label: "Email", desc: "Work email" },
  { label: "Profile", desc: "Your details" },
];

export default function StaffRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "", code: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { requestStaffCode, registerStaff } = useAuth();

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
      await requestStaffCode(formData.email);
      setStep(2);
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
      await registerStaff(formData);
    } catch (err) {
      setError(err.message || "Staff registration failed");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isCurrent = num === step;
        return (
          <div key={num} className="flex items-center">
            <button
              onClick={() => { if (num < step) { setStep(num); setError(""); } }}
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
              <div className={`lg:w-20 w-16 h-0.5 mx-2 transition-colors ${num <= step ? "bg-emerald-500/50" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:max-w-xl max-w-md"
        >
          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 lg:px-4 lg:py-2 px-3 py-1.5 lg:text-sm text-xs font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <LuBuilding2 className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
              Staff Portal
            </span>
            <h1 className="lg:text-5xl text-4xl font-bold text-foreground">Recruiter access</h1>
            <p className="text-foreground/40 lg:text-lg text-base mt-1">
              {step === 1 ? "Enter your work email to get started" : `Staff code sent to ${formData.email}`}
            </p>
          </div>

          <StepIndicator />

          <AnimatePresence mode="wait">
            {/* STEP 1 — Email */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestCode}
                className="lg:space-y-6 space-y-5"
              >
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 lg:text-base text-sm">{error}</div>
                )}

                <div className="lg:space-y-3 space-y-2">
                  <label className="lg:text-base text-sm font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Work Email</label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full lg:py-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center lg:gap-3 gap-2 disabled:opacity-50 lg:text-lg text-base"
                >
                  {loading ? "Sending code..." : "Continue with Email"}
                  {!loading && <LuArrowRight className="lg:w-6 lg:h-6 w-5 h-5" />}
                </button>
              </motion.form>
            )}

            {/* STEP 2 — Code + Name + Password */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="lg:space-y-6 space-y-5"
              >
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 lg:text-base text-sm">{error}</div>
                )}

                {/* Section: Verification */}
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 lg:text-sm text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-muted">
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

                {/* Section: Profile */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 lg:text-sm text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-muted">
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
                        placeholder="Jane"
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
                        placeholder="Smith"
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
                    onClick={() => { setStep(1); setError(""); }}
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
          <div className="mt-6 text-center space-y-1">
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>
            <p className="lg:text-base text-sm text-foreground/40">
              Already registered?{" "}
              <Link href="/auth/login" className="text-emerald-400 font-medium hover:underline">Sign in</Link>
            </p>
            <p className="lg:text-base text-sm text-foreground/30">
              Not a recruiter?{" "}
              <Link href="/auth/register" className="text-emerald-400 hover:underline">Candidate registration</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Slider */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-900/20 to-muted border-l border-border items-center justify-center p-16">
        <div className="max-w-lg w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 lg:px-5 lg:py-2 px-4 py-1.5 lg:text-sm text-xs font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <LuBriefcase className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
              For Recruiters
            </div>
            <h3 className="lg:text-4xl text-3xl font-bold text-foreground">Built for hiring teams</h3>
            <p className="text-foreground/40 lg:text-base text-sm mt-1">Tools to find, assess, and hire top talent</p>
          </div>

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
