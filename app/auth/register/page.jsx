"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/accounts/auth/register/', formData);
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="glass p-8 rounded-2xl shadow-2xl space-y-8 border border-[var(--border)]">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
              Join <span className="text-[var(--primary)]">DeepScreen</span>
            </h1>
            <p className="text-[var(--muted-foreground)]">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]" />
                <input
                  name="first_name"
                  placeholder="First Name"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                  required
                />
              </div>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]" />
                <input
                  name="last_name"
                  placeholder="Last Name"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                required
              />
            </div>

            <div className="relative group">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]" />
              <input
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                  required
                />
              </div>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]" />
                <input
                  name="password_confirm"
                  type="password"
                  placeholder="Confirm"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--primary)] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
