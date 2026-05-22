'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/utils/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LuUser, LuLock, LuArrowRight, LuCheck, LuMail, LuUsers, LuClipboardCheck, LuSparkles } from 'react-icons/lu';
import AuthLayout from '@/components/auth/AuthLayout';
import StepIndicator from '@/components/auth/StepIndicator';
import FormError from '@/components/auth/FormError';
import { TextField } from '@/components/forms/FormFields';

const RECRUITER_SHOWCASE = {
  title: 'Join your team',
  body: 'Accept your invitation, set your password, and start reviewing candidates.',
  items: [
    { icon: LuUsers, label: 'Your team', desc: 'Work with the organization that invited you' },
    { icon: LuClipboardCheck, label: 'Review candidates', desc: 'Score interviews and assessments in one place' },
    { icon: LuSparkles, label: 'Smart shortlists', desc: 'AI highlights strengths and gaps for each candidate' },
  ],
};

const stages = [
  { label: 'Invited', icon: LuMail },
  { label: 'Details', icon: LuUser },
  { label: 'Complete', icon: LuCheck },
];

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';

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
        token,
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

  if (!token) {
    return (
      <AuthLayout showcase={RECRUITER_SHOWCASE}>
        <FormError
          title="Invalid Invitation Link"
          message="Please ask your organization owner for a new link."
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showcase={RECRUITER_SHOWCASE}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome to the team</h1>
          <p className="mt-1.5 text-sm text-foreground/50">
            You&apos;ve been invited to join a DeepScreen organization as a recruiter.
          </p>
        </div>

        <StepIndicator steps={stages} current={stage} />

        <FormError title="Could not finish setup" message={error} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Your details</p>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="first_name"
              name="first_name"
              type="text"
              label="First name"
              icon={LuUser}
              hint="As your teammates will see it."
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Jane"
              autoComplete="given-name"
              required
            />
            <TextField
              id="last_name"
              name="last_name"
              type="text"
              label="Last name"
              icon={LuUser}
              hint="The name on your work profile."
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Smith"
              autoComplete="family-name"
              required
            />
          </div>

          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">Security</p>

          <TextField
            id="password"
            name="password"
            type="password"
            label="Set password"
            icon={LuLock}
            hint="Choose a password you will use to sign in."
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <TextField
            id="confirm_password"
            name="confirm_password"
            type="password"
            label="Confirm password"
            icon={LuLock}
            hint="Type the same password again."
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Finalizing...
              </div>
            ) : (
              <>
                Complete registration
                <LuArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/40">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
      </div>
    }>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
