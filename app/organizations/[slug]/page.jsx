'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
    HiOutlineUsers, 
    HiOutlineBriefcase, 
    HiOutlineEnvelope, 
    HiOutlineGlobeAlt,
    HiOutlinePencilSquare,
    HiOutlineUserPlus
} from 'react-icons/hi2';
import Link from 'next/link';

export default function OrganizationDetailPage() {
    const { slug } = useParams();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data = await api.get(`/organizations/${slug}/`);
                setOrg(data);
            } catch (err) {
                setError('Organization not found');
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, [slug]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (error || !org) return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-500">{error || 'Something went wrong'}</h1>
            <Link href="/organizations" className="text-emerald-500 hover:underline mt-4 inline-block">Back to Organizations</Link>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Card */}
            <div className="glass p-8 rounded-[2rem] border border-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-white dark:bg-secondary/50 flex items-center justify-center text-emerald-600 shadow-xl border border-emerald-500/10">
                        {org.logo_url ? (
                            <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain rounded-3xl" />
                        ) : (
                            <span className="text-3xl font-black">{org.name[0]}</span>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold">{org.name}</h1>
                            {org.is_verified && (
                                <span className="bg-emerald-500 text-white p-1 rounded-full" title="Verified">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl">{org.description || 'No description provided.'}</p>
                        
                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm">
                                <HiOutlineGlobeAlt className="w-4 h-4 text-emerald-500" />
                                {org.industry}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm">
                                <HiOutlineUsers className="w-4 h-4 text-emerald-500" />
                                {org.members_count} Team Members
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href={`/organizations/${org.slug}/invite`}>
                            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20">
                                <HiOutlineUserPlus className="w-5 h-5" />
                                Invite Member
                            </button>
                        </Link>
                        <button className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-2xl font-bold transition-all border border-border">
                            <HiOutlinePencilSquare className="w-5 h-5" />
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Jobs', value: org.active_jobs_count, icon: HiOutlineBriefcase, color: 'emerald' },
                    { label: 'Total Applicants', value: '0', icon: HiOutlineEnvelope, color: 'teal' },
                    { label: 'Total Hired', value: org.total_hired_count, icon: HiOutlineUsers, color: 'blue' },
                    { label: 'Growth', value: '+0%', icon: HiOutlineGlobeAlt, color: 'purple' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-3xl border border-emerald-500/5"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs / Sections Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Active Jobs</h2>
                        <Link href="/jobs/create" className="text-emerald-500 text-sm font-bold hover:underline">Post a Job</Link>
                    </div>
                    <div className="glass rounded-[2rem] p-12 text-center border-dashed border-2 border-border opacity-60">
                        <HiOutlineBriefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <p className="text-muted-foreground font-medium">No active job listings found.</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Recent Members</h2>
                    <div className="glass rounded-[2rem] p-6 border border-emerald-500/5">
                        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-all">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                                {org.owner.email[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-sm">{org.owner.email.split('@')[0]}</div>
                                <div className="text-xs text-muted-foreground">Owner</div>
                            </div>
                        </div>
                        <Link href={`/organizations/${org.slug}/members`} className="block text-center text-sm font-bold text-emerald-500 hover:underline mt-6">
                            View All Members
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
