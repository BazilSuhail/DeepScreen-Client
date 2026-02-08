'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { stretchPassword, decryptPrivateKey, persistPrivateKeyLocally, restorePrivateKeyLocally } from './crypto';

export default function EnterPinModal({ user, onComplete }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [needsPin, setNeedsPin] = useState(false);

    useEffect(() => {
        const checkLocalKey = async () => {
            if (!user) return;
            // Only require PIN if user already has a public_key (meaning they set it up)
            // AND they are missing the local device key
            if (user.public_key && user.encrypted_private_key && user.encryption_salt) {
                const pk = await restorePrivateKeyLocally();
                if (!pk) {
                    // Only ask if auth method is Google or they somehow skipped it
                    // (Actually anyone missing the local key should be asked if they don't have it,
                    // but Email users get it decrypted at login, so it's mostly Google users)
                    setNeedsPin(true);
                }
            }
        };
        checkLocalKey();
    }, [user]);

    if (!needsPin) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (pin.length < 6) {
            setError('PIN must be at least 6 digits');
            return;
        }
        
        setLoading(true);
        try {
            // Stretch PIN
            const aesKey = await stretchPassword(pin, user.encryption_salt);
            
            // Decrypt private key
            const privateKey = await decryptPrivateKey(user.encrypted_private_key, aesKey);
            
            // Persist locally via device key
            await persistPrivateKeyLocally(privateKey);
            
            setNeedsPin(false);
            if (onComplete) onComplete(user);
            
        } catch (err) {
            setError('Incorrect PIN. Please try again.');
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
                        Unlock Messages
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Please enter your Security PIN to decrypt your messages on this device.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Security PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                            {loading ? 'Unlocking...' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
