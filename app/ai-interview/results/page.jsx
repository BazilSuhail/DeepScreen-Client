"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiArrowLeft, HiSearch, HiSortAscending, HiCheckCircle, HiClock, HiChatAlt2, HiExternalLink } from "react-icons/hi";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export default function InterviewResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const interviewId = searchParams.get('id');

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchResults = async () => {
            try {
                const response = await axios.get(
                    `${SERVER_URL}/ai_interviews/${interviewId}/results/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setData(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch results:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (interviewId) {
            fetchResults();
        } else {
            router.push('/ai-interview');
        }
    }, [interviewId]);

    const filteredResults = data?.results?.filter(r =>
        (r.candidate_email || r.candidate?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.status.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-8">
                {/* Header Actions */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/ai-interview')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest mb-6"
                    >
                        <HiArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Detailed Analytics</p>
                            <h1 className="text-4xl font-black text-slate-900">
                                {data?.interview_title || "Interview"} <span className="text-slate-300">Results</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                    <HiCheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Completed</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{data?.completed || 0}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                    <HiClock size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Candidates</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{data?.total_candidates || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white border border-slate-200 rounded-[2rem] p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-sm">
                    <div className="flex-1 relative">
                        <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by candidate email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 placeholder:text-slate-300"
                        />
                    </div>
                    <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 rounded-2xl flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest transition-all">
                        <HiSortAscending size={20} /> Score Summary
                    </button>
                </div>

                {/* Results Table/List */}
                {filteredResults.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiSearch className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No candidates found</h3>
                        <p className="text-slate-400 font-medium">Try adjusting your search or share the link with more candidates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredResults.map((result) => (
                            <motion.div
                                key={result.id}
                                whileHover={{ scale: 1.005, y: -2 }}
                                className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
                            >
                                {/* Candidate Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Candidate Profile</p>
                                    <h3 className="text-xl font-black text-slate-900 truncate mb-1">{result.candidate_email || result.candidate?.email}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${result.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                result.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-400'
                                            }`}>
                                            {result.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            Attempted {new Date(result.started_at || result.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="flex items-center gap-12 px-10 border-x border-slate-100">
                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Neural Score</p>
                                        <div className="flex items-baseline justify-center gap-0.5">
                                            <p className={`text-3xl font-black ${(result.summary?.overall_score || 0) >= 8 ? 'text-emerald-500' :
                                                (result.summary?.overall_score || 0) >= 6 ? 'text-amber-500' :
                                                    'text-slate-300'
                                                }`}>
                                                {result.summary?.overall_score ? result.summary.overall_score.toFixed(1) : '-'}
                                            </p>
                                            <span className="text-slate-200 font-bold text-xs">/10</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Activity</p>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <HiChatAlt2 className="text-slate-300" />
                                            <p className="text-lg font-black text-slate-900 leading-none">{result.summary?.total_messages || 0}</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                                        <p className="text-lg font-black text-slate-900 leading-none">{result.summary?.duration_minutes || '-'}m</p>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex items-center">
                                    <button
                                        onClick={() => router.push(`/ai-interview/candidate-result?id=${result.id}`)}
                                        className="bg-slate-900 group-hover:bg-emerald-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                                    >
                                        <HiExternalLink size={24} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
