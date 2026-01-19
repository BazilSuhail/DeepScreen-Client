"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    HiOutlineBriefcase,
    HiOutlineLocationMarker,
    HiOutlineCash,
    HiOutlineClock,
    HiOutlineAcademicCap,
    HiOutlineLightningBolt,
    HiOutlineClipboardList,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlinePlus,
    HiOutlineChevronLeft,
    HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaPlusSquare } from 'react-icons/fa';

export default function PostJobPage() {
    const router = useRouter();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        job_type: "Full-time",
        salary_range: "",
        experience_level: "Entry Level",
        skills_required: [],
        requirements: [],
        responsibilities: [],
        nice_to_have: []
    });

    const [tempInputs, setTempInputs] = useState({
        skill: "",
        requirement: "",
        responsibility: "",
        niceToHave: ""
    });

    useEffect(() => {
        fetchOrgAndCheckAuth();
    }, []);

    const fetchOrgAndCheckAuth = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        try {
            const orgRes = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/org/organization/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrg(orgRes.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError("Organization Required: You must link an organization protocol before deploying job postings.");
            } else {
                setError("Network Link Failure: Unable to sync with organization registry.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addTag = (field, key) => {
        const val = tempInputs[key].trim();
        if (val && !formData[field].includes(val)) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], val]
            }));
            setTempInputs(prev => ({ ...prev, [key]: "" }));
        }
    };

    const removeTag = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(i => i !== item)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!org?.uuid) return;

        setCreating(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        try {
            const payload = {
                ...formData,
                org_uuid: org.uuid
            };

            await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/jobs/create/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            router.push('/recruiter/jobs');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Deployment failed. Check protocol parameters.");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Syncing Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-12 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Page Navigation & Title */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-[700] text-[10px] uppercase tracking-widest transition-all group"
                        >
                            <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to Fleet
                        </button>
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                                Initialize <span className="text-emerald-500 italic">Posting</span>
                            </h1>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Recruitment Initialization Protocol</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white border border-slate-200 px-8 py-4 rounded-[24px] shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                            <HiOutlineOfficeBuilding size={24} />
                        </div>
                        <div>
                            <p className="text-[9px] font-[700] text-slate-400 uppercase tracking-widest leading-none mb-1">Signed Entity</p>
                            <p className="text-md font-[700] text-slate-900 leading-none">{org?.name || "Neural Unverified"}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] flex items-center justify-between text-red-500 mb-10 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <HiOutlineX size={24} />
                            </div>
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                        {error.includes("Organization Required") && (
                            <button onClick={() => router.push('/recruiter/org')} className="bg-red-500 text-white px-8 py-3 rounded-xl text-xs font-[700] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                Registry Setup
                            </button>
                        )}
                    </div>
                )}

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Core Identity */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-[40px] p-10 space-y-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Protocol Title</label>
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-3 text-lg font-[700] text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner"
                                    placeholder="e.g. Lead Product Architect"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Hub</label>
                                    <div className="relative">
                                        <HiOutlineLocationMarker className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-[700] outline-none focus:bg-white transition-all shadow-sm"
                                            placeholder="Remote / City"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compensation Vector</label>
                                    <div className="relative">
                                        <HiOutlineCash className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        <input
                                            name="salary_range"
                                            value={formData.salary_range}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-[700] outline-none focus:bg-white transition-all shadow-sm"
                                            placeholder="e.g. $120k - $160k"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Type</label>
                                    <div className="relative">
                                        <HiOutlineClock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        <select
                                            name="job_type"
                                            value={formData.job_type}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-[700] outline-none focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option>Full-time</option>
                                            <option>Contract</option>
                                            <option>Part-time</option>
                                            <option>Freelance</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural Seniority</label>
                                    <div className="relative">
                                        <HiOutlineAcademicCap className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        <select
                                            name="experience_level"
                                            value={formData.experience_level}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-[700] outline-none focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option>Entry Level</option>
                                            <option>Mid Level</option>
                                            <option>Senior Level</option>
                                            <option>Lead / Architect</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Mission</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="10"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-6 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:border-emerald-500 transition-all resize-none shadow-sm"
                                    placeholder="Describe the challenges and technical parameters of this opportunity..."
                                />
                            </div>
                        </div>

                        {/* Requirements Sector */}
                        <div className="bg-white border border-slate-200 rounded-[40px] p-10 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                                    <HiOutlineBriefcase className="text-emerald-500" />
                                    Job Requirements
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {formData.requirements.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <HiOutlineCheck className="text-emerald-500" />
                                            <span className="text-sm font-bold text-slate-700">{item}</span>
                                        </div>
                                        <button type="button" onClick={() => removeTag('requirements', item)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <HiOutlineX size={16} />
                                        </button>
                                    </div>
                                ))}
                                <div className="relative mt-4">
                                    <input
                                        value={tempInputs.requirement}
                                        onChange={(e) => setTempInputs(prev => ({ ...prev, requirement: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('requirements', 'requirement'))}
                                        className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-[20px] px-8 py-4 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 focus:border-solid transition-all shadow-inner"
                                        placeholder="Add mandatory qualification..."
                                    />
                                    <button type="button" onClick={() => addTag('requirements', 'requirement')} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-95">
                                        <HiOutlinePlus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Parameters List */}
                    <div className="lg:w-[420px] space-y-6">

                        {[
                            { label: 'Neural Stack', field: 'skills_required', key: 'skill', icon: HiOutlineLightningBolt },
                            { label: 'Responsibilities', field: 'responsibilities', key: 'responsibility', icon: HiOutlineClipboardList },
                            { label: 'Optimal Modifiers', field: 'nice_to_have', key: 'niceToHave', icon: FaPlusSquare }
                        ].map((sec) => (
                            <div key={sec.field} className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-6 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                                    <sec.icon className="text-emerald-500" size={16} />
                                    {sec.label}
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {formData[sec.field].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-700 group">
                                            <span>{item}</span>
                                            <button type="button" onClick={() => removeTag(sec.field, item)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <HiOutlineX size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData[sec.field].length === 0 && (
                                        <p className="text-[10px] font-medium text-slate-400 italic">No parameters added yet.</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <input
                                        value={tempInputs[sec.key]}
                                        onChange={(e) => setTempInputs(prev => ({ ...prev, [sec.key]: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(sec.field, sec.key))}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:bg-white transition-all"
                                        placeholder={`Add to ${sec.label}...`}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Sticky Action Card */}
                        <div className="bg-slate-900 rounded-[40px] p-8 space-y-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="space-y-2 relative z-10">
                                <h3 className="text-white font-[700] text-2xl tracking-tighter">Commit Deployment?</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Verify all protocol parameters before initialization.</p>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10">
                                <button
                                    type="submit"
                                    disabled={creating || !org}
                                    className="w-full py-5 bg-emerald-500 text-white rounded-[20px] font-[700] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {creating ? <AiOutlineLoading3Quarters className="animate-spin" /> : <HiOutlineLightningBolt size={18} />}
                                    Commence Deployment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full py-4 bg-white/5 text-slate-500 rounded-[20px] font-[700] text-[11px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}