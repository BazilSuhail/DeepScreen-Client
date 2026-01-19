"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    HiOutlineLocationMarker,
    HiOutlineCurrencyDollar,
    HiOutlineBriefcase,
    HiOutlineChevronLeft,
    HiOutlineShare,
    HiOutlineHeart,
    HiOutlineCheckCircle,
    HiOutlineChip,
    HiOutlineLightningBolt,
    HiOutlineArrowRight,
    HiOutlineOfficeBuilding
} from 'react-icons/hi';
import Link from 'next/link';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const response = await axios.get(`${SERVER_URL}/jobs/job-detail/${params.id}/`);
                setJob(response.data);
            } catch (error) {
                console.error("Failed to fetch job details:", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchJobDetail();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 px-6">
                <div className="max-w-5xl mx-auto animate-pulse">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-8"></div>
                    <div className="bg-white rounded-[32px] p-12 h-96 border border-slate-200"></div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins">
                <h1 className="text-2xl font-black text-slate-900 mb-4">Job Not Found</h1>
                <Link href="/jobs" className="text-emerald-500 font-bold hover:underline flex items-center gap-2">
                    <HiOutlineChevronLeft /> Back to Jobs
                </Link>
            </div>
        );
    }

    const handleApply = () => {
        console.log("Commencing application protocol for job:", job.uuid);
        router.push(`/jobs/${params.id}/application`);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-colors mb-8 group"
                >
                    <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to listings
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 border border-emerald-100">
                                    <HiOutlineLightningBolt size={12} />
                                    Actively Hiring
                                </span >
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400 text-xs font-bold">Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                            </div>

                            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                                {job.title}
                            </h1>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <HiOutlineOfficeBuilding className="text-emerald-500" />
                                    <span className="text-sm font-bold text-slate-700">DeepScreen Intelligence</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <HiOutlineLocationMarker className="text-emerald-500" />
                                    <span className="text-sm font-bold text-slate-700">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <HiOutlineBriefcase className="text-emerald-500" />
                                    <span className="text-sm font-bold text-slate-700">{job.job_type}</span>
                                </div>
                                {job.salary_range && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                        <HiOutlineCurrencyDollar className="text-emerald-500" />
                                        <span className="text-sm font-bold text-slate-700">{job.salary_range}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                About the Role
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {job.description || "No description provided."}
                            </p>
                        </div>

                        {/* Requirements Card */}
                        {job.requirements?.length > 0 && (
                            <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    Job Requirements
                                </h2>
                                <div className="grid gap-3">
                                    {job.requirements.map((req, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:border-emerald-200 transition-all">
                                            <HiOutlineCheckCircle className="text-emerald-500 mt-1 shrink-0" size={20} />
                                            <p className="text-slate-600 font-medium leading-relaxed">{req}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nice to Have Card */}
                        {job.nice_to_have?.length > 0 && (
                            <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    Nice to Have
                                </h2>
                                <div className="grid gap-3">
                                    {job.nice_to_have.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 group hover:border-emerald-300 transition-all">
                                            <HiOutlineLightningBolt className="text-emerald-500 mt-1 shrink-0" size={20} />
                                            <p className="text-slate-600 font-medium">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Responsibilities Card */}
                        {job.responsibilities?.length > 0 && (
                            <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    Key Responsibilities
                                </h2>
                                <div className="grid gap-3">
                                    {job.responsibilities.map((task, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:border-emerald-200 transition-all">
                                            <HiOutlineCheckCircle className="text-emerald-500 mt-1 shrink-0" size={20} />
                                            <p className="text-slate-600 font-medium">{task}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills Card */}
                        {job.skills_required?.length > 0 && (
                            <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    Technical Stack
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills_required.map((skill, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all">
                                            <HiOutlineChip className="text-emerald-500" />
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="lg:w-[350px] shrink-0">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-900/20">
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">Application</h3>
                                <button
                                    onClick={handleApply}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 group"
                                >
                                    Apply Now
                                    <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="mt-8 flex gap-3">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all border border-white/10">
                                        <HiOutlineShare /> Share
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all border border-white/10">
                                        <HiOutlineHeart /> Save
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-widest">
                                    Response time: <span className="text-emerald-400">2 days</span>
                                </p>
                            </div>

                            <div className="bg-white rounded-[32px] border border-slate-200 p-8">
                                <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">About Company</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 font-black">
                                        DS
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">DeepScreen Inc.</p>
                                        <p className="text-xs text-slate-400 font-bold">50-200 employees</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                    The world's first neural screening platform for specialized engineering roles.
                                </p>
                                <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-colors border border-slate-100">
                                    View Organization Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}