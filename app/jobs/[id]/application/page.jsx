"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    HiOutlineDocumentText,
    HiOutlineCloudUpload,
    HiOutlineCalendar,
    HiOutlineChevronRight,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineX
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function ApplicationPage() {
    const params = useParams(); // params.id is the jobId
    const router = useRouter();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResume, setSelectedResume] = useState(null);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        const fetchResumes = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            try {
                const response = await axios.get(`${SERVER_URL}/resumes/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResumes(response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch resumes:", err);
                setError("Unable to retrieve your neural resumes. Check protocol alignment.");
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, [router]);

    const handleApply = async () => {
        if (!selectedResume) return;

        setApplying(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        try {
            const response = await axios.post(`${SERVER_URL}/applications/apply/`, {
                job_id: params.id,
                resume_id: selectedResume.uuid
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Application Success:", response.data);
            setApplied(true);
            setTimeout(() => {
                router.push('/jobs');
            }, 3000);
        } catch (err) {
            console.error("Application failed:", err);
            setError(err.response?.data?.error || "Failed to submit data packet. Neural mismatch detected.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl mx-auto mb-4" />
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Syncing Resumes...</p>
                </div>
            </div>
        );
    }

    if (applied) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins p-6">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-[40px] p-12 text-center shadow-2xl animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
                        <HiOutlineCheckCircle size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Transmission Complete</h1>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Your application data has been successfully integrated into the recruiter's fleet. Redirecting to headquarters...
                    </p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-shimmer" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Area */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-4 transition-all group"
                    >
                        <HiOutlineArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Job Detail
                    </button>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
                        Apply for <span className="text-emerald-500 italic">Position</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Neural Application Protocol v2.0</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Resume Selection (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] text-red-500 mb-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <HiOutlineX className="text-red-500" />
                                </div>
                                <p className="font-bold text-sm tracking-tight">{error}</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {resumes.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-[40px] p-24 text-center space-y-6 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto border border-slate-100">
                                        <HiOutlineDocumentText size={40} className="text-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900">No Resumes Found</h3>
                                        <p className="text-slate-400 text-sm font-medium">Please build or upload a resume to commence application procedures.</p>
                                    </div>
                                </div>
                            ) : (
                                resumes.map((resume) => (
                                    <div
                                        key={resume.uuid}
                                        onClick={() => setSelectedResume(resume)}
                                        className={`group cursor-pointer bg-white border rounded-[32px] p-8 transition-all duration-500 flex items-center justify-between ${selectedResume?.uuid === resume.uuid
                                                ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                                                : 'border-slate-200 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-6 ${selectedResume?.uuid === resume.uuid
                                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                    : 'bg-slate-900 text-emerald-400'
                                                }`}>
                                                <HiOutlineDocumentText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                                                    {resume.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                        <HiOutlineCloudUpload size={12} />
                                                        {resume.is_custom_upload ? "Uploaded" : "System"}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <HiOutlineCalendar size={12} className="text-emerald-500/50" />
                                                        {new Date(resume.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {selectedResume?.uuid === resume.uuid ? (
                                                <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 animate-in zoom-in duration-300">
                                                    <HiOutlineCheckCircle size={20} />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                                                    <HiOutlineChevronRight size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Preview & Apply (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32">
                            {selectedResume ? (
                                <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group animate-in slide-in-from-right-8 duration-700">
                                    {/* Decorative Background Shapes */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:24px_24px]"></div>

                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                                Selected Protocol
                                            </h2>
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Active Session
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Resume Identity</p>
                                                <p className="text-3xl font-black text-white leading-tight">
                                                    {selectedResume.title}
                                                </p>
                                            </div>

                                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Neural ID (UUID)</p>
                                                    <p className="text-[11px] font-black font-mono text-emerald-400 truncate">
                                                        {selectedResume.uuid}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Target Job</p>
                                                        <p className="text-[11px] font-bold text-slate-300 truncate">#{params.id.substring(0, 8)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Handshake Status</p>
                                                        <p className="text-[11px] font-bold text-emerald-500">READY</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 group/btn"
                                        >
                                            {applying ? (
                                                <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <span>Release Application</span>
                                                    <HiOutlineCheckCircle size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                </>
                                            )}
                                        </button>

                                        <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                            By deploying, you agree to share your neural vector IDs with the host organization.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-12 text-center animate-pulse">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <HiOutlineDocumentText size={32} className="text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
                                        Select a resume to view protocol parameters
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}