'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/utils/api';
import { motion } from 'motion/react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState('Verifying authentication...');

    useEffect(() => {
        const token = searchParams.get('access_token');
        if (!token) {
            const error = searchParams.get('error');
            if (error) {
                setStatus('Authentication failed. Redirecting to login...');
                setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(error)}`), 2000);
            } else {
                router.push('/auth/login');
            }
            return;
        }

        localStorage.setItem('access_token', token);

        const fetchUserData = async () => {
            try {
                const profileData = await api.get('/accounts/profiles/me/');
                if (profileData?.user) {
                    setStatus('Authentication successful. Redirecting...');
                    window.location.href = '/';
                    return;
                }

                setStatus('Failed to complete authentication.');
                setTimeout(() => router.push('/auth/login'), 2000);
            } catch (error) {
                console.error("Failed to fetch profile during callback", error);
                setStatus('Failed to complete authentication.');
                setTimeout(() => router.push('/auth/login'), 2000);
            }
        };

        fetchUserData();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 p-10 rounded-2xl bg-white/5 border border-white/10"
            >
                <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <div className="text-center">
                    <p className="text-white font-semibold text-lg">{status}</p>
                    <p className="text-white/40 text-sm mt-1">Please wait while we process your request</p>
                </div>
            </motion.div>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>}>
            <CallbackContent />
        </Suspense>
    );
}
