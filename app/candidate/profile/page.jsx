"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlinePencil,
    HiOutlineAcademicCap,
    HiOutlineLightningBolt,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineGlobeAlt,
    HiOutlineLink
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters, AiOutlinePlus, AiOutlineGithub, AiOutlineLinkedin } from 'react-icons/ai';
import { FaTrash } from 'react-icons/fa';

export default function CandidateProfile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        skills: [],
        github_url: "",
        linkedin_url: "",
        portfolio_url: ""
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/candidate/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
            setFormData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load candidate profile");
            if (err.response?.status === 404) {
                try {
                    const fallback = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/user/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserData(fallback.data);
                    setFormData(fallback.data);
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

    const handleSkillAdd = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newSkill = e.target.value.trim();
            if (!formData.skills?.includes(newSkill)) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...(prev.skills || []), newSkill]
                }));
            }
            e.target.value = '';
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const handleUpdate = async () => {
        setSaving(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/candidate/profile/update/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
            setFormData(response.data);
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
                    <p className="text-slate-500 font-medium animate-pulse">Synchronizing Profile...</p>
                </div>
            </div>
        );
    }

    if (error && !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
                <div className="bg-white border border-slate-200 p-10 rounded-[32px] text-center max-w-md shadow-xl">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <HiOutlineX size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-8 font-medium">{error}</p>
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 p-8 font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">

                {/* Simplified Header Card */}
                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="h-40 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 relative border-b border-slate-100">
                        <div className="absolute inset-0 bg-grid-slate-200/[0.05] bg-[size:20px_20px]"></div>
                    </div>

                    <div className="px-10 pb-10 relative">
                        <div className="flex flex-row items-end gap-8 -mt-16">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-36 h-36 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl flex items-center justify-center text-5xl font-black text-emerald-500">
                                    {userData.username?.substring(0, 1).toUpperCase() || "C"}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
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
                                                    placeholder="Your Name"
                                                />
                                            ) : (
                                                userData.username || "Candidate Name"
                                            )}
                                        </h1>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                                                <HiOutlineCheck size={16} />
                                                Verified Talent
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <HiOutlineLocationMarker size={16} />
                                                {userData.location || "Remote"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => { setIsEditing(false); setFormData(userData); }}
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
                                                    Save Changes
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200"
                                            >
                                                Edit Profile
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
                        {/* Info Section */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Contact Details</h2>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                        <HiOutlineMail size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                        {isEditing ? (
                                            <input name="email" value={formData.email} onChange={handleInputChange} className="w-full text-sm font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 truncate">{userData.email || "N/A"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                                        <HiOutlinePhone size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                                        {isEditing ? (
                                            <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full text-sm font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 truncate">{userData.phone || "Not provided"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                                        <HiOutlineLocationMarker size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                                        {isEditing ? (
                                            <input name="location" value={formData.location} onChange={handleInputChange} className="w-full text-sm font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-emerald-500" />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 truncate">{userData.location || "Earth"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Profiles</h2>
                            <div className="space-y-3">
                                {[
                                    { name: 'github_url', icon: AiOutlineGithub, label: 'GitHub' },
                                    { name: 'linkedin_url', icon: AiOutlineLinkedin, label: 'LinkedIn' },
                                    { name: 'portfolio_url', icon: HiOutlineGlobeAlt, label: 'Portfolio' }
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
                                                    className="bg-transparent text-[12px] font-medium outline-none w-full text-slate-600"
                                                    placeholder={`${social.label} Link`}
                                                />
                                            </div>
                                        ) : (
                                            userData[social.name] && (
                                                <a href={userData[social.name]} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-100 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <social.icon className="text-slate-400 group-hover:text-emerald-500" />
                                                        <span className="text-[13px] font-bold text-slate-700 group-hover:text-emerald-700">{social.label}</span>
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
                        {/* Bio */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-10">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                Professional Summary
                            </h2>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    rows="5"
                                    value={formData.bio || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 text-[15px] focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                                    placeholder="Write something professional about yourself..."
                                />
                            ) : (
                                <p className="text-slate-500 text-[16px] leading-[1.6] font-medium whitespace-pre-wrap">
                                    {userData.bio || "No summary added yet. Click edit to tell your story."}
                                </p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="bg-white border border-slate-200 rounded-[32px] p-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
                                    Core Competencies
                                </h2>
                                {isEditing && <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">Hit Enter to Add</span>}
                            </div>

                            <div className="flex flex-wrap gap-2.5 mb-6">
                                {(isEditing ? formData.skills : userData.skills)?.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-xs"
                                    >
                                        <span>{skill}</span>
                                        {isEditing && (
                                            <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
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
                                        onKeyDown={handleSkillAdd}
                                        placeholder="Add a skill (e.g. Next.js)..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                                    />
                                    <AiOutlinePlus className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            )}
                        </div>

                        {/* Minimal Stats */}
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Jobs Found', val: userData.jobs_count || 0, icon: HiOutlineCheck, color: 'emerald' },
                                { label: 'Interviews', val: userData.interviews_count || 0, icon: AiOutlineLoading3Quarters, color: 'slate' },
                                { label: 'Match Rate', val: userData.match_rate || "0%", icon: HiOutlineLightningBolt, color: 'amber' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-[28px] p-6 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-tight">{stat.label}</p>
                                    <p className="text-3xl font-black text-slate-900">{stat.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}