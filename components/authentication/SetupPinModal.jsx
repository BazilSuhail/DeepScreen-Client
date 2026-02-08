'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/utils/api';
import { generateIdentityKeyPair, generateSalt, stretchPassword, encryptPrivateKey, persistPrivateKeyLocally } from './crypto';

export default function SetupPinModal({ user, onComplete }) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Only show if user is authenticated but missing public_key
    if (!user || user.public_key) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (pin.length < 6) {
            setError('PIN must be at least 6 digits');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }
        
        setLoading(true);
        try {
            // 1. Generate Keypair & Salt
            const keys = generateIdentityKeyPair();
            const salt = generateSalt();
            
            // 2. Stretch PIN
            const aesKey = await stretchPassword(pin, salt);
            
            // 3. Encrypt private key
            const encryptedPK = await encryptPrivateKey(keys.privateKey, aesKey);
            
            // 4. Send to server via setup_e2ee
            const response = await api.post('/accounts/auth/setup_e2ee/', {
                public_key: keys.publicKey,
                encrypted_private_key: encryptedPK,
                encryption_salt: salt
            });
            
            // 5. Persist locally via device key
            await persistPrivateKeyLocally(keys.privateKey);
            
            if (onComplete) onComplete(response.user);
            
        } catch (err) {
            setError(err.message || 'Failed to setup encryption keys');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass p-8 rounded-3xl shadow-2xl border border-emerald-500/20"
            >
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Secure Your Account
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Since you signed in with Google, we need a Security PIN to generate and encrypt your end-to-end encryption keys. This PIN will act as your master password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Create 6-Digit PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-center tracking-[0.5em] font-bold"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Confirm PIN</label>
                        <input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-center tracking-[0.5em] font-bold"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {loading ? 'Securing...' : 'Set Security PIN'}
                        </button>
                    </div>
                    
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        Do not forget this PIN. We cannot recover your encrypted messages without it!
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
