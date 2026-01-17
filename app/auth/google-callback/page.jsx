"use client";

import React, { useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';

function GoogleCallbackContent() {
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
    } else {
      router.push('/auth/login');
    }
  }, [searchParams]);

  const handleCallback = async (code) => {
    try {
      const data = await api.post('/google/callback/', { code });
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      console.error('Google callback error:', err);
      router.push('/auth/login?error=google_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto"
        />
        <h1 className="text-2xl font-bold text-white">Authenticating with Google...</h1>
        <p className="text-[var(--muted-foreground)]">Please wait while we set up your session.</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
