"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiVideoCamera, HiCalendar, HiClock, HiUser } from "react-icons/hi";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export default function InterviewDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            // Not logged in - redirect to login
            router.push('/auth/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        // Fetch user's interviews
        fetchInterviews(token, userData.role);
    }, []);

    const fetchInterviews = async (token, role) => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/interviews/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Map the API response to our component format
                const mappedInterviews = response.data.data.interviews.map(interview => ({
                    id: interview.interviewId,
                    candidateName: interview.myRole === 'recruiter'
                        ? interview.otherParticipant.name
                        : user.name,
                    recruiterName: interview.myRole === 'candidate'
                        ? interview.otherParticipant.name
                        : user.name,
                    scheduledAt: interview.scheduledAt,
                    status: interview.status,
                    timeUntilStart: interview.timeUntilStart,
                    notes: interview.notes,
                    otherParticipant: interview.otherParticipant,
                    myRole: interview.myRole
                }));

                setInterviews(mappedInterviews);
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch interviews:', err);
            setIsLoading(false);
        }
    };

    const joinInterview = (interviewId) => {
        // Navigate to interview room with role parameter
        router.push(`/interview/${interviewId}?role=${user.role}`);
    };

    const createInterview = () => {
        router.push('/interview/create');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 font-poppins pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">
                        Interview <span className="text-emerald-500 italic">Dashboard</span>
                    </h1>
                    <p className="text-slate-600 font-medium">
                        Welcome back, <span className="font-bold">{user.name}</span> • {user.role}
                    </p>
                </div>

                {/* Recruiter View */}
                {user.role === 'recruiter' && (
                    <div className="space-y-8">
                        {/* Create Interview Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={createInterview}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <HiVideoCamera className="w-6 h-6" />
                            Schedule New Interview
                        </motion.button>

                        {/* Scheduled Interviews */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Scheduled Interviews</h2>
                            {interviews.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                    <HiCalendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium">No scheduled interviews yet</p>
                                    <p className="text-slate-400 text-sm mt-2">Create your first interview to get started</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {interviews.map((interview) => (
                                        <motion.div
                                            key={interview.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <HiUser className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{interview.candidateName}</h3>
                                                        <p className="text-xs text-slate-500">Candidate</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                    {interview.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600 mb-4">
                                                <HiClock className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {new Date(interview.scheduledAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => joinInterview(interview.id)}
                                                className="w-full bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-700 py-3 rounded-xl font-bold transition-all"
                                            >
                                                Join Interview
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Candidate View */}
                {user.role === 'candidate' && (
                    <div className="space-y-8">
                        {/* Info Banner */}
                        <div className="bg-white rounded-2xl p-6 border border-emerald-200 bg-emerald-50">
                            <div className="flex items-center gap-3">
                                <HiVideoCamera className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h3 className="font-bold text-slate-900">Your Upcoming Interviews</h3>
                                    <p className="text-sm text-slate-600">Click on an interview to join when it's time</p>
                                </div>
                            </div>
                        </div>

                        {/* Scheduled Interviews */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Scheduled Interviews</h2>
                            {interviews.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                    <HiCalendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium">No scheduled interviews</p>
                                    <p className="text-slate-400 text-sm mt-2">You'll see your interviews here when a recruiter schedules one</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {interviews.map((interview) => (
                                        <motion.div
                                            key={interview.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <HiUser className="w-6 h-6 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{interview.recruiterName}</h3>
                                                        <p className="text-xs text-slate-500">Recruiter</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                    {interview.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600 mb-4">
                                                <HiClock className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {new Date(interview.scheduledAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => joinInterview(interview.id)}
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                                            >
                                                Join Interview
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
