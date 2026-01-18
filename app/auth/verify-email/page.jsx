"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';

function VerifyEmailContent() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/auth/login');
    }
  }, [searchParams]);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/accounts/auth/verify_email/', { email, code: code.join('') });
      router.push('/auth/login?verified=true');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/accounts/auth/resend_code/', { email });
      alert('Code resent successfully!');
    } catch (err) {
      setError(err.message || 'Could not resend code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-2xl shadow-2xl space-y-8 border border-[var(--border)]">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-3xl text-[var(--primary)]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Verify Email</h1>
            <p className="text-[var(--muted-foreground)]">
              We've sent a 6-digit code to <span className="text-[var(--foreground)] font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-[var(--accent)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-[var(--foreground)]"
                  required
                />
              ))}
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
                  Verify Account <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={handleResend}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              Didn't receive the code? <span className="text-[var(--primary)] font-medium">Resend Code</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
