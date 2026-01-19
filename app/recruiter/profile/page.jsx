"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlinePencil,
    HiOutlineBriefcase,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineGlobeAlt,
    HiOutlineLink,
    HiOutlineOfficeBuilding,
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineMap
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters, AiOutlinePlus, AiOutlineLinkedin } from 'react-icons/ai';

export default function RecruiterProfile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        country: "",
        location: "",
        bio: "",
        company_name: "",
        company_website: "",
        expertise: [],
        linkedin_url: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/recruiter/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            setUserData(data);

            // Split location into street, city, country
            const locationParts = data.location ? data.location.split(', ') : [];
            setFormData({
                ...data,
                street: locationParts[0] || "",
                city: locationParts[1] || "",
                country: locationParts[2] || ""
            });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load recruiter profile");
            if (err.response?.status === 404) {
                try {
                    const fallback = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/user/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserData(fallback.data);
                    setFormData(prev => ({ ...prev, ...fallback.data }));
                    setError(null);
                } catch (e) {
                    setError("Profile not found");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExpertiseAdd = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newItem = e.target.value.trim();
            if (!formData.expertise?.includes(newItem)) {
                setFormData(prev => ({
                    ...prev,
                    expertise: [...(prev.expertise || []), newItem]
                }));
            }
            e.target.value = '';
        }
    };

    const removeExpertise = (itemToRemove) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.filter(item => item !== itemToRemove)
        }));
    };

    const handleUpdate = async () => {
        setSaving(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        // Merge location fields
        const mergedLocation = [formData.street, formData.city, formData.country]
            .filter(Boolean)
            .join(', ');

        const payload = {
            ...formData,
            location: mergedLocation
        };

        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/recruiter/profile/update/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);

            const locationParts = response.data.location ? response.data.location.split(', ') : [];
            setFormData({
                ...response.data,
                street: locationParts[0] || "",
                city: locationParts[1] || "",
                country: locationParts[2] || ""
            });
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <div className="text-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Syncing Recruiter Data...</p>
                </div>
            </div>
        );
    }

    if (error && !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins text-center p-6">
                <div className="bg-white border border-slate-200 p-10 rounded-[32px] text-center max-w-md shadow-xl">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <HiOutlineX size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Offline</h2>
                    <p className="text-slate-500 mb-8 font-medium">{error}</p>
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Retry Handshake
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 p-8 font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">

                {/* Header Card */}
                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="h-44 bg-slate-900 relative border-b border-slate-800 overflow-hidden flex items-center justify-center">
                        {/* Architectural Shape 1: Diagonal Intersection */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                            <svg width="100%" height="100%">
                                <pattern id="diag-lines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                    <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#diag-lines)" />
                            </svg>
                        </div>

                        {/* Architectural Shape 2: Massive Floating Triangle */}
                        <div className="absolute -top-10 -right-20 w-1/2 h-full opacity-[0.07] pointer-events-none">
                            <svg viewBox="0 0 400 400" className="w-full h-full rotate-[30deg]">
                                <path d="M400 0 L400 400 L0 400 Z" fill="white" />
                            </svg>
                        </div>

                        {/* Architectural Shape 3: Precision Crosshair Corner */}
                        <div className="absolute bottom-10 left-10 w-32 h-32 border-l border-b border-white/10 rounded-bl-3xl pointer-events-none opacity-40"></div>

                        {/* Architectural Shape 4: Neural Core Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                        {/* Centered Profile Protocol Badge */}
                        <div className="relative z-20">
                            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl px-8 py-4 border border-white/10 text-white flex flex-col items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">Security Protocol</span>
                                </div>
                                <span className="text-xl font-black uppercase tracking-widest leading-none">Recruitment Active</span>
                                <div className="flex gap-1.5 mt-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-6 h-1 rounded-full bg-white/10">
                                            <div className="h-full bg-emerald-500 rounded-full animate-shimmer" style={{ width: '40%', animationDelay: `${i * 0.2}s` }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-10 pb-10 relative">
                        <div className="flex flex-row items-end gap-8 -mt-16">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-36 h-36 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xl flex items-center justify-center text-5xl font-black text-slate-900">
                                    {userData.username?.substring(0, 1).toUpperCase() || "R"}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                                    <HiOutlineCheck className="text-white text-md" />
                                </div>
                            </div>

                            <div className="flex-1 mb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username || ''}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 focus:ring-2 focus:ring-emerald-500/20 outline-none w-full text-slate-900"
                                                    placeholder="Recruiter Name"
                                                />
                                            ) : (
                                                userData.username || "Recruiter Principal"
                                            )}
                                        </h1>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                                                <HiOutlineOfficeBuilding size={16} />
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="company_name"
                                                        value={formData.company_name || ''}
                                                        onChange={handleInputChange}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900"
                                                        placeholder="Company Name"
                                                    />
                                                ) : (
                                                    userData.company_name || "DeepScreen Talent"
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <HiOutlineLocationMarker size={16} />
                                                {userData.location || "Central Hub"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => { setIsEditing(false); setFormData(prev => ({ ...prev, ...userData, street: userData.location?.split(', ')[0] || "", city: userData.location?.split(', ')[1] || "", country: userData.location?.split(', ')[2] || "" })); }}
                                                    className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdate}
                                                    disabled={saving}
                                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {saving && <AiOutlineLoading3Quarters className="animate-spin" />}
                                                    Update Protocol
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200"
                                            >
                                                Modify Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="col-span-4 space-y-8">
                        {/* Core Info */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Engagement Access</h2>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                        <HiOutlineMail size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Communication Hub</p>
                                        {isEditing ? (
                                            <input name="email" value={formData.email} onChange={handleInputChange} className="w-full text-[13px] font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" />
                                        ) : (
                                            <p className="text-[13px] font-bold text-slate-800 truncate">{userData.email || "access-denied"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                                        <HiOutlinePhone size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Secure Line</p>
                                        {isEditing ? (
                                            <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full text-[13px] font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" />
                                        ) : (
                                            <p className="text-[13px] font-bold text-slate-800 truncate">{userData.phone || "No line active"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                                        <HiOutlineGlobeAlt size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Company Portal</p>
                                        {isEditing ? (
                                            <input name="company_website" value={formData.company_website} onChange={handleInputChange} className="w-full text-[13px] font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" placeholder="https://company.ai" />
                                        ) : (
                                            <p className="text-[13px] font-bold text-slate-800 truncate">{userData.company_website || "Offline"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Location */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">HQ Coordinates</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                                        <HiOutlineMap size={20} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        {isEditing ? (
                                            <>
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Street</p>
                                                    <input name="street" value={formData.street} onChange={handleInputChange} className="w-full text-xs font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" placeholder="Street Address" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">City</p>
                                                    <input name="city" value={formData.city} onChange={handleInputChange} className="w-full text-xs font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" placeholder="City" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Country</p>
                                                    <input name="country" value={formData.country} onChange={handleInputChange} className="w-full text-xs font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" placeholder="Country" />
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                                                {userData.location || "Coordinate data pending..."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Profiles */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Neural Presence</h2>
                            <div className="space-y-3">
                                {[
                                    { name: 'linkedin_url', icon: AiOutlineLinkedin, label: 'LinkedIn Pro' }
                                ].map((social) => (
                                    <div key={social.name}>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 group-focus-within:border-emerald-500/30 transition-all">
                                                <social.icon className="text-slate-400" />
                                                <input
                                                    type="text"
                                                    name={social.name}
                                                    value={formData[social.name] || ''}
                                                    onChange={handleInputChange}
                                                    className="bg-transparent text-[11px] font-medium outline-none w-full text-slate-600"
                                                    placeholder={`${social.label} Link`}
                                                />
                                            </div>
                                        ) : (
                                            userData[social.name] && (
                                                <a href={userData[social.name]} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-100 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <social.icon className="text-slate-400 group-hover:text-emerald-500" />
                                                        <span className="text-[12px] font-bold text-slate-700 group-hover:text-emerald-700">{social.label}</span>
                                                    </div>
                                                    <HiOutlineLink className="text-slate-300 group-hover:text-emerald-300" />
                                                </a>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-8 space-y-8">
                        {/* Executive Summary */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-10">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                Recruitment Mission
                            </h2>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    rows="5"
                                    value={formData.bio || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 text-[14px] focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none font-medium"
                                    placeholder="Describe your company's recruitment philosophy or your professional background..."
                                />
                            ) : (
                                <p className="text-slate-500 text-[15px] leading-[1.8] font-medium whitespace-pre-wrap">
                                    {userData.bio || "No recruitment philosophy shared. Use the editor to define your talent acquisition mission."}
                                </p>
                            )}
                        </div>

                        {/* Recruitment Expertise */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
                                    Functional Domain
                                </h2>
                                {isEditing && <span className="text-[9px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-400">Press ENTER to add domain</span>}
                            </div>

                            <div className="flex flex-wrap gap-2.5 mb-6">
                                {(isEditing ? formData.expertise : userData.expertise)?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl font-bold text-[11px] uppercase tracking-wider"
                                    >
                                        <span>{item}</span>
                                        {isEditing && (
                                            <button onClick={() => removeExpertise(item)} className="hover:text-red-500 transition-colors">
                                                <HiOutlineX size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isEditing && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        onKeyDown={handleExpertiseAdd}
                                        placeholder="Add recruiting expertise (e.g. Fintech, AI/ML hiring)..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                                    />
                                    <AiOutlinePlus className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            )}
                        </div>

                        {/* Fleet Stats */}
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Active Postings', val: userData.jobs_posted || 0, icon: HiOutlineBriefcase },
                                { label: 'Candidate Reach', val: userData.reach || "0k", icon: HiOutlineUsers },
                                { label: 'Success Rate', val: userData.hiring_rate || "0%", icon: HiOutlineChartBar }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-[28px] p-7 text-center group hover:border-emerald-500/20 transition-all shadow-sm shadow-black/[0.01]">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-black text-slate-900 mb-1">{stat.val}</p>
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}