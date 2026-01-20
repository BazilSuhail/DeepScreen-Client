"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiPlus, HiChartBar, HiPencil, HiTrash, HiUsers, HiLink } from "react-icons/hi";
import axios from "axios";
import { BiCheckDouble } from "react-icons/bi";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export default function AIInterviewDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/auth/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        if (userData.role === 'recruiter') {
            fetchRecruiterInterviews(token);
        } else {
            router.push('/ai-interview/history');
        }
    }, []);

    const fetchRecruiterInterviews = async (token) => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/ai_interviews/recruiter/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setInterviews(response.data.data);
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch interviews:', err);
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        router.push('/ai-interview/setup');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">
                            AI Interview <span className="text-emerald-500 italic">Hub</span>
                        </h1>
                        <p className="text-slate-600 font-medium">
                            Manage your autonomous neural interview agents
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateNew}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
                    >
                        <HiPlus size={20} />
                        New AI Interview
                    </motion.button>
                </div>

                {/* Grid */}
                {interviews.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiChartBar className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No AI Interviews yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            Start creating your first autonomous interview agent to streamline your hiring process.
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="text-emerald-500 font-bold hover:text-emerald-600 transition-colors uppercase tracking-widest text-xs"
                        >
                            + Create Interview
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.map((interview) => (
                            <motion.div
                                key={interview.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all relative overflow-hidden group"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-0 right-0">
                                    <div className={`px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${interview.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                                            interview.status === 'draft' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {interview.status}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-1 truncate pr-20">{interview.title}</h3>
                                <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest">
                                    Created: {new Date(interview.created_at).toLocaleDateString()}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Candidates</p>
                                        <div className="flex items-center gap-2">
                                            <HiUsers className="text-emerald-500" />
                                            <span className="text-lg font-black text-slate-900">{interview.total_candidates}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Completed</p>
                                        <div className="flex items-center gap-2">
                                            <BiCheckDouble className="text-emerald-500" />
                                            <span className="text-lg font-black text-slate-900">{interview.completed_interviews}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {interview.status === 'draft' ? (
                                        <button
                                            onClick={() => router.push(`/ai-interview/setup?id=${interview.id}`)}
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            <HiPencil /> Finish Setup
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => router.push(`/ai-interview/results?id=${interview.id}`)}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
                                            >
                                                <HiChartBar /> Results
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const link = `${window.location.origin}/ai-interview/candidate?id=${interview.id}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert('Candidate link copied to clipboard!');
                                                }}
                                                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center rounded-xl transition-all"
                                                title="Copy Candidate Link"
                                            >
                                                <HiLink size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}