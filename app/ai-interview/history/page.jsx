"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiArrowLeft, HiCalendar, HiChatAlt2, HiCheckCircle, HiArrowRight, HiClock } from "react-icons/hi";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export default function CandidateHistory() {
    const router = useRouter();
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await axios.get(
                    `${SERVER_URL}/ai_interviews/candidate/history/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setInterviews(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-8">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest mb-4"
                    >
                        <HiArrowLeft size={18} /> Exit
                    </button>
                    <h1 className="text-4xl font-black text-slate-900">
                        Interview <span className="text-emerald-500 italic">History</span>
                    </h1>
                    <p className="text-slate-600 font-medium">Review your performance across autonomous sessions</p>
                </div>

                {interviews.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiCalendar className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No interviews found</h3>
                        <p className="text-slate-500">You haven't participated in any AI interviews yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {interviews.map((interview) => (
                            <motion.div
                                key={interview.id}
                                whileHover={{ x: 10 }}
                                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-8 shadow-sm transition-all group"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-500 transition-colors">{interview.job_title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${interview.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                interview.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {interview.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><HiCalendar /> {new Date(interview.started_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><HiClock /> {interview.summary?.duration_minutes || '-'}m Duration</span>
                                        <span className="flex items-center gap-1.5"><HiChatAlt2 /> {interview.summary?.total_messages || '-'} Messages</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 px-8 border-l border-slate-50 md:min-w-[150px] justify-center">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
                                        <p className={`text-2xl font-black ${(interview.summary?.overall_score || 0) >= 8 ? 'text-emerald-500' :
                                                (interview.summary?.overall_score || 0) >= 6 ? 'text-amber-500' :
                                                    'text-slate-400'
                                            }`}>
                                            {interview.summary?.overall_score ? interview.summary.overall_score.toFixed(1) : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {interview.status === 'completed' ? (
                                        <button
                                            onClick={() => router.push(`/ai-interview/candidate-result?id=${interview.id}`)}
                                            className="w-12 h-12 bg-slate-900 hover:bg-emerald-500 text-white flex items-center justify-center rounded-xl transition-all shadow-xl shadow-slate-900/10 group-hover:shadow-emerald-500/10"
                                        >
                                            <HiArrowRight size={20} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push(`/ai-interview/session?candidate_interview_id=${interview.id}`)}
                                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Continue
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
