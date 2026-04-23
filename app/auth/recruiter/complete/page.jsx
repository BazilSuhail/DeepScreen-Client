'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { LuUser, LuLock, LuArrowRight } from 'react-icons/lu';

function CompleteRegistrationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const email = searchParams.get('email') || '';
    const code = searchParams.get('code') || '';
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        
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
        } finally {
            setLoading(false);
        }
    };

    if (!email || !code) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-400">Invalid Invitation Link</h1>
                    <p className="text-white/50 mt-2">Please ask your organization owner for a new link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-32">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Welcome to the Team</h1>
                    <p className="text-white/40 mt-2">Complete your profile to start recruiting</p>
                    <p className="text-xs font-medium text-emerald-400 mt-2 uppercase tracking-widest">{email}</p>
                    <p className="text-xs text-white/40 mt-3">Set a password to finish your recruiter account setup</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">First Name</label>
                            <div className="relative">
                                <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                                    placeholder="Jane"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Last Name</label>
                            <div className="relative">
                                <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                                    placeholder="Smith"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Set Password</label>
                        <div className="relative">
                            <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                name="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Finalizing...' : 'Complete Registration'}
                        {!loading && <LuArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default function CompleteRegistrationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>}>
            <CompleteRegistrationContent />
        </Suspense>
    );
}
