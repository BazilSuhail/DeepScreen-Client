'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { 
    HiOutlineBriefcase, 
    HiOutlineDocumentText, 
    HiOutlineStar, 
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineChevronRight,
    HiOutlineDocumentDuplicate,
    HiOutlineChartBar
} from 'react-icons/hi2';
import Link from 'next/link';

export default function CandidateDashboard() {
    const [stats, setStats] = useState({
        totalApplications: 0,
        shortlisted: 0,
        totalResumes: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [apps, resumes] = await Promise.all([
                    api.get('/applications/my/'),
                    api.get('/resumes/me/')
                ]);
                
                setStats({
                    totalApplications: apps.length,
                    shortlisted: apps.filter(a => a.current_stage === 'shortlisted').length,
                    totalResumes: resumes.length
                });
                setRecentApplications(apps.slice(0, 3));
            } catch (err) {
                console.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-10 p-4 md:p-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Welcome back!</h1>
                <p className="text-muted-foreground mt-1 text-lg">Here's what's happening with your job search today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Applications', value: stats.totalApplications, icon: HiOutlineDocumentText, color: 'blue' },
                    { label: 'Shortlisted', value: stats.shortlisted, icon: HiOutlineCheckCircle, color: 'emerald' },
                    { label: 'My Resumes', value: stats.totalResumes, icon: HiOutlineDocumentDuplicate, color: 'purple' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-8 rounded-[2.5rem] border border-emerald-500/5 relative overflow-hidden group"
                    >
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-all`} />
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 mb-6 shrink-0`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div className="text-4xl font-black mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Applications */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black">Recent Applications</h2>
                        <Link href="/candidate/applications" className="text-emerald-500 text-sm font-bold hover:underline flex items-center gap-1">
                            View All <HiOutlineChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    <div className="space-y-4">
                        {recentApplications.map((app, i) => (
                            <motion.div 
                                key={app.application_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="glass p-6 rounded-[2rem] border border-emerald-500/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-emerald-600">
                                        <HiOutlineBriefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{app.job_details?.job_title}</h4>
                                        <p className="text-xs text-muted-foreground">{app.job_details?.organization_details?.name} • Applied {new Date(app.applied_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                        {app.current_stage.replace('_', ' ')}
                                    </span>
                                    <HiOutlineChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                        
                        {recentApplications.length === 0 && (
                            <div className="glass rounded-[2rem] p-12 text-center border-dashed border-2 border-border opacity-60">
                                <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                                <p className="text-muted-foreground font-medium">No applications yet.</p>
                                <Link href="/candidate/jobs" className="text-emerald-500 font-bold hover:underline mt-2 inline-block">Explore Jobs</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black px-2">Quick Actions</h2>
                    <div className="glass rounded-[2.5rem] p-8 border border-emerald-500/5 space-y-4">
                        <Link href="/candidate/resumes" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <HiOutlinePlus className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Add New Resume</h4>
                                <p className="text-[10px] text-muted-foreground">Improve your chances with AI screening</p>
                            </div>
                        </Link>

                        <Link href="/candidate/jobs" className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <HiOutlineMagnifyingGlass className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Browse Jobs</h4>
                                <p className="text-[10px] text-muted-foreground">Find roles matching your profile</p>
                            </div>
                        </Link>

                        <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border mt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlineChartBar className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-black uppercase tracking-widest opacity-60">Profile Strength</span>
                            </div>
                            <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-emerald-500" style={{ width: stats.totalResumes > 0 ? '85%' : '20%' }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {stats.totalResumes > 0 
                                    ? 'Great! Your profile is mostly complete.' 
                                    : 'Upload a resume to reach 100% profile strength.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
