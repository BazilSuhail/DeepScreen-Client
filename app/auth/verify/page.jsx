'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { HiOutlineKey, HiOutlineEnvelopeOpen, HiOutlineShieldCheck, HiOutlineArrowPath, HiOutlineCheckCircle } from 'react-icons/hi2';
import { base } from '@/constants/motion';
import AuthLayout from '@/components/auth/AuthLayout';
import FormError from '@/components/auth/FormError';
import { TextField } from '@/components/forms/FormFields';
import AuthFormSkeleton from '@/components/skeletons/auth/AuthFormSkeleton';
import { primaryButton } from '@/components/ui/styles';
import Link from 'next/link';
import { getAuthErrorMessage } from '@/utils/authErrors';

const verifyShowcase = {
    title: 'Confirm your email',
    body: 'Enter the 6-digit code we sent you. It expires in 15 minutes.',
    items: [
        { icon: HiOutlineEnvelopeOpen, label: 'Check your inbox', desc: 'The code can take a minute to arrive' },
        { icon: HiOutlineShieldCheck, label: 'Keep it private', desc: 'Never share the code with anyone' },
        { icon: HiOutlineArrowPath, label: 'Need a new one?', desc: 'Request another code from the sign-up page' },
    ],
};

function VerifyContent() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { verifyEmail } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const redirectTimer = useRef(null);

    useEffect(() => () => clearTimeout(redirectTimer.current), []);

    useEffect(() => {
        if (!email) {
            router.push('/auth/register');
        }
    }, [email, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyEmail(code, email);
            setSuccess(true);
            redirectTimer.current = setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err) {
            setError(getAuthErrorMessage(err, 'The code is incorrect or has expired. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    // No email in the URL: we are redirecting to sign-up, so don't flash an empty "code sent to" line.
    if (!email) return <AuthFormSkeleton fields={1} label="Redirecting" />;

    return (
        <AuthLayout showcase={verifyShowcase}>
            <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-emerald-500/10">
                    <HiOutlineEnvelopeOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Verify your email</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    We&apos;ve sent a 6-digit code to <span className="font-semibold text-emerald-600 dark:text-emerald-400">{email}</span>
                </p>
            </div>

            {success ? (
                <motion.output
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={base}
                    className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                >
                    <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Email verified successfully!</p>
                        <p className="mt-1 text-xs text-muted-foreground">Redirecting to sign in...</p>
                    </div>
                </motion.output>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormError title="Couldn&apos;t verify your email" message={error} />

                    <TextField
                        id="code"
                        label="Verification code"
                        icon={HiOutlineKey}
                        hint="Enter the 6 digits from your email."
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="text-center text-lg tracking-[0.5em] font-semibold"
                        placeholder="000000"
                        maxLength={6}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        aria-busy={loading}
                        className={`${primaryButton} w-full`}
                    >
                        {loading && <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                        {loading ? 'Verifying...' : 'Verify email'}
                    </button>

                    {/* There is no resend endpoint on this page; a new code is requested from sign-up. */}
                    <p className="text-center text-xs text-muted-foreground">
                        Didn&apos;t receive a code?{' '}
                        <Link href="/auth/register" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                            Request a new one
                        </Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<AuthFormSkeleton fields={1} label="Loading verification" />}>
            <VerifyContent />
        </Suspense>
    );
}
