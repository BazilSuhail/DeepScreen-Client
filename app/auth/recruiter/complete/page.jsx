'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineArrowRight, HiOutlineCheck, HiOutlineEnvelope, HiOutlineUsers, HiOutlineClipboardDocumentCheck, HiOutlineSparkles, HiOutlineArrowPath } from 'react-icons/hi2';
import { base } from '@/constants/motion';
import AuthLayout from '@/components/auth/AuthLayout';
import StepIndicator from '@/components/auth/StepIndicator';
import FormError from '@/components/auth/FormError';
import { TextField } from '@/components/forms/FormFields';
import AuthFormSkeleton from '@/components/skeletons/auth/AuthFormSkeleton';
import { primaryButton } from '@/components/ui/styles';

const RECRUITER_SHOWCASE = {
  title: 'Join your team',
  body: 'Accept your invitation, set your password, and start reviewing candidates.',
  items: [
    { icon: HiOutlineUsers, label: 'Your team', desc: 'Work with the organization that invited you' },
    { icon: HiOutlineClipboardDocumentCheck, label: 'Review candidates', desc: 'Score interviews and assessments in one place' },
    { icon: HiOutlineSparkles, label: 'Smart shortlists', desc: 'AI highlights strengths and gaps for each candidate' },
  ],
};

const stages = [
  { label: 'Invited', icon: HiOutlineEnvelope },
  { label: 'Details', icon: HiOutlineUser },
  { label: 'Complete', icon: HiOutlineCheck },
];

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { completeRecruiterInvite } = useAuth();

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
      await completeRecruiterInvite({
        token,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });
      router.replace('/recruiter');
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
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">Invitation link not valid</h1>
        <FormError
          title="This link is missing its invitation token"
          message="Please ask your organization owner for a new link."
        />
        <Link href="/auth/login" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">Go to sign in</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showcase={RECRUITER_SHOWCASE}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={base}
        className="w-full"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome to the team</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            You&apos;ve been invited to join a DeepScreen organization as a recruiter.
          </p>
        </div>

        <StepIndicator steps={stages} current={stage} />

        <FormError title="Could not finish setup" message={error} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your details</p>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="first_name"
              name="first_name"
              type="text"
              label="First name"
              icon={HiOutlineUser}
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
              icon={HiOutlineUser}
              hint="The name on your work profile."
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Smith"
              autoComplete="family-name"
              required
            />
          </div>

          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security</p>

          <TextField
            id="password"
            name="password"
            type="password"
            label="Set password"
            icon={HiOutlineLockClosed}
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
            icon={HiOutlineLockClosed}
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
            aria-busy={loading}
            className={`${primaryButton} mt-1 w-full`}
          >
            {loading ? (
              <>
                <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Finalizing...
              </>
            ) : (
              <>
                Complete registration
                <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={4} steps label="Loading invitation" />}>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
