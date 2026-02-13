'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineCalendar, HiOutlineVideoCamera, HiOutlineClipboardCopy } from 'react-icons/hi';

export default function RecruiterInterviewListPage() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const data = await api.get('/interviews/recruiter/');
            setInterviews(data);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Live Interviews</h1>
                        <p className="text-muted-foreground mt-2">Manage and schedule your real-time candidate sessions.</p>
                    </div>
                    <Link
                        href="/recruiter/interview/create"
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.05] transition-all"
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                        Schedule New
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : interviews.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl border border-border">
                        <HiOutlineCalendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No interviews scheduled</h3>
                        <p className="text-muted-foreground mb-6">Create your first interview session to get started.</p>
                        <Link
                            href="/recruiter/interview/create"
                            className="text-primary font-bold hover:underline"
                        >
                            Schedule an interview now
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.map((interview) => (
                            <motion.div
                                key={interview.room_id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-6 rounded-3xl border border-border hover:border-emerald-500/30 transition-all group"
                            >
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
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
