'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiOutlinePlus, 
    HiOutlineCalendar, 
    HiOutlineVideoCamera, 
    HiOutlineClipboardCopy,
    HiOutlineCog,
    HiOutlineCheckCircle,
    HiOutlineExclamation
} from 'react-icons/hi';

export default function RecruiterInterviewDashboard() {
    const [interviews, setInterviews] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('setup'); // 'setup' or 'sessions'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interviewsData, jobsData] = await Promise.all([
                api.get('/interviews/recruiter/'),
                api.get('/interviews/recruiter/jobs/')
            ]);
            setInterviews(interviewsData);
            setJobs(jobsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight">Live Interviews</h1>
                    <p className="text-muted-foreground mt-2">Configure interview templates and manage live sessions.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-secondary/30 p-2 rounded-2xl w-fit border border-border">
                    <button 
                        onClick={() => setActiveTab('setup')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'setup' ? 'bg-primary text-white shadow-lg' : 'hover:bg-secondary text-muted-foreground'
                        }`}
                    >
                        <HiOutlineCog className="w-5 h-5" />
                        Interview Setup
                    </button>
                    <button 
                        onClick={() => setActiveTab('sessions')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'sessions' ? 'bg-primary text-white shadow-lg' : 'hover:bg-secondary text-muted-foreground'
                        }`}
                    >
                        <HiOutlineCalendar className="w-5 h-5" />
                        Upcoming Sessions
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'setup' ? (
                            <motion.div 
                                key="setup"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {jobs.map((job) => (
                                    <div key={job.job_id} className="glass p-6 rounded-3xl border border-border flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold">{job.job_title}</h3>
                                                {job.has_config ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                                        <HiOutlineCheckCircle className="w-3 h-3" />
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                                                        <HiOutlineExclamation className="w-3 h-3" />
                                                        Pending Setup
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-6">{job.organization}</p>
                                        </div>
                                        <Link
                                            href={`/recruiter/interview/setup/${job.job_id}`}
                                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                                                job.has_config 
                                                ? 'bg-secondary hover:bg-secondary/80' 
                                                : 'bg-primary text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                                            }`}
                                        >
                                            <HiOutlineCog className="w-5 h-5" />
                                            {job.has_config ? 'Edit Configuration' : 'Setup Instructions'}
                                        </Link>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="sessions"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {interviews.length === 0 ? (
                                    <div className="col-span-full text-center py-20 glass rounded-3xl border border-border">
                                        <HiOutlineCalendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                        <h3 className="text-xl font-bold mb-2">No interviews scheduled</h3>
                                        <p className="text-muted-foreground">Candidate sessions will appear here after automated scheduling.</p>
                                    </div>
                                ) : (
                                    interviews.map((interview) => (
                                        <div key={interview.room_id} className="glass p-6 rounded-3xl border border-border hover:border-emerald-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-secondary/50 rounded-2xl">
                                                    <HiOutlineVideoCamera className="w-6 h-6 text-primary" />
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    interview.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                                                    interview.status === 'in_progress' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {interview.status}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold mb-1 truncate">
                                                {interview.candidate_details?.email || 'Candidate'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                                                <HiOutlineCalendar className="w-4 h-4" />
                                                {new Date(interview.scheduled_at).toLocaleString()}
                                            </p>

                                            <div className="space-y-3 pt-4 border-t border-border">
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(interview.interview_link);
                                                        alert('Link copied!');
                                                    }}
                                                    className="w-full py-3 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <HiOutlineClipboardCopy className="w-4 h-4" />
                                                    Copy Interview Link
                                                </button>
                                                <Link
                                                    href={`/recruiter/interview/${interview.room_id}`}
                                                    className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold flex items-center justify-center transition-all"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
