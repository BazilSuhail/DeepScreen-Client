"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiCheckCircle, HiVideoCamera, HiShieldCheck, HiArrowRight } from "react-icons/hi";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export default function CandidateEntrance() {
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const interviewId = searchParams.get('id'); // setup UUID

    const [interview, setInterview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!interviewId) {
            setError("Invalid interview link. Please check your invitation.");
            setIsLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('access_token');
                // Anyone can view the basic details of an active interview setup
                if (!token) {
                    router.push(`/auth/login?redirect=/ai-interview/candidate?id=${interviewId}`);
                    return;
                }
                console.log(token);
                const response = await axios.get(`${SERVER_URL}/ai_interviews/${interviewId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
                if (response.data.success) {
                    setInterview(response.data.data);
                } else {
                    setError("Interview not found or archived.");
                }
            } catch (err) {
                setError("Failed to load interview details. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [interviewId]);

    const handleStart = () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Redirect to login but keep the interview ID for return
            router.push(`/auth/login?redirect=/ai-interview/candidate?id=${interviewId}`);
            return;
        }

        // Check if user is candidate
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role !== 'candidate') {
            alert("This interview is for candidates only. Please log in as a candidate to proceed.");
            return;
        }

        router.push(`/ai-interview/session?id=${interviewId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins px-6">
                <div className="max-w-md w-full text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <HiShieldCheck className="w-8 h-8 text-red-600" />
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Access Error</h2>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:bg-slate-800"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 font-poppins overflow-hidden">
            {/* Split Screen Layout */}
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Left Side: Info */}
                <div className="w-full lg:w-[60%] p-8 lg:p-15 flex flex-col justify-center">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Neural Autonomous Agent Ready
                        </div>
                        <h1 className="text-xl lg:text-3xl font-black text-slate-900 leading-tight mb-6">
                            Start your AI <span className="text-emerald-500 italic underline decoration-emerald-200 decoration-8 underline-offset-4">Interview</span> for {interview?.title}
                        </h1>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
                            You've been invited to take an autonomous interview powered by our latest neural coordination models.
                            Our AI will chat with you to evaluate your technical skills and experience in real-time.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 flex-shrink-0">
                                    <HiVideoCamera className="text-emerald-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Interactive Chat</h4>
                                    <p className="text-slate-500 text-sm leading-snug">Autonomous conversation covering technical & professional skills.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 flex-shrink-0">
                                    <HiShieldCheck className="text-emerald-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Neural Evaluation</h4>
                                    <p className="text-slate-500 text-sm leading-snug">Instant assessment of your responses based on job requirements.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <HiCheckCircle className="text-emerald-400" />
                                Ready to begin?
                            </h3>
                            <ul className="space-y-3 mb-8 text-emerald-100/80 text-sm font-medium">
                                <li className="flex items-center gap-2">• Ensure a stable internet connection</li>
                                <li className="flex items-center gap-2">• Aim for 15-20 minutes of uninterrupted time</li>
                                <li className="flex items-center gap-2">• Be ready to discuss your technical background</li>
                            </ul>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStart}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                            >
                                Enter Interview Room <HiArrowRight size={20} />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Visual/Background */}
                <div className="hidden lg:block lg:w-[40%] bg-slate-900 relative h-screen">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-24 left-12 right-12">
                        <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em] mb-4">Autonomous Intelligence</p>
                        <h2 className="text-white text-4xl font-black leading-tight">Evaluation that understands depth, not just keywords.</h2>
                        <div className="w-16 h-1 bg-emerald-500 mt-8 rounded-full"></div>
                    </div>

                    {/* Floating Tech Elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-500/10 backdrop-blur-3xl rounded-3xl border border-emerald-500/20 flex items-center justify-center"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 bg-emerald-500/40 rounded-full absolute -inset-2 blur-xl animate-pulse"></div>
                            <HiShieldCheck className="w-12 h-12 text-emerald-500 relative z-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
