'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { HiOutlinePlus } from 'react-icons/hi2';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';

export default function RecruiterJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJobs = async () => {
        try {
            const data = await api.get('/jobs/');
            setJobs(data);
        } catch (err) {
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleDelete = async (jobId) => {
        if (!confirm('Delete this job posting? This cannot be undone.')) return;
        try {
            await api.delete(`/jobs/${jobId}/`);
            setJobs(prev => prev.filter(j => j.job_id !== jobId));
        } catch {
            alert('Failed to delete job');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Job Management</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your open positions</p>
                </div>
                <Link
                    href="/recruiter/jobs/create"
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <HiOutlinePlus className="w-5 h-5" /> Post New Job
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">{error}</div>
            )}

            <div className="space-y-4">
                {jobs.map((job, i) => (
                    <JobCard key={job.job_id} job={job} index={i} onDelete={handleDelete} showApplicants />
                ))}
                {jobs.length === 0 && !loading && (
                    <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <h3 className="text-xl font-bold">No Jobs Posted Yet</h3>
                        <p className="text-muted-foreground mt-2 mb-8">Start by creating your first job listing.</p>
                        <Link href="/recruiter/jobs/create" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl">
                            Create Job
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
