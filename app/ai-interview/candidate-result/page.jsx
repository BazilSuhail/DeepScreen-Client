"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from "framer-motion";
import { HiArrowLeft, HiDownload, HiChatAlt2, HiCheckCircle, HiCalendar, HiClock, HiLightningBolt } from "react-icons/hi";
import { BiBarChartAlt2 } from "react-icons/bi";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

const ScoreBar = ({ label, score, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
            <span className={`text-sm font-black ${color} leading-none`}>{typeof score === 'number' ? score.toFixed(1) : '0.0'}/10</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score || 0) * 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${color.replace('text-', 'bg-')}`}
            ></motion.div>
        </div>
    </div>
);

export default function CandidateResultDetail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const resultId = searchParams.get('id');

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'conversation'

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchDetail = async () => {
            try {
                const response = await axios.get(
                    `${SERVER_URL}/ai_interviews/${resultId}/candidate-results/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch detail:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (resultId) {
            fetchDetail();
        } else {
            router.push('/ai-interview');
        }
    }, [resultId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, evaluation_results, conversation_data, candidate_email, started_at } = data;

    // Safety check for dimensions from evaluation_results
    const dimensions = evaluation_results?.dimensions || evaluation_results || {};

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest mb-4"
                        >
                            <HiArrowLeft size={18} /> Back to Results
                        </button>
                        <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Detailed Candidate Analysis</p>
                        <h1 className="text-4xl font-black text-slate-900 leading-none">{candidate_email}</h1>
                        <div className="flex flex-wrap items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                                <HiCalendar className="text-emerald-500" /> {new Date(started_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                                <HiClock className="text-emerald-500" /> {summary?.duration_minutes || 0}m Duration
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                                <HiChatAlt2 className="text-emerald-500" /> {summary?.total_messages || 0} Messages
                            </div>
                        </div>
                    </div>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                        <HiDownload size={18} /> Export Analysis
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Scores */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>

                            <div className="relative z-10">
                                <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Neural Score Index</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-7xl font-black tracking-tighter">{summary?.overall_score?.toFixed(1) || '0.0'}</span>
                                    <span className="text-emerald-400/30 font-black text-2xl">/10</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(summary?.overall_score || 0) * 10}%` }}
                                            className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                        ></motion.div>
                                    </div>
                                    <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-widest text-center">Engineered Evaluation</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                    <BiBarChartAlt2 className="text-emerald-500 w-5 h-5" /> Metric Matrix
                                </h3>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                            <div className="space-y-8">
                                <ScoreBar label="Technical Accuracy" score={dimensions.technical_accuracy || 0} color="text-emerald-500" />
                                <ScoreBar label="Concept Understanding" score={dimensions.concept_understanding || 0} color="text-emerald-500" />
                                <ScoreBar label="Communication Clarity" score={dimensions.communication_clarity || 0} color="text-emerald-500" />
                                <ScoreBar label="Relevance to Question" score={dimensions.relevance_to_question || 0} color="text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl inline-flex shadow-sm">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'summary' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Executive Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('conversation')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'conversation' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Conversation Log
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'summary' ? (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                                <HiLightningBolt className="text-amber-500 w-5 h-5" />
                                            </div>
                                            <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest">Neural Insights</h3>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative">
                                            <div className="absolute top-4 right-6 text-slate-200">
                                                <HiChatAlt2 size={40} className="rotate-12" />
                                            </div>
                                            <p className="text-slate-600 font-medium text-lg leading-relaxed relative z-10 italic">
                                                {summary?.key_insights || 'Analysis in progress. Our autonomous agent is distilling the core competencies revealed during this session.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm">
                                        <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-8">Session Milestones</h3>
                                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-slate-50">
                                            <div className="flex items-center gap-6 relative">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 z-10">
                                                    <HiCheckCircle size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-black text-slate-900">Neural Link Established</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(started_at).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            {summary?.total_messages > 0 && (
                                                <div className="flex items-center gap-6 relative">
                                                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-300 z-10">
                                                        <HiChatAlt2 size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-slate-900">{summary.total_messages} Interactive Rounds</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Autonomous Feedback</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-6 relative">
                                                <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-300 z-10">
                                                    <HiClock size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-black text-slate-900">Evaluation Finalized</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ready for Review</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="convo"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm space-y-10"
                                >
                                    <div className="space-y-8">
                                        {conversation_data?.messages?.map((msg, idx) => (
                                            <div key={idx} className="group">
                                                <div className={`flex items-center gap-3 mb-3 ${msg.role === 'assistant' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    <div className={`p-1.5 rounded-lg ${msg.role === 'assistant' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                                                        {msg.role === 'assistant' ? <HiLightningBolt size={12} /> : <HiChatAlt2 size={12} />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                        {msg.role === 'assistant' ? 'Neural Agent' : 'Candidate'}
                                                    </span>
                                                </div>
                                                <div className={`p-6 rounded-3xl text-[14px] font-medium leading-relaxed transition-all ${msg.role === 'assistant'
                                                        ? 'bg-emerald-50 text-slate-900 border border-emerald-100 group-hover:bg-emerald-100/50'
                                                        : 'bg-white text-slate-700 border border-slate-100 group-hover:border-slate-200'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
