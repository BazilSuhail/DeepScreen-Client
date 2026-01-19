"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
    HiOutlineBriefcase,
    HiOutlineLocationMarker,
    HiOutlineSearch,
    HiOutlinePlus,
    HiOutlineClipboardList,
    HiOutlineUsers,
    HiOutlineClock,
    HiOutlineX
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function ApplicationsPortal() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        try {
            const response = await axios.get(`${SERVER_URL}/jobs/all/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to retrieve your application protocols.");
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Syncing Application Pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-poppins pt-12 pb-20">
            <div className="mx-auto px-6">

                {/* Hero Section - Application Focus */}
                <div className="flex flex-col lg:flex-row gap-4 mb-12">
                    <div className="lg:w-[70%] relative overflow-hidden bg-slate-900 rounded-[24px] p-12 text-white min-h-[220px] flex flex-col justify-center group">
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
                            <svg viewBox="0 0 400 400" className="w-full h-full text-emerald-500">
                                <path d="M0 0 L400 0 L400 400 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-8 h-[2px] bg-emerald-500"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Response Protocol</span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter mb-4">
                                Application <span className="text-emerald-400 italic">Pipeline</span>
                            </h1>
                            <p className="text-slate-400 text-md font-medium max-w-md leading-relaxed">
                                Monitor and process incoming talent applications across your neural active grid. Select a protocol to review candidates.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-[30%] bg-white border border-slate-200 rounded-[24px] p-10 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
                                <HiOutlineUsers size={20} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">Live Grid</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-4xl font-black text-slate-900 mb-1">{jobs.length}</p>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Active Application Gateways</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="relative flex-1 group">
                        <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Filter applications by job title or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 text-[13px] font-bold transition-all shadow-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 p-8 rounded-[32px] flex items-center justify-between mb-10 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <HiOutlineX size={24} />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase tracking-wider leading-none mb-1">Grid Sync Failure</p>
                                <p className="text-xs font-bold opacity-70">{error}</p>
                            </div>
                        </div>
                        <button onClick={fetchJobs} className="bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10 active:scale-95 transition-all">Retry Transmission</button>
                    </div>
                )}

                {/* Application Gateways (Job Cards) */}
                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-[48px] p-24 text-center space-y-8">
                            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-100">
                                <HiOutlineClipboardList size={40} className="text-slate-300" />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">No Incoming Vectors</h2>
                                <p className="text-slate-400 font-medium">Wait for candidates to initialize their neural applications or share your job postings.</p>
                            </div>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.uuid} className="group bg-white border border-slate-200 rounded-[32px] p-8 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-emerald-500 transition-colors font-poppins"></div>

                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Col 1: Job Identity */}
                                    <div className="lg:w-[40%] min-w-0">
                                        <div className="flex items-center gap-5 mb-4">
                                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center text-emerald-400 font-black text-[12px] shadow-lg group-hover:rotate-3 transition-transform">
                                                APP
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors mb-1 truncate">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Gateway Active</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{job.uuid.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Col 2: Context */}
                                    <div className="lg:w-[35%] flex flex-col justify-center lg:border-l border-slate-50 lg:pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Handshake Node</span>
                                                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                                                    <HiOutlineLocationMarker className="text-emerald-500/50" />
                                                    {job.location || "Remote Grid"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Col 3: Review Portal */}
                                    <div className="lg:w-[25%] flex items-center justify-between lg:justify-end gap-6 lg:border-l border-slate-50 lg:pl-10">
                                        <div className="flex flex-col items-end gap-1 px-6">
                                            <span className="text-[24px] font-black text-slate-900 leading-none">0</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                                        </div>

                                        <Link
                                            href={`/recruiter/applications/${job.uuid}`}
                                            className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            Review Hub
                                        </Link>
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