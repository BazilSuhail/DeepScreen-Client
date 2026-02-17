'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiOutlineCalendar, 
    HiOutlineVideoCamera, 
    HiOutlineClock, 
    HiOutlineOfficeBuilding,
    HiOutlineInformationCircle,
    HiOutlineArrowRight
} from 'react-icons/hi';
import Link from 'next/link';

export default function CandidateInterviewPage() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const data = await api.get('/interviews/candidate/');
            setInterviews(data);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const isUpcoming = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) > new Date();
    };

    return (
        <div className="min-h-screen bg-mesh p-6 lg:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-5xl font-black tracking-tight mb-4"
                    >
                        Your Interviews
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg"
                    >
                        Prepare for your live technical sessions with top companies.
                    </motion.p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="mt-4 font-bold text-emerald-500 animate-pulse">Loading sessions...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {interviews.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="col-span-full py-20 glass rounded-3xl border border-border text-center"
                                >
                                    <HiOutlineCalendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-20" />
                                    <h3 className="text-2xl font-bold mb-2">No interviews yet</h3>
                                    <p className="text-muted-foreground">Keep applying! Your scheduled live sessions will appear here.</p>
                                </motion.div>
                            ) : (
                                interviews.map((session, index) => (
                                    <motion.div
                                        key={session.room_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group glass p-8 rounded-[2rem] border border-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                                <HiOutlineVideoCamera className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                                                isUpcoming(session.scheduled_at) 
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                            }`}>
                                                {session.status}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                                            {session.job_application_details?.job_title || 'Technical Interview'}
                                        </h3>
                                        
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-muted-foreground font-medium">
                                                <HiOutlineOfficeBuilding className="w-5 h-5 text-emerald-500/50" />
                                                <span>{session.job_application_details?.organization_name || 'Hiring Company'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-muted-foreground font-medium">
                                                <HiOutlineCalendar className="w-5 h-5 text-emerald-500/50" />
                                                <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-muted-foreground font-medium">
                                                <HiOutlineClock className="w-5 h-5 text-emerald-500/50" />
                                                <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-emerald-500/5 flex flex-col gap-4">
                                            {session.scheduled_at ? (
                                                <Link
                                                    href={`/interview/join/${session.access_token}`}
                                                    className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 hover:scale-[1.03] active:scale-95 transition-all"
                                                >
                                                    JOIN INTERVIEW
                                                    <HiOutlineArrowRight className="w-5 h-5" />
                                                </Link>
                                            ) : (
                                                <div className="w-full py-4 bg-amber-500/10 text-amber-500 font-bold rounded-2xl flex items-center justify-center gap-3 border border-amber-500/20">
                                                    <HiOutlineInformationCircle className="w-5 h-5" />
                                                    WAITING FOR SCHEDULE
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
