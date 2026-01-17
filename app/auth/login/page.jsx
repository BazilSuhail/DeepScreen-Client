"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FaGoogle, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/login/', { email, password });
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const data = await api.get('/google/login_url/');
      window.location.href = data.login_url;
    } catch (err) {
      setError('Could not get Google login URL');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-2xl shadow-2xl space-y-8 border border-white/10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome <span className="text-[var(--primary)]">Back</span>
            </h1>
            <p className="text-[var(--muted-foreground)]">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-white placeholder:text-white/30"
                  required
                />
              </div>

              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-white placeholder:text-white/30"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={localLoading}
              className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {localLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-[var(--muted-foreground)]">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <FaGoogle className="text-red-500" />
            Sign in with Google
          </button>

          <p className="text-center text-[var(--muted-foreground)]">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[var(--primary)] hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
