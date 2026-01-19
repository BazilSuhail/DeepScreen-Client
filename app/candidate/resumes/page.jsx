"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HiOutlineDocumentText,
    HiOutlineCloudUpload,
    HiOutlineCalendar,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineCheckCircle,
    HiOutlineX,
    HiOutlineExternalLink
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { HiGlobeAlt } from 'react-icons/hi2';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export default function ResumeManagerPage() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload Form State
    const [uploadTitle, setUploadTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingProgress, setUploadingProgress] = useState(0);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        try {
            const response = await axios.get(`${SERVER_URL}/resumes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch resumes:", err);
            setError("Connectivity error with neural database.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile || !uploadTitle) return;

        setIsUploading(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        const formData = new FormData();
        formData.append("pdf_file", selectedFile);
        formData.append("title", uploadTitle);

        try {
            await axios.post(`${SERVER_URL}/resumes/upload/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadingProgress(percentCompleted);
                }
            });

            await fetchResumes();
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadTitle("");
            setUploadingProgress(0);
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.response?.data?.error || "Neural uplink failed. File format mismatch.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (uuid) => {
        if (!confirm("Are you sure you want to terminate this neural record?")) return;

        const token = localStorage.getItem("access_token");
        try {
            await axios.delete(`${SERVER_URL}/resumes/${uuid}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(prev => prev.filter(r => r.uuid !== uuid));
        } catch (err) {
            console.error("Delete failed:", err);
            setError("Failed to delete record.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-4xl mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing Database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-poppins selection:bg-emerald-100 selection:text-emerald-700 pt-12 pb-20">
            <div className="mx-auto px-8">

                {/* Enhanced Header Section with SVG UI */}
                <div className="relative mb-16 bg-white border border-slate-200 rounded-[40px] p-10 lg:p-14 overflow-hidden shadow-sm group">
                    {/* Architectural SVG Backgrounds */}
                    <div className="absolute inset-0 bg-grid-slate-400/[0.02] bg-[size:30px_30px]"></div>
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

                    {/* Floating Technical Shapes */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-10 right-10 flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-emerald-500/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }}></div>
                        ))}
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <HiGlobeAlt className="text-emerald-500 animate-spin-slow" size={16} />
                                </div>
                                <p className="text-emerald-600 font-extrabold uppercase tracking-[0.4em] text-[10px]">Neural Inventory Host v4.2</p>
                            </div>
                            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-3">
                                Record <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 italic">Inventory</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-[15px] max-w-lg leading-relaxed">
                                Synchronize your professional vector signatures with the active recruitment grid. Full encryption enabled.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/10 hover:shadow-emerald-500/20 active:scale-95 group/btn"
                        >
                            <HiOutlinePlus size={20} className="group-hover/btn:rotate-90 transition-transform" />
                            Integrate New Record
                        </button>
                    </div>

                    {/* Technical HUD Overlay (Corner) */}
                    <div className="absolute bottom-0 right-10 translate-y-1/2 opacity-20 pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                            <circle cx="100" cy="100" r="99.5" stroke="#10b981" />
                            <path d="M100 0V200M0 100H200" stroke="#10b981" />
                        </svg>
                    </div>
                </div>

                {error && (
                    <div className="bg-white border border-red-100 p-5 rounded-2xl text-red-500 mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm">
                        <HiOutlineX className="shrink-0" size={20} />
                        <p className="font-bold text-xs tracking-tight">{error}</p>
                    </div>
                )}

                {/* Resumes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-[32px] p-20 text-center space-y-6 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                                <HiOutlineDocumentText size={36} className="text-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">No Records Detected</h3>
                                <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto leading-relaxed">
                                    Your portfolio is empty. Upload a resume to begin your professional journey.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-700"
                            >
                                <HiOutlinePlus /> Integrate Now
                            </button>
                        </div>
                    ) : (
                        resumes.map((resume) => (
                            <div
                                key={resume.uuid}
                                className="group bg-white border border-slate-200 rounded-[28px] p-7 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 relative flex flex-col justify-between overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                                            <HiOutlineDocumentText size={22} />
                                        </div>
                                        <div className="flex gap-1.5">
                                            {resume.file_path && (
                                                <a
                                                    href={resume.file_path}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100 transition-all"
                                                >
                                                    <HiOutlineExternalLink size={16} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(resume.uuid)}
                                                className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            >
                                                <HiOutlineTrash size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 group-hover:text-emerald-600 transition-colors">
                                        {resume.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${resume.is_custom_upload
                                            ? 'bg-slate-50 text-slate-600 border-slate-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            {resume.is_custom_upload ? "Uploaded" : "Generated"}
                                        </span>
                                        {resume.qdrant_vector_ids?.length > 0 && (
                                            <span className="bg-slate-900 text-[8px] text-white px-2.5 py-1 rounded-md font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                                <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                                                Sync
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-50 pt-5 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                                        <HiOutlineCalendar size={12} className="text-emerald-500/50" />
                                        {new Date(resume.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-100 group-hover:bg-emerald-500 transition-colors"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">

                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Record Integration</h2>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">System Protocol Handshake</p>
                                    </div>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all border border-slate-100"
                                    >
                                        <HiOutlineX size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleUploadSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Profile Identifier</label>
                                        <input
                                            type="text"
                                            required
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            placeholder="e.g. Senior Software Engineer"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Binary Payload (PDF)</label>
                                        <div className={`
                                            relative border border-dashed rounded-[24px] p-10 transition-all duration-300
                                            ${selectedFile ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/5'}
                                        `}>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <div className="text-center relative z-10">
                                                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${selectedFile ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                                                    {selectedFile ? <HiOutlineCheckCircle size={28} /> : <HiOutlineCloudUpload size={28} />}
                                                </div>
                                                <p className="text-slate-900 font-bold text-sm mb-1">
                                                    {selectedFile ? selectedFile.name : "Select Document"}
                                                </p>
                                                <p className="text-slate-400 text-[10px] font-medium">Portable Document Format (PDF) Max 5MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUploading || !selectedFile}
                                        className="w-full py-4 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10 hover:shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center gap-2">
                                                <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                                                <span>Transmitting {uploadingProgress}%</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span>Integrate Record</span>
                                                <HiOutlineCheckCircle size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}