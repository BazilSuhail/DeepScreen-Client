'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function StaffRegisterPage() {
    const [step, setStep] = useState(1); 
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        code: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestStaffCode, registerStaff } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await requestStaffCode(formData.email);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerStaff(formData);
        } catch (err) {
            setError(err.message || 'Staff registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-mesh">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass p-8 rounded-3xl shadow-2xl border border-emerald-500/20"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20 mb-4 uppercase tracking-widest">
                        Staff Portal
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Recruiter Access
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {step === 1 ? 'Enter your professional email' : `Staff code sent to ${formData.email}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleRequestCode} 
                            className="space-y-4"
                        >
                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Work Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                                    placeholder="recruiter@company.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Processing...' : 'Request Staff Access'}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegister} 
                            className="space-y-4"
                        >
                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Access Code</label>
                                <input
                                    name="code"
                                    type="text"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-center tracking-[0.5em] font-bold"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">First Name</label>
                                    <input
                                        name="first_name"
                                        type="text"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                                        placeholder="Jane"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Last Name</label>
                                    <input
                                        name="last_name"
                                        type="text"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                                        placeholder="Smith"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Secure Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-2xl transition-all border border-border"
                                >
                                    Change Email
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-50"
                                >
                                    {loading ? 'Authorizing...' : 'Grant Access'}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Already have staff access?{' '}
                    <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
