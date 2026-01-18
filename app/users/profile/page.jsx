'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { motion } from 'motion/react';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/accounts/profiles/me/');
                setProfile(data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl overflow-hidden border border-emerald-500/10 shadow-2xl"
            >
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background shadow-xl overflow-hidden">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-emerald-500 bg-emerald-500/10">
                                    {user?.email[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button className="px-6 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-medium transition-colors border border-border">
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h1 className="text-3xl font-bold text-foreground">
                                    {profile?.first_name} {profile?.last_name}
                                </h1>
                                <p className="text-muted-foreground mt-1">@{user?.email.split('@')[0]}</p>
                                <p className="mt-4 text-foreground/80 leading-relaxed">
                                    {profile?.bio || 'No bio provided yet.'}
                                </p>
                            </section>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                                    <p className="mt-1 font-medium">{user?.email}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Role</p>
                                    <p className="mt-1 font-medium">{user?.role || 'User'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-secondary/20 border border-border">
                                <h3 className="font-bold mb-4">Account Status</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2 h-2 rounded-full ${user?.email_verified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <span className="text-sm">{user?.email_verified ? 'Verified' : 'Pending Verification'}</span>
                                </div>
                                <button 
                                    onClick={logout}
                                    className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-medium transition-all border border-red-500/20"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
