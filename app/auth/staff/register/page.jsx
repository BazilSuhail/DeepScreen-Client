"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  LuMail,
  LuLock,
  LuUser,
  LuArrowRight,
  LuArrowLeft,
  LuCheck,
  LuUsers,
  LuTarget,
  LuShield,
} from "react-icons/lu";
import { BiSolidBarChartSquare } from "react-icons/bi";

const slides = [
  {
    icon: LuUsers,
    title: "Smart Candidate Ranking",
    desc: "Section-weighted embeddings surface the strongest candidates first. Precision@10 improves by 11.4pp over whole-doc retrieval.",
  },
  {
    icon: LuTarget,
    title: "Adaptive Assessments",
    desc: "Coding challenges that adjust difficulty in real-time. Plagiarism detection analyzes solution structure, not just output.",
  },
  {
    icon: BiSolidBarChartSquare,
    title: "Data-Driven Decisions",
    desc: "Integrity scores, competency breakdowns, and evidence packs for every candidate — all in one dashboard.",
  },
  {
    icon: LuShield,
    title: "Enterprise-Grade Integrity",
    desc: "OS-level process monitoring via Tauri. MediaPipe gaze tracking, YOLOv8s detection — all running locally on-device.",
  },
];

export default function StaffRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { requestStaffCode, registerStaff } = useAuth();

  useEffect(() => {
    const timer = setInterval(
      () => setSlideIdx((p) => (p + 1) % slides.length),
      4000,
    );
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              Staff Portal
            </span>
            <h1 className="text-3xl font-bold text-white">Recruiter access</h1>
            <p className="text-white/40 mt-1 text-sm">
              {step === 1
                ? "Enter your work email to get started"
                : `Staff code sent to ${formData.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestCode}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
                    Work Email
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Sending code..." : "Continue with Email"}
                  {!loading && <LuArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
                    Verification Code
                  </label>
                  <input
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm text-center tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
                      First Name
                    </label>
                    <div className="relative">
                      <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="Jane"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
                      Last Name
                    </label>
                    <div className="relative">
                      <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="Smith"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <LuArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Account"}
                    {!loading && <LuCheck className="w-4 h-4" />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Already registered?{" "}
              <Link
                href="/auth/login"
                className="text-emerald-400 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="text-xs text-white/30 mt-2">
              Not a recruiter?{" "}
              <Link
                href="/auth/register"
                className="text-emerald-400 hover:underline"
              >
                Candidate registration
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Elevated Slider */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-900/20 to-black/80 border-l border-emerald-500/10 items-center justify-center p-16">
        <div className="max-w-lg w-full">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              For Recruiters
            </div>
            <h3 className="text-2xl font-bold text-white">
              Built for hiring teams
            </h3>
            <p className="text-white/40 text-sm mt-1">
              Tools to find, assess, and hire top talent
            </p>
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
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-10">
                {(() => {
                  const Icon = slides[slideIdx].icon;
                  return <Icon className="w-10 h-10 text-emerald-400" />;
                })()}
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {slides[slideIdx].title}
              </h3>
              <p className="text-white/50 text-base leading-relaxed">
                {slides[slideIdx].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slideIdx
                    ? "bg-emerald-400 w-8"
                    : "bg-white/20 hover:bg-white/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
