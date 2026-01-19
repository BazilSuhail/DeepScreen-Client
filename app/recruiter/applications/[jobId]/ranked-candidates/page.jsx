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
    HiOutlineArrowRight,
    HiOutlineChip,
    HiOutlineSearchCircle
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
    const [selectedCandidate, setSelectedCandidate] = useState(null);

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
            console.log(response.data.results);
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
            <div className="min-h-screen flex items-center justify-center bg-white font-poppins relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 bg-[size:40px_40px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>

                <div className="text-center relative z-10 transition-all duration-1000">
                    <div className="mb-6 relative inline-flex items-center justify-center">
                        <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-4xl" />
                        <HiOutlineChip className="absolute text-emerald-600 animate-pulse" size={18} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-slate-900 text-sm font-[700] uppercase tracking-[0.3em] font-poppins">Initializing Matching Grid</h2>
                        <p className="text-slate-400 font-[700] uppercase tracking-[0.2em] text-[8px] max-w-xs mx-auto leading-relaxed font-poppins">
                            Vectorizing job nodes & scanning candidate signatures
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-poppins pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-8">

                {/* Header Section */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-[700] text-[9px] uppercase tracking-widest mb-6 transition-all group font-poppins"
                    >
                        <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Review
                    </button>

                    <div className="relative bg-slate-900 rounded-[20px] p-12 overflow-hidden shadow-2xl group">
                        {/* Architectural SVG UI */}
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
                        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                            <svg viewBox="0 0 400 400" className="w-full h-full rotate-12 transition-transform duration-1000 group-hover:rotate-6">
                                <path d="M0 0 L400 0 L400 400 Z" fill="url(#emerald-grad-rc)" fillOpacity="0.5" />
                                <defs>
                                    <linearGradient id="emerald-grad-rc" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-[2px] bg-emerald-500"></span>
                                    <p className="text-emerald-400 font-[700] uppercase tracking-[0.4em] text-[9px] font-poppins">Neural Leaderboard Active</p>
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3 font-poppins">
                                    AI <span className="text-emerald-500 italic">Leaderboard</span>
                                </h1>
                                <p className="text-slate-400 font-[700] text-[13px] max-w-xl font-poppins">
                                    Top ranked candidates for <span className="text-white">{jobData.title}</span> identified via multi-dimensional vector analysis.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 flex items-center gap-8">
                                <div className="flex flex-col text-center">
                                    <span className="text-[9px] font-[700] text-emerald-400 uppercase tracking-widest mb-1 font-poppins">Grid Match</span>
                                    <span className="text-4xl font-black text-white leading-none font-poppins">{jobData.total_matches}</span>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10"></div>
                                <div className="flex flex-col text-center">
                                    <span className="text-[9px] font-[700] text-slate-500 uppercase tracking-widest mb-1 font-poppins">Status</span>
                                    <span className="text-[11px] font-[700] text-emerald-500 uppercase font-poppins">Synchronized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-500 mb-8 flex items-center gap-3 font-poppins animate-in fade-in slide-in-from-top-2">
                        <HiOutlineX className="shrink-0" size={18} />
                        <p className="font-[700] text-[11px] tracking-tight">{error}</p>
                    </div>
                )}

                {/* Minimalistic Table View */}
                <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-sm">
                    <div className="grid grid-cols-12 bg-slate-50/50 border-b border-slate-100 px-8 py-5 text-[10px] font-[700] uppercase tracking-widest text-slate-400">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-6">Candidate Identity</div>
                        <div className="col-span-2 text-center">Score</div>
                        <div className="col-span-2 text-center">Location</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {results.length === 0 ? (
                            <div className="py-20 text-center grayscale opacity-30">
                                <HiOutlineScale size={32} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-[9px] font-[700] uppercase tracking-widest text-slate-500">No synchronized matches found</p>
                            </div>
                        ) : (
                            results.map((candidate, idx) => (
                                <div
                                    key={candidate.uuid}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className="grid grid-cols-12 items-center px-8 py-6 hover:bg-emerald-50/30 transition-all duration-300 group font-poppins cursor-pointer"
                                >
                                    {/* Rank */}
                                    <div className="col-span-1">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white text-[14px] font-[700] italic group-hover:bg-emerald-500 transition-colors shadow-sm">
                                            #{idx + 1}
                                        </span>
                                    </div>

                                    {/* Identity */}
                                    <div className="col-span-6 flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-[700] text-[15px] border border-slate-200 overflow-hidden shadow-sm shrink-0">
                                            {candidate.username?.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[16px] font-[700] text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                                                {candidate.username}
                                            </h3>
                                            <p className="text-[12px] font-[700] text-slate-400 truncate max-w-md">
                                                {candidate.bio || "Neural profile signature incomplete"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="col-span-2 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                                            <HiOutlineSparkles size={16} />
                                            <span className="text-[16px] font-[700]">{(candidate.score * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-1000 delay-300"
                                                style={{ width: `${candidate.score}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="col-span-2 text-center">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-[700] text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <HiOutlineLocationMarker size={14} className="text-emerald-500" />
                                            {candidate.location?.split(',')[0] || "Remote"}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-1 text-right">
                                        <button className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-md active:scale-90 group/btn">
                                            <HiOutlineArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )
                            ))}
                    </div>
                </div>

                {/* AI Footer Badge */}
                <div className="mt-8 flex items-center justify-center gap-3 px-6 py-3 border border-slate-100 rounded-full bg-slate-50/50 w-fit mx-auto animate-pulse">
                    <HiOutlineChip className="text-emerald-500" size={14} />
                    <span className="text-[8px] font-[700] uppercase tracking-[0.3em] text-slate-400">Neural Engine processing high-fidelity vectors</span>
                </div>
            </div>

            {/* Neural Analysis Modal */}
            {selectedCandidate && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-6 animate-in fade-in duration-300"
                    onClick={() => setSelectedCandidate(null)}
                >
                    <div
                        className="bg-white rounded-[20px] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 pb-6 relative">
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition-all"
                            >
                                <HiOutlineX size={20} />
                            </button>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center text-2xl font-black shadow-xl">
                                    {selectedCandidate.username?.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">{selectedCandidate.username}</h2>
                                    <p className="text-[10px] font-[700] text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <HiOutlineLightningBolt size={14} /> Multi-Dimensional Grid
                                    </p>
                                </div>
                            </div>

                            <div className="bg-emerald-500 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-emerald-500/20">
                                <div>
                                    <p className="text-[10px] font-[700] uppercase tracking-[0.2em] opacity-80 mb-1">Composite Match Integrity</p>
                                    <p className="text-4xl font-black leading-none">{(selectedCandidate.score * 100).toFixed(1)}%</p>
                                </div>
                                <HiOutlineSparkles size={48} className="opacity-50 animate-pulse" />
                            </div>
                        </div>

                        {/* Modal Body - Breakdown */}
                        <div className="p-10 pt-4 space-y-8">
                            <div className="grid gap-6">
                                {[
                                    { label: "Technical Skills", key: "skills_score", color: "bg-emerald-500" },
                                    { label: "Portfolio Projects", key: "projects_score", color: "bg-teal-500" },
                                    { label: "Work Experience", key: "workexp_score", color: "bg-indigo-500" },
                                    { label: "Neural Summary", key: "summary_score", color: "bg-blue-500" }
                                ].map((stat) => (
                                    <div key={stat.key} className="space-y-2.5">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[11px] font-[700] text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                            <span className="text-[14px] font-[700] text-slate-900">{(selectedCandidate[stat.key] * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${stat.color} transition-all duration-1000 delay-300`}
                                                style={{ width: `${selectedCandidate[stat.key] * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <HiOutlineChip size={40} />
                                    <p className="text-[11px] font-[700] leading-relaxed">
                                        Vector decomposition analysis complete. Signature verified against job node collection requirements.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}