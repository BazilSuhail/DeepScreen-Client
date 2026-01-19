"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HiOutlineOfficeBuilding,
    HiOutlineGlobeAlt,
    HiOutlineLightningBolt,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineChartBar,
    HiOutlineUsers,
    HiOutlineSearch
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function OrganizationPage() {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        industry: ""
    });

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        const token = localStorage.getItem("access_token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || !user.uuid) {
            window.location.href = "/auth/login";
            return;
        }

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/org/organization/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrg(response.data);
            setFormData(response.data);
            setError(null);
        } catch (err) {
            if (err.response?.status === 404) {
                setOrg(null);
            } else {
                setError(err.response?.data?.error || "Failed to fetch organization data");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setOperationLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/org/organization/create/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrg(response.data);
            setIsCreating(false);
            setStatusMessage("Organization successfully initialized.");
            setTimeout(() => setStatusMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Creation failed");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleUpdate = async () => {
        setOperationLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/org/organization/${org.uuid}/update/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrg(response.data);
            setIsEditing(false);
            setStatusMessage("Organization protocol updated.");
            setTimeout(() => setStatusMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Update failed");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("CRITICAL ACTION: Are you sure you want to decommission this organization? This cannot be undone.")) return;

        setOperationLoading(true);
        const token = localStorage.getItem("access_token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/org/organization/${org.uuid}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrg(null);
            setFormData({ name: "", website: "", industry: "" });
            setStatusMessage("Organization successfully decommissioned.");
            setTimeout(() => setStatusMessage(""), 3000);
        } catch (err) {
            setError("Deletions restricted at this time.");
        } finally {
            setOperationLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Scanning Neural Network...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">

                {statusMessage && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <HiOutlineCheck size={20} className="text-emerald-500" />
                        <span className="text-sm font-bold">{statusMessage}</span>
                    </div>
                )}

                {/* Main Header / Empty State */}
                {!org && !isCreating ? (
                    <div className="bg-white border border-slate-200 rounded-[32px] p-20 text-center space-y-8 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-300 shadow-xl shadow-black/[0.02]">
                            <HiOutlineOfficeBuilding size={40} className="text-slate-300" />
                        </div>
                        <div className="max-w-md mx-auto space-y-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">No Organization Linked</h1>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Your recruiter identity is currently standalone. Initialize an organization to start managing talent fleets and neural job postings.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 mx-auto active:scale-95"
                        >
                            <span>Initialize Organization</span>
                            <HiOutlinePlus size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header Profile UI */}
                        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                            <div className="h-44 bg-slate-900 relative border-b border-slate-800 overflow-hidden flex items-center justify-center">
                                {/* Geometric Style A: Top Right Polygon */}
                                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                                    <svg viewBox="0 0 400 400" className="w-full h-full rotate-[15deg] transform translate-x-12 -translate-y-12">
                                        <path d="M0 0 L400 0 L400 400 Z" fill="white" />
                                    </svg>
                                </div>

                                {/* Geometric Style B: Bottom Left Polygon */}
                                <div className="absolute bottom-0 left-0 w-1/4 h-full opacity-5 pointer-events-none">
                                    <svg viewBox="0 0 400 400" className="w-full h-full -rotate-[10deg] transform -translate-x-12 translate-y-12">
                                        <path d="M0 400 L400 400 L0 0 Z" fill="white" />
                                    </svg>
                                </div>

                                {/* Geometric Style C: Decorative Circles */}
                                <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white/5 rounded-full -translate-y-1/2 scale-150 opacity-20 pointer-events-none"></div>
                                <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white/5 rounded-full -translate-y-1/2 scale-[2.5] opacity-10 pointer-events-none"></div>

                                {/* Dual Neural Glows */}
                                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                                <div className="absolute -top-24 -left-24 w-60 h-60 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                                {/* Subtle Grid Overlay */}
                                <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:32px_32px]"></div>

                                <div className="relative z-20">
                                    <div className="bg-white/5 backdrop-blur-2xl rounded-2xl px-10 py-5 border border-white/10 text-white flex flex-col items-center gap-2 shadow-2xl animate-in fade-in zoom-in duration-700">
                                        <div className="flex items-center gap-3">
                                            <HiOutlineChartBar size={24} className="text-emerald-400" />
                                            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-emerald-400">Company Health</span>
                                        </div>
                                        <span className="text-2xl font-black uppercase tracking-[0.1em]">Elite Tier</span>
                                        <div className="flex gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <div key={s} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 pb-12 relative">
                                <div className="flex flex-row items-end gap-10 -mt-16">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-[40px] bg-white border border-slate-200 overflow-hidden shadow-2xl flex items-center justify-center group-hover:shadow-emerald-500/10 transition-shadow duration-500">
                                            <HiOutlineOfficeBuilding size={60} className="text-emerald-500 transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-slate-900 w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                                            <HiOutlineLightningBolt className="text-emerald-400" />
                                        </div>
                                    </div>

                                    <div className="flex-1 mb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                                                    {org?.name || "Neural Organization"}
                                                </h1>
                                                <div className="flex items-center gap-6">
                                                    <span className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                                                        <HiOutlineSearch size={16} className="text-emerald-500" />
                                                        {org?.industry || "Industry Unclassified"}
                                                    </span>
                                                    <span className="flex items-center gap-2 text-slate-400 text-[13px] font-bold">
                                                        <HiOutlineGlobeAlt size={18} />
                                                        {org?.website ? (
                                                            <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">
                                                                {org.website.replace('https://', '')}
                                                            </a>
                                                        ) : "No Website Domain"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                {!isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => setIsEditing(true)}
                                                            className="px-8 py-3.5 bg-white border-2 border-slate-100 hover:border-emerald-500/20 hover:bg-emerald-50/50 text-slate-900 rounded-[20px] font-bold text-sm transition-all flex items-center gap-3 shadow-sm active:scale-95"
                                                        >
                                                            <HiOutlinePencil size={18} className="text-emerald-500" />
                                                            Configure Org
                                                        </button>
                                                        <button
                                                            onClick={handleDelete}
                                                            className="p-3.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-[20px] transition-all group active:scale-95"
                                                            title="Decommission Organization"
                                                        >
                                                            <HiOutlineTrash size={22} className="group-hover:rotate-6 transition-transform" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setIsEditing(false)}
                                                            className="px-8 py-3.5 bg-slate-50 text-slate-500 rounded-[20px] font-bold text-sm transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleUpdate}
                                                            disabled={operationLoading}
                                                            className="px-8 py-3.5 bg-emerald-500 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                                                        >
                                                            {operationLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : <HiOutlineCheck size={18} />}
                                                            Sync Protocol
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats / Details Grid */}
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 space-y-8">
                                <div className="grid grid-cols-4 gap-6">
                                    {[
                                        { label: 'Active Fleet', val: '12', icon: HiOutlineUsers, trend: '+2 this month' },
                                        { label: 'Neural Accuracy', val: '98.2%', icon: HiOutlineLightningBolt, trend: 'Optimal' },
                                        { label: 'Hiring Velocity', val: '4.2d', icon: HiOutlineChartBar, trend: '-0.5d decrease' },
                                        { label: 'Verified Status', val: 'Tier 1', icon: HiOutlineCheck, trend: 'Authentic' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-4 hover:border-emerald-500/20 transition-all shadow-sm group">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                <stat.icon size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                                <p className="text-3xl font-black text-slate-900 leading-none">{stat.val}</p>
                                            </div>
                                            <div className="pt-2">
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                    {stat.trend}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Overlays for Edit/Create */}
                {(isEditing || isCreating) && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {isCreating ? "Initialize Neural Organization" : "Reconfigure Protocol"}
                                        </h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enterprise Architecture</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsEditing(false); setIsCreating(false); }}
                                        className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all flex items-center justify-center"
                                    >
                                        <HiOutlineX size={24} />
                                    </button>
                                </div>

                                <form onSubmit={isCreating ? handleCreate : (e) => { e.preventDefault(); handleUpdate(); }} className="space-y-6">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase ml-4">Entity Name</label>
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[15px] font-bold focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                                placeholder="e.g. Neural Dynamics Corporation"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase ml-4">Neural Domain (URL)</label>
                                                <input
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[13px] font-bold focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                                    placeholder="https://company.ai"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase ml-4">Industry Vector</label>
                                                <input
                                                    name="industry"
                                                    value={formData.industry}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[13px] font-bold focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                                    placeholder="e.g. Cybernetics"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-[13px] font-bold flex items-center gap-3">
                                            <HiOutlineX size={18} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={operationLoading}
                                        className="w-full bg-slate-900 text-white h-16 rounded-[24px] font-black text-sm tracking-tight shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {operationLoading ? (
                                            <AiOutlineLoading3Quarters className="animate-spin" />
                                        ) : (
                                            <>
                                                <span>{isCreating ? "Execute Initialization" : "Commit Changes"}</span>
                                                <HiOutlineCheck size={20} />
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