"use client";

import { useState } from "react";
import { useAuth } from "@/context/authStore";
import Link from "next/link";
import { motion } from "motion/react";
import { api } from "@/utils/api";
import { LuMail, LuLock } from "react-icons/lu";
import AuthShowcase from "@/components/auth/AuthShowcase";

export default function LoginPage() {
  const [email, setEmail] = useState("c1@gmail.com");
  const [password, setPassword] = useState("11221122");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();

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
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <span className="text-lg font-black text-white">D</span>
              </div>
              <span className="text-xl font-bold text-foreground">DeepScreen</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-foreground/40 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <div className="relative">
              <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-background">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl border border-border bg-muted hover:bg-accent text-foreground text-sm font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#34d399" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34d399" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#34d399" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#34d399" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="mt-6 text-center space-y-1.5">
            <p className="text-sm text-foreground/40">
              <Link href="/auth/register" className="text-emerald-400 hover:underline font-medium">
                Create candidate account
              </Link>
            </p>
            <p className="text-sm text-foreground/30">
              <Link href="/auth/staff/register" className="hover:text-emerald-400 transition-colors">
                Staff registration
              </Link>
              {" · "}
              <span className="text-foreground/20">Recruiters are invited</span>
            </p>
          </div>
        </motion.div>
      </div>

      <AuthShowcase />
    </div>
  );
}
