'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { LuKey, LuMailCheck, LuShieldCheck, LuRefreshCw, LuCircleCheck } from 'react-icons/lu';
import AuthLayout from '@/components/auth/AuthLayout';
import FormError from '@/components/auth/FormError';
import { TextField } from '@/components/forms/FormFields';
import { getAuthErrorMessage } from '@/utils/authErrors';

const verifyShowcase = {
    title: 'Confirm your email',
    body: 'Enter the 6-digit code we sent you. It expires in 15 minutes.',
    items: [
        { icon: LuMailCheck, label: 'Check your inbox', desc: 'The code can take a minute to arrive' },
        { icon: LuShieldCheck, label: 'Keep it private', desc: 'Never share the code with anyone' },
        { icon: LuRefreshCw, label: 'Need a new one?', desc: 'Request another code from the sign-up page' },
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
            await verifyEmail(email, code);
            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err) {
            setError(getAuthErrorMessage(err, 'The code is incorrect or has expired. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout showcase={verifyShowcase}>
            <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <LuMailCheck className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Verify your email</h1>
                <p className="mt-1.5 text-sm text-foreground/50">
                    We&apos;ve sent a 6-digit code to <span className="font-semibold text-emerald-400">{email}</span>
                </p>
            </div>

            {success ? (
                <motion.output
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                >
                    <LuCircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-400">Email verified successfully!</p>
                        <p className="mt-1 text-xs text-foreground/50">Redirecting to login...</p>
                    </div>
                </motion.output>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormError title="Couldn&apos;t verify your email" message={error} />

                    <TextField
                        id="code"
                        label="Verification code"
                        icon={LuKey}
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
                        className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify email'}
                    </button>

                    <button
                        type="button"
                        className="text-xs text-foreground/50 transition-colors hover:text-emerald-400"
                        onClick={() => {/* Implement resend logic if needed */}}
                    >
                        Didn&apos;t receive a code? Resend
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" /></div>}>
            <VerifyContent />
        </Suspense>
    );
}
