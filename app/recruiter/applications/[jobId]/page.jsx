"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    HiOutlineUser,
    HiOutlineLocationMarker,
    HiOutlinePhone,
    HiOutlineGlobeAlt,
    HiOutlineChevronLeft,
    HiOutlineMail,
    HiOutlineArrowRight,
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlineLightningBolt,
    HiOutlineX
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Link from 'next/link';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function JobApplicantsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId;

    const [applicants, setApplicants] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (jobId) {
            fetchApplicants();
        }
    }, [jobId]);

    const fetchApplicants = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        try {
            // Note: The backend snippet shows request.data.get('job_id') for a GET request.
            // In many DRF setups, this translates to query params or data payload.
            // We'll try sending it in the params for compatibility.
            const response = await axios.get(`${SERVER_URL}/applications/get-applicants/`, {
                params: { job_id: jobId },
                headers: { Authorization: `Bearer ${token}` }
            });

            setApplicants(response.data.results || []);
            setCount(response.data.count || 0);
        } catch (err) {
            console.error("Failed to fetch applicants:", err);
            setError(err.response?.data?.error || "Neural link failure: Could not scan applicant grid.");
        } finally {
            setLoading(false);
        }
    };

    const filteredApplicants = applicants.filter(app =>
        app.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">Scanning Candidate Signatures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-12 pb-20">
            <div className=" px-8">

                {/* Navigation & Header */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-6 transition-all group"
                    >
                        <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Pipeline
                    </button>

                    <div className="relative bg-slate-900 rounded-[20px] p-12 overflow-hidden shadow-2xl group">
                        {/* Architectural SVG UI */}
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
                        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                            <svg viewBox="0 0 400 400" className="w-full h-full rotate-12 transition-transform duration-1000 group-hover:rotate-6">
                                <path d="M0 0 L400 0 L400 400 Z" fill="url(#emerald-grad)" fillOpacity="0.5" />
                                <defs>
                                    <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
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
                                    <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">Review Module active</p>
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">
                                    Applicant <span className="text-emerald-400 italic">Review</span>
                                </h1>
                                <p className="text-slate-400 font-medium text-sm max-w-lg">
                                    Scanning high-fidelity neural signatures for job node: <span className="text-white font-mono uppercase text-[12px]">#{jobId?.substring(0, 8)}</span>
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Signals</span>
                                    <span className="text-4xl font-black text-white leading-none">{count}</span>
                                </div>
                                <div className="w-[1px] h-12 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                                    <span className="text-[13px] font-black text-emerald-500 uppercase">Synchronized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                    <div className="relative flex-1 group">
                        <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, location or bio keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 text-[13px] font-bold transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all shadow-sm">
                            <HiOutlineFilter size={18} />
                            Sort by Rank
                        </button>
                        <Link
                            href={`/recruiter/applications/${jobId}/ranked-candidates`}
                            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group/ai"
                        >
                            <HiOutlineLightningBolt size={18} className="group-hover/ai:animate-pulse" />
                            Find AI Matches
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-red-500 mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <HiOutlineX className="shrink-0" size={24} />
                        <p className="font-bold text-sm tracking-tight">{error}</p>
                    </div>
                )}

                {/* Candidate Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredApplicants.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-[48px] p-24 text-center space-y-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-100">
                                <HiOutlineUser size={36} className="text-slate-200" />
                            </div>
                            <div className="space-y-2 text-center max-w-xs mx-auto">
                                <h3 className="text-xl font-bold text-slate-900">Zero Signals Detected</h3>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                                    No candidates have initialized application protocols for this job node yet.
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredApplicants.map((candidate) => (
                            <div
                                key={candidate.uuid}
                                className="group bg-white border border-slate-200 rounded-[32px] p-8 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative flex flex-col overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>

                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[24px] bg-slate-900 flex items-center justify-center text-emerald-400 text-3xl font-black shadow-xl group-hover:scale-105 transition-transform overflow-hidden relative">
                                            {candidate.username?.substring(0, 1).toUpperCase()}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                                                {candidate.username}
                                            </h3>
                                            <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                                    <HiOutlineLocationMarker size={14} className="text-emerald-500/50" />
                                                    {candidate.location || "Remote"}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <HiOutlinePhone size={14} />
                                                    {candidate.phone || "Encrypted"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300">
                                        <HiOutlineArrowRight size={20} />
                                    </button>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 mb-8 relative z-10 border border-slate-100 group-hover:bg-white transition-colors">
                                    <p className="text-[12px] font-black uppercase text-slate-400 tracking-widest mb-3">Identity Bio</p>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed line-clamp-3">
                                        {candidate.bio || "No neural summary provided. Profile remains in passive observation state."}
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 pt-6 flex items-center justify-between relative z-10">
                                    <div className="flex gap-4">
                                        {candidate.portfolio_url && (
                                            <a
                                                href={candidate.portfolio_url}
                                                target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
                                            >
                                                <HiOutlineGlobeAlt size={16} /> Portfolio
                                            </a>
                                        )}
                                        <button
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
                                        >
                                            <HiOutlineMail size={16} /> Signal Identity
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
