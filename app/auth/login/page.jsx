"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/utils/api";
import {
  LuMail, LuLock, LuFileSearch, LuMessageSquare, LuTarget,
  LuZap, LuEye,
} from "react-icons/lu";

const slides = [
  { icon: LuFileSearch, title: "Smart CV Parsing", desc: "Section-wise embeddings extract Skills, Experience, Projects, and Summary — Precision@10 improves by 11.4pp.", stat: "11.4pp", statLabel: "Precision Gain" },
  { icon: LuMessageSquare, title: "AI Interview System", desc: "Offline-first STT/TTS with 3D avatar. Adaptive questioning probes skill gaps identified during CV matching.", stat: "3 Stages", statLabel: "Assessment Pipeline" },
  { icon: LuTarget, title: "Three-Stage Ranking", desc: "HNSW → Cross-Encoder → BM25. Cheapest operation runs first. Recall@10 of 0.83 with section-wise embeddings.", stat: "0.83", statLabel: "Recall@10" },
  { icon: LuEye, title: "Integrity-First Proctoring", desc: "OS-level process monitoring catches AI copilots and remote desktop tools browser proctors miss.", stat: "99.7%", statLabel: "Detection Rate" },
  { icon: LuZap, title: "Rust-Native Speed", desc: "In-process ONNX inference delivers 3-5x faster processing with 60-80% less memory than Python alternatives.", stat: "3-5x", statLabel: "Faster Inference" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const data = await api.get("/accounts/google/login_url/");
      if (data.login_url) window.location.href = data.login_url;
      else throw new Error("Google login URL not received");
    } catch (err) {
      setError(err.message || "Failed to initialize Google login");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      window.location.href = "/users/profile/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:max-w-md max-w-sm"
        >
          {/* Brand */}
          <div className="mb-8">
            <div className="flex items-center lg:gap-4 gap-3 mb-6">
              <Image src="/deepscreen.webp" alt="DeepScreen" width={28} height={28} priority />
              <span className="lg:text-2xl text-xl font-bold text-foreground">DeepScreen</span>
            </div>
            <h1 className="lg:text-5xl text-4xl font-bold text-foreground">Welcome back</h1>
            <p className="text-foreground/40 lg:text-lg text-base mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="lg:space-y-6 space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 lg:text-base text-sm">{error}</div>
            )}

            <div className="relative">
              <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 lg:w-6 lg:h-6 w-5 h-5 text-foreground/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full lg:pl-16 pl-12 pr-4 lg:py-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all lg:text-lg text-base"
                placeholder="Password"
                required
              />
            </div>

            <div className="flex items-center justify-between lg:text-base text-sm">
              <label className="flex items-center gap-2 text-foreground/40 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-muted text-emerald-500 focus:ring-emerald-500/30 lg:w-5 lg:h-5 w-4 h-4" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-emerald-400/70 hover:text-emerald-400 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full lg:py-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 lg:text-lg text-base"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider — Google */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 lg:text-sm text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full lg:py-4 py-3.5 rounded-xl border border-border bg-muted hover:bg-accent text-foreground lg:text-lg text-base font-medium transition-all flex items-center justify-center lg:gap-4 gap-3 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="lg:w-6 lg:h-6 w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            ) : (
              <svg className="lg:w-6 lg:h-6 w-5 h-5" viewBox="0 0 24 24">
                <path fill="#34d399" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34d399" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#34d399" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#34d399" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Footer */}
          <div className="mt-6 text-center lg:space-y-2 space-y-1.5">
            <p className="lg:text-base text-sm text-foreground/40">
              <Link href="/auth/register" className="text-emerald-400 hover:underline font-medium">
                Create candidate account
              </Link>
            </p>
            <p className="lg:text-base text-sm text-foreground/30">
              <Link href="/auth/staff/register" className="hover:text-emerald-400 transition-colors">
                Staff registration
              </Link>
              {" · "}
              <span className="text-foreground/20">Recruiters are invited</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Slider */}
      <div className="hidden lg:flex flex-1 bg-muted border-l border-border items-center justify-center px-16">
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
              <p className="text-foreground/50 lg:text-xl text-lg leading-relaxed mb-10">{slides[slideIdx].desc}</p>
              <div className="inline-block px-8 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-4xl font-bold text-emerald-400">{slides[slideIdx].stat}</div>
                <div className="lg:text-base text-sm text-foreground/40 mt-1">{slides[slideIdx].statLabel}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
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

          <p className="text-center lg:text-sm text-xs text-foreground/20 mt-6 tracking-widest uppercase">
            Platform features
          </p>
        </div>
      </div>
    </div>
  );
}
