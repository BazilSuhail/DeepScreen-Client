"use client";

import { useState } from "react";
import { useAuth } from "@/context/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import { LuMail, LuLock, LuCircleAlert, LuX, LuUserPlus, LuArrowRight } from "react-icons/lu";
import AuthShowcase from "@/components/auth/AuthShowcase";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import AuthGridBackground from "@/components/auth/AuthGridBackground";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { getPostAuthPath } from "@/utils/authRoutes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      router.push(getPostAuthPath(data));
    } catch (err) {
      setError(getAuthErrorMessage(err, "Something went wrong while signing in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-background">
      {/* Grid stands in for the showcase panel below lg */}
      <AuthGridBackground className="lg:hidden" />
      {/* Left Column - Form Container */}
      <div className="relative flex-1 flex items-center justify-center px-6 lg:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <Image
                src="/deepscreen.webp"
                alt="DeepScreen"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
              />
              <span className="text-xl font-bold tracking-tight text-foreground">DeepScreen</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-foreground/50 text-sm mt-1.5">Sign in to your candidate dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                  <LuCircleAlert className="h-4 w-4 text-red-400" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-300">Couldn&apos;t sign you in</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-red-300/70">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="shrink-0 rounded-md p-1 text-red-300/60 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:outline-none"
                >
                  <LuX className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="relative group">
              <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground/40 focus:border-emerald-500/60 focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium"
                placeholder="Email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground/40 focus:border-emerald-500/60 focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium"
                placeholder="Password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-semibold tracking-wider uppercase text-foreground/40 bg-background">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleAuthButton
            label="Continue with Google"
            disabled={loading}
            onSuccess={(data) => router.push(getPostAuthPath(data))}
            onError={(err) => setError(getAuthErrorMessage(err, "Google sign-in failed. Please try again."))}
          />

          {/* Candidate Registration Navigation Button */}
          <div className="mt-8 pt-6 border-t border-border/60 text-center relative z-20">
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-semibold transition-all shadow-sm group cursor-pointer"
            >
              <LuUserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Create a candidate account
            </button>
            <p className="text-center text-xs text-foreground/40 mt-3">
              Recruiters and staff join by invitation or setup portal.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Showcase Side Component */}
      <AuthShowcase />
    </div>
  );
}