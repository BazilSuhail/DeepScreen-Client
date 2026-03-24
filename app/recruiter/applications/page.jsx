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
    HiOutlineSparkles
} from 'react-icons/hi2';

export default function RecruiterJobsPage() {
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
        <div className="flex items-center justify-center min-h-[60vh] bg-mesh">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-12 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-5xl font-black tracking-tight text-gradient mb-2">My Open Roles</h1>
                <p className="text-muted-foreground text-lg font-medium">Manage your active job postings and candidate pipelines</p>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                    {error}
                </div>
            )}

            {myJobs.length === 0 ? (
                <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                    <HiOutlineClipboardDocumentList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold">No Jobs Posted Yet</h3>
                    <p className="text-muted-foreground mt-2">Post a job first to start receiving applications.</p>
                    <button 
                        onClick={() => router.push('/recruiter/post-job')}
                        className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        Create Your First Job
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {myJobs.map((job) => (
                        <motion.button
                            key={job.job_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => router.push(`/recruiter/applications/${job.job_id}`)}
                            className="group glass p-8 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <HiOutlineBriefcase className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground group-hover:text-emerald-600 transition-colors">
                                        {job.job_title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-600/70">
                                            <HiOutlineUserGroup className="w-4 h-4" />
                                            {job.total_applications} Applicants
                                        </span>
                                        <span className="text-xs text-muted-foreground">·</span>
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {job.location}
                                        </span>
                                        {job.is_shortlisted && (
                                            <span className="flex items-center gap-1 text-[10px] bg-emerald-600/10 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                <HiOutlineSparkles className="w-3 h-3" />
                                                AI Analyzed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                    <p className="text-sm font-bold text-emerald-600 capitalize">{job.status}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                    <HiOutlineChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
