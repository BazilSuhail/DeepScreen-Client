'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlineUserCircle, 
    HiOutlineChartBar, 
    HiOutlineMapPin, 
    HiOutlineCalendar,
    HiOutlineBriefcase,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineRocketLaunch,
    HiOutlineFunnel,
    HiOutlineChevronDown,
    HiOutlineSparkles
} from 'react-icons/hi2';
import { useSearchParams } from 'next/navigation';

export default function RecruiterApplicationsPage() {
    const searchParams = useSearchParams();
    const jobFilter = searchParams.get('job');
    
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(jobFilter || '');
    const [loading, setLoading] = useState(true);
    const [shortlisting, setShortlisting] = useState(false);

    const fetchData = async () => {
        try {
            const [appsData, jobsData] = await Promise.all([
                selectedJob 
                    ? api.get(`/applications/job/${selectedJob}/`) 
                    : api.get('/applications/'), // Need to check if this endpoint exists or filter manually
                api.get('/jobs/')
            ]);
            setApplications(appsData);
            setJobs(jobsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedJob]);

    const handleShortlist = async () => {
        if (!selectedJob) return;
        setShortlisting(true);
        try {
            await api.post(`/applications/job/${selectedJob}/shortlist/`);
            fetchData(); // Refresh list to see scores
        } catch (err) {
            alert('Shortlisting failed');
        } finally {
            setShortlisting(false);
        }
    };

    const updateStatus = async (appId, status) => {
        try {
            await api.patch(`/applications/${appId}/status/`, { status });
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black">Candidate Applications</h1>
                    <p className="text-muted-foreground mt-1">Review and manage talent in your pipeline</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <select 
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="w-full pl-6 pr-12 py-3 rounded-2xl bg-secondary/50 border border-emerald-500/10 outline-none focus:border-emerald-500 appearance-none font-bold text-sm transition-all"
                        >
                            <option value="">All Positions</option>
                            {jobs.map(job => (
                                <option key={job.job_id} value={job.job_id}>{job.job_title}</option>
                            ))}
                        </select>
                        <HiOutlineChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    </div>
                    
                    {selectedJob && (
                        <button 
                            onClick={handleShortlist}
                            disabled={shortlisting}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {shortlisting ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                            ) : (
                                <><HiOutlineSparkles className="w-5 h-5" /> Run AI Screening</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {applications.map((app, i) => (
                    <motion.div
                        key={app.application_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col lg:flex-row items-center gap-8 group"
                    >
                        {/* Profile Info */}
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 border border-emerald-500/10 shrink-0">
                                <HiOutlineUserCircle className="w-10 h-10" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold truncate">
                                    {app.resume_details?.candidate_name || 'Anonymous Candidate'}
                                </h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <HiOutlineMapPin className="w-4 h-4" />
                                        {app.resume_details?.current_location || 'Remote'}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-emerald-500/80">{app.resume_details?.years_experience} Years Exp.</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Match Score */}
                        <div className="flex flex-col items-center lg:items-end min-w-[120px]">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">AI Match Score</label>
                            {app.shortlist_score ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-black text-emerald-500">{(app.shortlist_score * 100).toFixed(0)}%</span>
                                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${app.shortlist_score * 100}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs font-bold text-muted-foreground italic">Not Evaluated</span>
                            )}
                        </div>

                        {/* Status & Pipeline */}
                        <div className="flex flex-wrap items-center gap-4 border-l border-emerald-500/5 lg:pl-8">
                            <div className="text-right">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Current Stage</label>
                                <span className="font-bold text-xs uppercase tracking-tighter bg-secondary px-3 py-1 rounded-lg">
                                    {app.current_stage.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateStatus(app.application_id, 'rejected')}
                                    className="p-3 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"
                                >
                                    <HiOutlineXCircle className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => updateStatus(app.application_id, 'shortlisted')}
                                    className="p-3 rounded-xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 transition-all border border-emerald-500/10"
                                >
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm">
                                    View Resume
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {applications.length === 0 && !loading && (
                    <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineUserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Candidates Yet</h3>
                        <p className="text-muted-foreground mt-2">Applications for this position will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
