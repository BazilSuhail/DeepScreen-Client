'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { generateIdentityKeyPair, generateSalt, stretchPassword, encryptPrivateKey, persistPrivateKeyLocally } from '@/components/authentication/crypto';

function CompleteRegistrationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth();
    
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
            // 1. Generate Keypair & Salt
            const keys = generateIdentityKeyPair();
            const salt = generateSalt();

            // 2. Stretch password
            const aesKey = await stretchPassword(formData.password, salt);

            // 3. Encrypt private key
            const encryptedPK = await encryptPrivateKey(keys.privateKey, aesKey);

            // 4. Send to server with E2EE keys
            const data = await api.post('/accounts/auth/recruiter/complete/', {
                email,
                code,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password,
                public_key: keys.publicKey,
                encrypted_private_key: encryptedPK,
                encryption_salt: salt
            });
            
            // 5. Persist locally via device key
            await persistPrivateKeyLocally(keys.privateKey);
            
            // Log in with the new account
            localStorage.setItem('access_token', data.access_token);
            window.location.href = '/'; // Full refresh to update context
        } catch (err) {
            setError(err.message || 'Failed to complete registration');
        } finally {
            setLoading(false);
        }
    };

    if (!email || !code) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass p-8 rounded-3xl text-center">
                    <h1 className="text-2xl font-bold text-red-500">Invalid Invitation Link</h1>
                    <p className="text-muted-foreground mt-2">Please ask your organization owner for a new link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-32">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 rounded-3xl shadow-2xl border border-emerald-500/10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Welcome to the Team
                    </h1>
                    <p className="text-muted-foreground mt-2">Complete your profile to start recruiting</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1 uppercase tracking-widest">{email}</p>
                    <p className="text-xs text-muted-foreground mt-3">Your password will secure your end-to-end encryption keys</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">First Name</label>
                            <input
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Jane"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">Last Name</label>
                            <input
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Smith"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Set Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Confirm Password</label>
                        <input
                            name="confirm_password"
                            type="password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Finalizing...' : 'Complete Registration'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default function CompleteRegistrationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompleteRegistrationContent />
        </Suspense>
    );
}
