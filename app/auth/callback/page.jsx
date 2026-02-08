'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/utils/api';
import SetupPinModal from '@/components/authentication/SetupPinModal';
import EnterPinModal from '@/components/authentication/EnterPinModal';
import { restorePrivateKeyLocally } from '@/components/authentication/crypto';
import { motion } from 'motion/react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [status, setStatus] = useState('Verifying authentication...');
    const [user, setUser] = useState(null);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [needsUnlock, setNeedsUnlock] = useState(false);

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
                const userData = profileData.user;
                setUser(userData);
                
                // Check E2EE status
                if (!userData.public_key) {
                    setNeedsSetup(true);
                    setStatus('Setting up encryption...');
                } else {
                    const localKey = await restorePrivateKeyLocally();
                    if (!localKey) {
                        setNeedsUnlock(true);
                        setStatus('Unlock required...');
                    } else {
                        setStatus('Authentication successful. Redirecting...');
                        // Needs to reload or redirect to allow AuthContext to catch the new token
                        window.location.href = '/';
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile during callback", error);
                setStatus('Failed to complete authentication.');
                setTimeout(() => router.push('/auth/login'), 2000);
            }
        };
        
        fetchUserData();
    }, [searchParams, router]);

    const handleSetupComplete = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {(!needsSetup && !needsUnlock) && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">{status}</p>
                </motion.div>
            )}
            
            {needsSetup && <SetupPinModal user={user} onComplete={handleSetupComplete} />}
            
            {needsUnlock && <EnterPinModal user={user} onComplete={handleSetupComplete} />}
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
