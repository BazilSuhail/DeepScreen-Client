'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
    HiOutlineBriefcase,
    HiOutlineChevronRight,
    HiOutlineClipboardDocumentList,
    HiOutlineUserGroup,
    HiOutlineSparkles,
    HiOutlineCalendarDays,
    HiOutlineBuildingOffice,
    HiOutlineDocumentText,
    HiOutlinePlus,
} from 'react-icons/hi2';

export default function RecruiterApplicationsPage() {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const data = await api.get('/applications/my-jobs/');
                setMyJobs(data);
            } catch (err) {
                setError('Failed to load your jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchMyJobs();
    }, []);

    const totalApplications = myJobs.reduce((sum, j) => sum + (j.total_applications || 0), 0);
    const openJobs = myJobs.filter(j => j.status === 'open').length;
    const shortlistedJobs = myJobs.filter(j => j.is_shortlisted).length;

    if (loading) return (
        <div className="space-y-6 px-12">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
            <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
        </div>
    );

    return (
        <div className="space-y-6 px-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">Applications</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <HiOutlineDocumentText className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Open Roles</h1>
                    <p className="text-muted-foreground mt-1">Manage your active job postings and candidate pipelines</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Active Roles', value: myJobs.length, icon: HiOutlineBriefcase, color: 'from-blue-500/10 to-blue-600/5 text-blue-500' },
                    { label: 'Total Applications', value: totalApplications, icon: HiOutlineUserGroup, color: 'from-purple-500/10 to-purple-600/5 text-purple-500' },
                    { label: 'AI Analyzed', value: shortlistedJobs, icon: HiOutlineSparkles, color: 'from-amber-500/10 to-amber-600/5 text-amber-500' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold">{error}</div>
            )}

            {myJobs.length === 0 ? (
                <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
                    <HiOutlineClipboardDocumentList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                    <h2 className="text-xl font-bold text-foreground mb-2">No Jobs Posted Yet</h2>
                    <p className="text-muted-foreground mb-6">Post a job first to start receiving applications.</p>
                    <button 
                        onClick={() => router.push('/recruiter/jobs/create')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> Create Your First Job
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {myJobs.map((job, i) => (
                        <motion.button
                            key={job.job_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => router.push(`/recruiter/applications/${job.job_id}`)}
                            className="group bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-emerald-500/30 transition-all text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
                                    <HiOutlineBriefcase className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors truncate">
                                        {job.job_title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <HiOutlineUserGroup className="w-3.5 h-3.5" />
                                            <span className="font-semibold">{job.total_applications}</span> Applicants
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <HiOutlineBuildingOffice className="w-3.5 h-3.5" />
                                            {job.location || 'Remote'}
                                        </span>
                                        {job.posted_date && (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                                {new Date(job.posted_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {job.is_shortlisted && (
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                                                <HiOutlineSparkles className="w-3 h-3" />
                                                AI Analyzed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</p>
                                    <p className="text-sm font-bold text-emerald-500 capitalize">{job.status}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
