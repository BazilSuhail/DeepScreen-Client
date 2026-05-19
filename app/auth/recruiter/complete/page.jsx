'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { LuUser, LuLock, LuArrowRight, LuCheck, LuMail, LuBuilding2, LuShield } from 'react-icons/lu';

const stages = [
  { label: 'Invited', icon: LuMail },
  { label: 'Details', icon: LuUser },
  { label: 'Complete', icon: LuCheck },
];

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';
  const org = searchParams.get('org') || 'your organization';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setStage(3);
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/accounts/auth/recruiter/complete/', {
        email,
        code,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });

      localStorage.setItem('access_token', data.access_token);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Failed to complete registration');
      setStage(2);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-muted border border-border text-center max-w-md relative z-10"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuShield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-red-400">Invalid Invitation Link</h1>
          <p className="text-foreground/50 text-sm mt-2">Please ask your organization owner for a new link.</p>
        </motion.div>
      </div>
    );
  }

  const StageIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {stages.map((s, i) => {
        const num = i + 1;
        const isDone = num < stage;
        const isCurrent = num === stage;
        const Icon = s.icon;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      : 'border-border text-foreground/30 bg-muted'
                }`}
              >
                {isDone ? <LuCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-semibold tracking-wider ${isCurrent ? 'text-emerald-400' : 'text-foreground/30'}`}>
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={`w-12 h-0.5 mx-1.5 transition-colors ${num <= stage ? 'bg-emerald-500/50' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-muted border border-border p-8 rounded-3xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuBuilding2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to the Team</h1>
            <p className="text-foreground/40 text-sm mt-1">You've been invited to join <span className="text-emerald-400 font-medium">{org}</span></p>
          </div>

          <StageIndicator />

          <div className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
            <LuMail className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{email}</span>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-muted">
                Set a password to finish setup
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

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
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs font-semibold tracking-widest uppercase text-foreground/30 bg-muted">
                  Security
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Set Password</label>
              <div className="relative">
                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                <input
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Finalizing...
                </div>
              ) : (
                <>
                  Complete Registration
                  <LuArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-foreground/30 mt-5">
          Already have an account?{' '}
          <a href="/auth/login" className="text-emerald-400 hover:underline font-medium">Sign in</a>
        </p>
      </motion.div>
    </div>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
