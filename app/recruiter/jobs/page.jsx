"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
    HiOutlineBriefcase,
    HiOutlineLocationMarker,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCash,
    HiOutlineClock,
    HiOutlineChevronRight,
    HiOutlineX
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function JobsList() {
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/jobs/all/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to retrieve your talent postings.");
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
                    <p className="text-slate-500 font-medium animate-pulse">Syncing Global Talent Pool...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-poppins pt-12 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Hero Section - Bento Style */}
                <div className="flex flex-col lg:flex-row gap-4 mb-12">
                    <div className="lg:w-[70%] relative overflow-hidden bg-slate-900 rounded-[20px] p-12 text-white min-h-[200px] flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                            <svg viewBox="0 0 400 400" className="w-full h-full rotate-12">
                                <path d="M0 0 L400 0 L400 400 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black tracking-tight mb-4">
                                Recruitment <span className="text-emerald-400 italic">Fleet</span>
                            </h1>
                            <p className="text-slate-400 text-md font-medium max-w-md">
                                Manage your organization's active opportunities and captured talent across the globe.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-[30%] bg-white border border-slate-200 rounded-[20px] p-10 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
                                <HiOutlineBriefcase size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">Live Status</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-black text-slate-900 mb-1">{jobs.length}</p>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Active Postings</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="relative flex-1 group">
                        <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search protocol title or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 text-sm font-bold transition-all shadow-sm"
                        />
                    </div>

                    <Link
                        href="/recruiter/jobs/post-job"
                        className="bg-emerald-600 text-white px-6 py-4 rounded-[16px] font-black text-xs uppercase shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0"
                    >
                        <HiOutlinePlus size={15} />
                        <span>Post Job</span>
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 p-8 rounded-[32px] flex items-center justify-between mb-10 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <HiOutlineX size={24} />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase tracking-wider leading-none mb-1">Link Failure</p>
                                <p className="text-xs font-bold opacity-70">{error}</p>
                            </div>
                        </div>
                        <button onClick={fetchJobs} className="bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10 active:scale-95 transition-all">Retry Sync</button>
                    </div>
                )}

                {/* Job Cards */}
                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-[48px] p-24 text-center space-y-8">
                            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-100">
                                <HiOutlineBriefcase size={40} className="text-slate-300" />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Transmissions</h2>
                                <p className="text-slate-400 font-medium">Initialize your first recruitment protocol to capture top-tier global talent.</p>
                            </div>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.uuid} className="group bg-white border border-slate-200 rounded-[32px] p-8 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-emerald-500 transition-colors"></div>

                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Col 1: Identity */}
                                    <div className="lg:w-[40%] min-w-0"> {/* added min-w-0 to allow truncation */}
                                        <div className="flex items-center gap-5 mb-4">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-lg group-hover:rotate-3 transition-transform">
                                                JOB
                                            </div>
                                            <div className="min-w-0"> {/* Wrapper to ensure truncate works */}
                                                <h3 className="text-2xl font-semibold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors mb-1 truncate">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">{job.job_type || "Protocol"}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-[10px] font-medium text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Col 2: Details */}
                                    <div className="lg:w-[35%] flex flex-col justify-center lg:border-l border-slate-100 lg:pl-8 py-4 lg:py-0">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                                    <HiOutlineLocationMarker size={18} className="text-slate-400 group-hover:text-emerald-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Location</span>
                                                    <span className="text-sm font-semibold text-slate-700">{job.location || "Remote"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                                    <HiOutlineCash size={18} className="text-slate-400 group-hover:text-emerald-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Comp</span>
                                                    <span className="text-sm font-semibold text-slate-700">{job.salary_range || "Market"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Col 3: Management */}
                                    <div className="lg:w-[25%] flex items-center justify-between lg:justify-end gap-4 lg:border-l border-slate-100 lg:pl-8">
                                        <div className="flex flex-col items-end gap-1 px-4 border-r border-slate-50">
                                            <span className="text-[18px] font-semibold text-slate-900 leading-none">0</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Applicants</span>
                                        </div>

                                        <Link
                                            href={`/recruiter/jobs/${job.uuid}`}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-95"
                                        >
                                            Manage
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