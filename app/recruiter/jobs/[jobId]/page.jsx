"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import {
    HiOutlineBriefcase,
    HiOutlineLocationMarker,
    HiOutlineCash,
    HiOutlineClock,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineLightningBolt,
    HiOutlineChevronLeft,
    HiOutlineAcademicCap,
    HiOutlineClipboardList
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters, AiOutlinePlus } from 'react-icons/ai';

export default function JobDetail() {
    const { jobId } = useParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        job_type: "",
        salary_range: "",
        experience_level: "",
        skills_required: [],
        requirements: [],
        responsibilities: [],
        nice_to_have: []
    });

    useEffect(() => {
        fetchJobDetail();
    }, [jobId]);

    const fetchJobDetail = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/jobs/job/${jobId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJob(response.data);
            setFormData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Protocol decryption failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayInput = (field, value) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value.trim()]
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleUpdate = async () => {
        setSaving(true);
        const token = localStorage.getItem("access_token");
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/jobs/job/${jobId}/update/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            fetchJobDetail();
        } catch (err) {
            setError("Update failed. Please check your parameters.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("CRITICAL: Decommissioning this posting is permanent. Proceed?")) return;
        const token = localStorage.getItem("access_token");
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/jobs/job/${jobId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push('/recruiter/jobs');
        } catch (err) {
            setError("Deletion procedure restricted.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl" />
            </div>
        );
    }

    if (error && !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white border border-slate-200 p-12 rounded-[40px] text-center max-w-lg shadow-xl">
                    <HiOutlineX className="text-red-500 text-5xl mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Access Restricted</h2>
                    <p className="text-slate-500 font-medium mb-8">{error}</p>
                    <button onClick={() => router.back()} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold">Return to Fleet</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Top Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all group"
                    >
                        <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Fleet
                    </button>

                    <div className="flex items-center gap-4">
                        {!isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm">
                                    <HiOutlinePencil />
                                    Configure Protocol
                                </button>
                                <button onClick={handleDelete} className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100">
                                    <HiOutlineTrash />
                                    Decommission
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel</button>
                                <button onClick={handleUpdate} disabled={saving} className="flex items-center gap-2 px-10 py-4 bg-emerald-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 active:scale-95">
                                    {saving ? <AiOutlineLoading3Quarters className="animate-spin" /> : <HiOutlineCheck size={16} />}
                                    Commit Parameters
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content: 70% */}
                    <div className="flex-1 space-y-6">
                        {/* Primary Identity Card */}
                        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                            <div className="mb-8">
                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-4 block">Operation Identifier</span>
                                {isEditing ? (
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="text-4xl font-black text-slate-900 w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-emerald-500/20 transition-all"
                                        placeholder="Opportunity Title"
                                    />
                                ) : (
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{job.title}</h1>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Location', name: 'location', val: job.location, icon: HiOutlineLocationMarker },
                                    { label: 'Type', name: 'job_type', val: job.job_type, icon: HiOutlineClock },
                                    { label: 'Salary', name: 'salary_range', val: job.salary_range, icon: HiOutlineCash },
                                    { label: 'Level', name: 'experience_level', val: job.experience_level, icon: HiOutlineAcademicCap }
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        {isEditing ? (
                                            <input
                                                name={item.name}
                                                value={formData[item.name]}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500/20"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <item.icon className="text-emerald-500" size={14} />
                                                <span className="text-sm font-black text-slate-700 truncate">{item.val || "TBD"}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                Detailed Protocol
                            </h2>
                            {isEditing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="8"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500/20 transition-all resize-none"
                                />
                            ) : (
                                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap italic opacity-80">
                                    {job.description || "No parameters shared for this posting."}
                                </p>
                            )}
                        </div>

                        {/* Requirements Card */}
                        <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                Job Requirements
                            </h2>
                            <div className="space-y-3">
                                {(isEditing ? formData.requirements : job.requirements)?.map((req, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <HiOutlineCheck className="text-emerald-500" />
                                            <span className="text-sm font-bold text-slate-700">{req}</span>
                                        </div>
                                        {isEditing && (
                                            <button onClick={() => removeArrayItem('requirements', idx)} className="text-red-400 hover:text-red-600">
                                                <HiOutlineX />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <div className="relative mt-4">
                                        <input
                                            placeholder="Add requirement and press Enter..."
                                            className="w-full bg-slate-50 border border-emerald-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white transition-all shadow-inner"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleArrayInput('requirements', e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                        />
                                        <AiOutlinePlus className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: 30% */}
                    <div className="lg:w-[380px] space-y-6">
                        {/* Dynamic List Sections */}
                        {[
                            { label: 'Neural Stack', field: 'skills_required', icon: HiOutlineLightningBolt, color: 'emerald' },
                            { label: 'Responsibilities', field: 'responsibilities', icon: HiOutlineClipboardList, color: 'slate' },
                            { label: 'Nice to Have', field: 'nice_to_have', icon: AiOutlinePlus, color: 'emerald' }
                        ].map((section, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                                        <section.icon className="text-emerald-500" />
                                        {section.label}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(isEditing ? formData[section.field] : job[section.field])?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-700 group">
                                            <span>{item}</span>
                                            {isEditing && (
                                                <button onClick={() => removeArrayItem(section.field, idx)} className="text-slate-300 hover:text-red-500">
                                                    <HiOutlineX size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {isEditing && (
                                    <div className="mt-4">
                                        <input
                                            placeholder={`Add ${section.label.split(' ')[0]}...`}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleArrayInput(section.field, e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}