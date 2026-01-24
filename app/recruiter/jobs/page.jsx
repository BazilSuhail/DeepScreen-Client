'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlinePlus, 
    HiOutlineBriefcase, 
    HiOutlineMapPin, 
    HiOutlineCurrencyDollar,
    HiOutlineUserGroup,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineChevronRight,
    HiOutlineChartBar
} from 'react-icons/hi2';
import Link from 'next/link';

export default function RecruiterJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // The backend job_list view returns jobs
                // We might need to filter for 'my jobs' if the API supports it, 
                // but usually recruiters see jobs for their org.
                const data = await api.get('/jobs/');
                setJobs(data);
            } catch (err) {
                setError('Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Job Management</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your organization's open positions</p>
                </div>
                <Link 
                    href="/recruiter/jobs/create"
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Post New Job
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {jobs.map((job, i) => (
                    <motion.div
                        key={job.job_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 border border-emerald-500/10">
                                <HiOutlineBriefcase className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-emerald-500 transition-colors">
                                    {job.job_title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineMapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineCurrencyDollar className="w-4 h-4" />
                                        {job.salary_range || 'Not Specified'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                        job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'
                                    }`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right hidden md:block">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Applications</label>
                                <div className="flex items-center gap-2 justify-end text-emerald-600 font-black">
                                    <HiOutlineUserGroup className="w-4 h-4" />
                                    <span>24</span> 
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-l border-emerald-500/5 pl-8">
                                <button className="p-3 rounded-xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                                    <HiOutlineChartBar className="w-5 h-5" />
                                </button>
                                <button className="p-3 rounded-xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                                    <HiOutlinePencilSquare className="w-5 h-5" />
                                </button>
                                <Link 
                                    href={`/recruiter/applications?job=${job.job_id}`}
                                    className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {jobs.length === 0 && !loading && (
                    <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineBriefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Jobs Posted Yet</h3>
                        <p className="text-muted-foreground mt-2 mb-8">Start by creating your first job listing.</p>
                        <Link 
                            href="/recruiter/jobs/create"
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl"
                        >
                            Create Job
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
