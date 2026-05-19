"use client";

import { useState } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  LuMail, LuLock, LuUser, LuArrowRight, LuArrowLeft, LuCheck,
  LuBuilding2,
} from "react-icons/lu";
import AuthShowcase from "@/components/auth/AuthShowcase";

const steps = [
  { label: "Email", desc: "Work email" },
  { label: "Profile", desc: "Your details" },
];

export default function StaffRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "", code: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestStaffCode, registerStaff } = useAuth();

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
    <div className="flex items-center justify-center mb-6">
      {steps.map((s, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isCurrent = num === step;
        return (
          <div key={num} className="flex items-center">
            <button
              onClick={() => { if (num < step) { setStep(num); setError(""); } }}
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
              <div className={`w-16 h-0.5 mx-1.5 transition-colors ${num <= step ? "bg-emerald-500/50" : "bg-border"}`} />
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3">
              <LuBuilding2 className="w-3.5 h-3.5" />
              Staff Portal
            </span>
            <h1 className="text-2xl font-bold text-foreground">Recruiter access</h1>
            <p className="text-foreground/40 text-sm mt-0.5">
              {step === 1 ? "Enter your work email to get started" : `Staff code sent to ${formData.email}`}
            </p>
          </div>

          <StepIndicator />

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
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Work Email</label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {loading ? "Sending code..." : "Continue with Email"}
                  {!loading && <LuArrowRight className="w-5 h-5" />}
                </button>
              </motion.form>
            )}

            {step === 2 && (
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
                        placeholder="Jane"
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
                        placeholder="Smith"
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
                    onClick={() => { setStep(1); setError(""); }}
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

          <div className="mt-6 text-center space-y-1">
            <div className="relative mb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>
            <p className="text-sm text-foreground/40">
              Already registered?{" "}
              <Link href="/auth/login" className="text-emerald-400 font-medium hover:underline">Sign in</Link>
            </p>
            <p className="text-sm text-foreground/30">
              Not a recruiter?{" "}
              <Link href="/auth/register" className="text-emerald-400 hover:underline">Candidate registration</Link>
            </p>
          </div>
        </motion.div>
      </div>

      <AuthShowcase />
    </div>
  );
}
