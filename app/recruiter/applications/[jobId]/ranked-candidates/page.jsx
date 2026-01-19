"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    HiOutlineUser,
    HiOutlineLocationMarker,
    HiOutlineChevronLeft,
    HiOutlineLightningBolt,
    HiOutlineGlobeAlt,
    HiOutlineSparkles,
    HiOutlineScale,
    HiOutlineX,
    HiOutlineArrowRight
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function RankedCandidatesPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId;

    const [results, setResults] = useState([]);
    const [jobData, setJobData] = useState({ title: "", total_matches: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (jobId) {
            fetchRankedCandidates();
        }
    }, [jobId]);

    const fetchRankedCandidates = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        try {
            const response = await axios.get(`${SERVER_URL}/applications/find-candidates/`, {
                params: { job_id: jobId, limit: 50 },
                headers: { Authorization: `Bearer ${token}` }
            });

            setResults(response.data.results || []);
            setJobData({
                title: response.data.job_title,
                total_matches: response.data.total_matches
            });
        } catch (err) {
            console.error("AI Matching failed:", err);
            setError(err.response?.data?.error || "Neural search protocol interrupted. Could not rank talent pool.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 font-poppins relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>

                <div className="text-center relative z-10">
                    <div className="mb-8 relative inline-block">
                        <AiOutlineLoading3Quarters className="animate-spin text-emerald-400 text-5xl mx-auto" />
                        <HiOutlineSparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 animate-pulse" size={20} />
                    </div>
                    <h2 className="text-white text-lg font-[700] uppercase tracking-[0.3em] mb-2 font-poppins">AI Matching Grid</h2>
                    <p className="text-slate-500 font-[700] uppercase tracking-[0.2em] text-[8px] max-w-xs mx-auto leading-relaxed font-poppins">
                        Embedding requirements & Vectorizing entire neural talent pool...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-12 pb-20">
            <div className="px-8">

                {/* Header Section */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-[700] text-[9px] uppercase tracking-widest mb-6 transition-all group font-poppins"
                    >
                        <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                        Manual Review
                    </button>

                    <div className="relative bg-white border border-slate-200 rounded-[40px] p-10 lg:p-14 overflow-hidden shadow-sm group">
                        <div className="absolute inset-0 bg-grid-slate-400/[0.02] bg-[size:30px_30px]"></div>

                        {/* Decorative Neon Element */}
                        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500 blur-[80px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <HiOutlineLightningBolt className="text-emerald-500" size={14} />
                                    </div>
                                    <p className="text-emerald-600 font-[700] uppercase tracking-[0.4em] text-[9px] font-poppins">Ranked Match Engine v2.0</p>
                                </div>
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 font-poppins">
                                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 italic">Leaderboard</span>
                                </h1>
                                <p className="text-slate-500 font-[700] text-[13px] max-w-xl leading-relaxed font-poppins">
                                    Top ranked candidates for <span className="text-slate-900 font-[700]">{jobData.title}</span> identified through multidimensional vector analysis.
                                </p>
                            </div>

                            <div className="flex items-center gap-10 bg-slate-50 border border-slate-100 p-8 rounded-3xl">
                                <div className="text-center">
                                    <p className="text-[9px] font-[700] text-slate-400 uppercase tracking-widest mb-1 font-poppins">Grid Match</p>
                                    <p className="text-3xl font-[700] text-slate-900 leading-none font-poppins">{jobData.total_matches}</p>
                                </div>
                                <div className="w-[1px] h-10 bg-slate-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-[700] text-emerald-500 uppercase tracking-widest mb-1 font-poppins">Processing Status</span>
                                    <span className="text-[12px] font-[700] text-slate-900 uppercase font-poppins">Analysis Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] text-red-500 mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm font-poppins">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-50">
                            <HiOutlineX size={24} />
                        </div>
                        <div>
                            <p className="font-[700] text-[10px] uppercase tracking-widest mb-1">Neural Fault</p>
                            <p className="font-[700] text-sm tracking-tight">{error}</p>
                        </div>
                    </div>
                )}

                {/* Ranked List */}
                <div className="space-y-6">
                    {results.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-[48px] p-24 text-center space-y-6 grayscale opacity-40">
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto">
                                <HiOutlineScale size={36} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest">No Matches Found</h3>
                        </div>
                    ) : (
                        results.map((candidate, idx) => (
                            <div
                                key={candidate.uuid}
                                className="group relative bg-white border border-slate-200 rounded-[32px] p-1 shadow-sm hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 overflow-hidden"
                            >
                                <div className="p-8 flex flex-col lg:flex-row gap-10 items-center">

                                    {/* Rank Marker */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="w-20 h-20 rounded-full bg-slate-900 flex flex-col items-center justify-center text-white relative z-10 border-4 border-slate-50 shadow-2xl transition-transform group-hover:scale-110 font-poppins">
                                            <span className="text-[8px] font-[700] uppercase tracking-widest text-slate-500">Rank</span>
                                            <span className="text-2xl font-[700] italic">#{idx + 1}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-110 animate-pulse"></div>
                                    </div>

                                    {/* Candidate Identity */}
                                    <div className="flex-1 min-w-0 font-poppins">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-3">
                                            <h3 className="text-2xl font-[700] text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                                                {candidate.username}
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[8px] font-[700] uppercase tracking-widest flex items-center gap-1.5 border border-slate-200">
                                                    <HiOutlineLocationMarker size={12} className="text-emerald-500" />
                                                    {candidate.location || "Remote Grid"}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 font-[700] text-[13px] leading-relaxed line-clamp-2 max-w-2xl">
                                            {candidate.bio || "No high-fidelity neural signature in database."}
                                        </p>
                                    </div>

                                    {/* Match Breakdown - AI Specific */}
                                    <div className="lg:w-[300px] bg-slate-50 border border-slate-100 rounded-3xl p-6 lg:ml-auto group-hover:bg-white group-hover:border-emerald-100 transition-all duration-500 font-poppins">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineSparkles className="text-emerald-500" size={14} />
                                                <span className="text-[9px] font-[700] uppercase tracking-[0.2em] text-slate-400">Match Integrity</span>
                                            </div>
                                            <span className="text-xl font-[700] text-emerald-500">{Math.round(candidate.score)}%</span>
                                        </div>

                                        <div className="space-y-3">
                                            {/* We can simulate a breakdown since the API returns a composite score */}
                                            <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 delay-300"
                                                    style={{ width: `${candidate.score}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex justify-between items-center text-[8px] font-[700] uppercase tracking-widest text-slate-400">
                                                <span>Vector Score</span>
                                                <span className="text-slate-900">High Reliability</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Hub */}
                                    <div className="flex-shrink-0">
                                        <button className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 active:scale-90 group/act">
                                            <HiOutlineArrowRight size={24} className="group-hover/act:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom Decorative Line */}
                                <div className="absolute bottom-0 left-0 h-1.5 bg-slate-50 group-hover:bg-emerald-500/10 transition-colors w-full"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}