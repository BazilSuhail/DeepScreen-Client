"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { LuMail, LuLock, LuUser, LuArrowRight, LuArrowLeft, LuCheck, LuBuilding2, LuBriefcase, LuFileSearch, LuMessageSquare, LuEye, LuZap } from "react-icons/lu";

const slides = [
  {
    icon: LuFileSearch,
    title: "Smart CV Parsing",
    desc: "Section-wise embeddings extract Skills, Experience, Projects, and Summary — not just keywords.",
  },
  {
    icon: LuMessageSquare,
    title: "AI-Powered Interviews",
    desc: "Adaptive questioning with offline TTS and 3D avatar. No cloud dependency for speech synthesis.",
  },
  {
    icon: LuEye,
    title: "Integrity-First Proctoring",
    desc: "OS-level process monitoring catches AI copilots and remote desktop tools browser proctors miss.",
  },
  {
    icon: LuZap,
    title: "Rust-Native Speed",
    desc: "In-process ONNX inference delivers 3-5x faster processing with 60-80% less memory.",
  },
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
      await register({ ...formData, role });
      window.location.href = '/users/profile/';
    } catch (err) {
      setError(err.message || "Registration failed");
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
            <div className="flex items-center gap-2.5 mb-6">
              <Image
                src="/deepscreen.webp"
                alt="DeepScreen"
                width={24}
                height={24}
                priority
              />
              <span className="text-lg font-bold text-white">DeepScreen</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Get started</h1>
            <p className="text-white/40 text-sm mt-1">
              {step === 1 ? "Choose your role to begin" : `Code sent to ${formData.email}`}
            </p>
          </div>

          {/* Role Selection (Step 1 only) */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: "candidate", label: "Candidate", desc: "Apply for jobs & take assessments", icon: LuBriefcase },
                { value: "organization", label: "Organization", desc: "Hire talent & manage pipelines", icon: LuBuilding2 },
              ].map((r) => {
                const Icon = r.icon;
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                      active ? "bg-emerald-500/20" : "bg-white/10"
                    }`}>
                      <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-white/50"}`} />
                    </div>
                    <p className="text-sm font-bold text-white">{r.label}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

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
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                      placeholder="name@example.com"
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
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Verification Code</label>
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
                    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Password</label>
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
                    onClick={() => { setStep(1); setError(""); }}
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
              Already have an account?{" "}
              <Link href="/auth/login" className="text-emerald-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Elevated Slider */}
      <div className="hidden lg:flex flex-1 bg-black border-l border-emerald-500/10 items-center justify-center p-16">
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
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-10">
                {(() => {
                  const Icon = slides[slideIdx].icon;
                  return <Icon className="w-10 h-10 text-emerald-400" />;
                })()}
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{slides[slideIdx].title}</h3>
              <p className="text-white/50 text-base leading-relaxed">{slides[slideIdx].desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slideIdx ? "bg-emerald-400 w-8" : "bg-white/20 hover:bg-white/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
