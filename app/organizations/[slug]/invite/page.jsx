'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function InviteRecruiterPage() {
    const { slug } = useParams();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data = await api.get(`/organizations/${slug}/`);
                setOrgName(data.name);
            } catch (err) {
                setError('Could not load organization details');
            }
        };
        fetchOrg();
    }, [slug]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            await api.post('/accounts/auth/recruiter/invite/', {
                email,
                org_slug: slug
            });
            setSuccess(true);
            setEmail('');
        } catch (err) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-3xl shadow-2xl border border-emerald-500/10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Invite a Recruiter
                    </h1>
                    <p className="text-muted-foreground mt-2">To join {orgName || 'your organization'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
                            ✓ Invitation sent successfully!
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Recruiter's Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="recruiter@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => window.history.back()}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Back to Organization
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
