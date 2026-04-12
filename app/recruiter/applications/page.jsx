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
    HiOutlineChartBarSquare,
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="w-full px-4 md:px-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Open Roles</h1>
                <p className="text-muted-foreground mt-1">Manage your active job postings and candidate pipelines</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold">{error}</div>
            )}

            {myJobs.length === 0 ? (
                <div className="py-24 text-center glass rounded-2xl border-dashed border-2 border-border">
                    <HiOutlineClipboardDocumentList className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold">No Jobs Posted Yet</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Post a job first to start receiving applications.</p>
                    <button 
                        onClick={() => router.push('/recruiter/post-job')}
                        className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-sm"
                    >
                        Create Your First Job
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {myJobs.map((job) => (
                        <motion.button
                            key={job.job_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => router.push(`/recruiter/applications/${job.job_id}`)}
                            className="group glass p-5 md:p-6 rounded-xl border border-border hover:border-emerald-500/30 transition-all text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
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
