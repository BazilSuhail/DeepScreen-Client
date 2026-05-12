'use client';

import React, { useState } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function CreateOrganizationPage() {
    const [formData, setFormData] = useState({
        name: '',
        industry: 'Tech',
        description: '',
        logo_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await api.post('/organizations/', formData);
            router.push(`/organizations/${data.slug}`);
        } catch (err) {
            setError(err.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-8 shadow-xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <HiOutlineBuildingOffice2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Create Your Organization</h1>
                    <p className="text-muted-foreground mt-2">Set up your workspace and start recruiting</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/60 ml-1 uppercase tracking-wider">Organization Name</label>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all"
                            placeholder="Acme Corp"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/60 ml-1 uppercase tracking-wider">Industry</label>
                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-muted border border-border text-foreground focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all"
                            >
                                {['Tech', 'Fintech', 'Healthcare', 'Education', 'Ecommerce', 'Other'].map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/60 ml-1 uppercase tracking-wider">Logo URL</label>
                            <input
                                name="logo_url"
                                type="url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/60 ml-1 uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all resize-none"
                            placeholder="Tell us about your organization..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 text-base"
                    >
                        {loading ? 'Creating...' : 'Create Organization'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
