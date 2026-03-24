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

        // Save token
        localStorage.setItem('access_token', token);

        // Fetch user data
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium">{status}</p>
            </motion.div>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>}>
            <CallbackContent />
        </Suspense>
    );
}
