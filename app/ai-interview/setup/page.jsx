"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiCheck, HiClipboardCopy, HiBriefcase, HiLightningBolt, HiChip, HiViewGrid } from "react-icons/hi";
import { MdSend } from "react-icons/md";
import axios from "axios";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

const SetupCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/40 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-sm"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
        </div>
        <p className="text-sm font-bold text-slate-800 break-words">{value || '---'}</p>
    </motion.div>
);

export default function AIInterviewSetup() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const interviewId = searchParams.get('id');

    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSetup, setCurrentSetup] = useState(null);
    const [isFinalized, setIsFinalized] = useState(false);
    const [finalizedData, setFinalizedData] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/auth/login');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== 'recruiter') {
            router.push('/');
            return;
        }

        setUser(userData);

        if (!interviewId) {
            createNewInterview(token);
        } else {
            loadInterview(token, interviewId);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const createNewInterview = async (token) => {
        try {
            const response = await axios.post(
                `${SERVER_URL}/ai_interviews/create/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const newId = response.data.data.id;
                router.push(`/ai-interview/setup?id=${newId}`);

                setMessages([{
                    role: 'assistant',
                    content: "Hello! I'm here to help you set up your AI interview. Let's start by describing the position you're hiring for. What's the job title and level (e.g., Senior Backend Engineer, Junior Frontend Developer)?"
                }]);
            }
        } catch (err) {
            console.error('Failed to create interview:', err);
        }
    };

    const loadInterview = async (token, id) => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/ai_interviews/${id}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const data = response.data.data;
                if (data.status === 'active') {
                    setIsFinalized(true);
                    setFinalizedData(data);
                    return;
                }
                if (data.session_data?.chat_history) {
                    setMessages(data.session_data.chat_history);
                }
                setCurrentSetup(data.job_setup);
            }
        } catch (err) {
            console.error('Failed to load interview:', err);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(
                `${SERVER_URL}/ai_interviews/${interviewId}/job_setup_chat/`,
                { message: userMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                if (response.data.first_question) {
                    setIsFinalized(true);
                    setFinalizedData(response.data.data);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: response.data.message
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: response.data.message
                    }]);
                    setCurrentSetup(response.data.current_setup);
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = (link, type) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(type);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isFinalized && finalizedData) {
        const recruiterLink = `${window.location.origin}/ai-interview/session?id=${finalizedData.id}`;
        const candidateLink = `${window.location.origin}/ai-interview/candidate?id=${finalizedData.id}`;

        return (
            <div className="h-screen bg-slate-50 font-poppins flex items-center justify-center p-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl p-12 border border-slate-100 max-w-2xl w-full text-center"
                >
                    <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20 rotate-3">
                        <HiCheck className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Neural Agent <span className="text-emerald-500 italic">Initialized</span>
                    </h2>
                    <p className="text-slate-500 font-medium mb-12">Interview architecture successfully programmed. Deploy links below.</p>

                    <div className="space-y-6 mb-12">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Candidate Link</p>
                                <p className="text-sm font-bold text-slate-800 truncate max-w-[300px]">{candidateLink}</p>
                            </div>
                            <button
                                onClick={() => copyLink(candidateLink, 'candidate')}
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all text-emerald-500 border border-slate-100"
                            >
                                {copiedLink === 'candidate' ? <HiCheck /> : <HiClipboardCopy />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/ai-interview')}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all"
                        >
                            Return to Hub
                        </button>
                        <button
                            onClick={() => router.push(recruiterLink)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
                        >
                            Test Session
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 font-poppins flex flex-col overflow-hidden">
            {/* Minimal Header */}
            <div className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-100 flex-shrink-0 z-10">
                <button
                    onClick={() => router.push('/ai-interview')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <HiArrowLeft size={18} /> Exit Setup
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-black text-slate-900">Neural Configuration Environment <span className="text-emerald-500 italic">v1.0</span></p>
                </div>
                <div className="w-24"></div>
            </div>

            {/* Main Content: 2 Column Grid */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Job Preview (4/12 width manually via flex) */}
                <div className="w-[450px] bg-white border-r border-slate-100 p-8 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="mb-10">
                        <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">Live Architecture</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Job <span className="text-slate-300">Preview</span></h2>
                        <p className="text-slate-400 text-xs font-medium">Structure evolves as you speak with the agent.</p>
                    </div>

                    <div className="space-y-4">
                        <SetupCard
                            title="Position Title"
                            value={currentSetup?.title}
                            icon={HiBriefcase}
                            color="bg-emerald-500"
                        />
                        <SetupCard
                            title="Experience Level"
                            value={currentSetup?.level}
                            icon={HiLightningBolt}
                            color="bg-amber-500"
                        />
                        <SetupCard
                            title="Employment Type"
                            value={currentSetup?.employment_type}
                            icon={HiViewGrid}
                            color="bg-blue-500"
                        />

                        {/* Skills Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden mt-6 shadow-xl shadow-emerald-900/10"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <HiChip className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Technical Stack</span>
                            </div>

                            <div className="flex flex-wrap gap-2 relative z-10">
                                {currentSetup?.required_skills?.must?.length > 0 ? (
                                    currentSetup.required_skills.must.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-[11px] font-bold border border-white/10 uppercase tracking-tighter">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-emerald-100/40 text-xs font-medium">Awaiting stack definition...</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Instruction Status</p>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                            <div className={`h-1 flex-1 ${currentSetup ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full transition-all`}></div>
                            <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                            "Saying <b>'Ready'</b> or <b>'Finalize'</b> will lock this structure and generate recruitment links."
                        </p>
                    </div>
                </div>

                {/* Right Column: Chat Interface */}
                <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
                    {/* Background Graphic */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-12 space-y-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] px-6 py-4 rounded-[2rem] shadow-sm relative ${msg.role === 'assistant'
                                            ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                            : 'bg-emerald-500 text-white rounded-tr-none'
                                        }`}
                                >
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block opacity-30 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                                        {msg.role === 'assistant' ? 'Neural Coordinator' : 'Recruiter'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 px-6 py-4 rounded-[2rem] shadow-sm">
                                    <div className="flex gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-8 bg-white border-t border-slate-100 flex-shrink-0">
                        <div className="max-w-4xl mx-auto flex gap-4">
                            <div className="flex-1 relative group">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Define your hiring requirements..."
                                    rows={1}
                                    disabled={isLoading}
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700 resize-none disabled:bg-slate-50"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className={`p-2.5 rounded-xl transition-all ${!inputMessage.trim() || isLoading
                                                ? 'text-slate-300'
                                                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105'
                                            }`}
                                    >
                                        <MdSend size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[10px] uppercase font-black tracking-widest text-slate-400 mt-4 leading-none">
                            Powered by Autonomous Neural Agents • Alpha Access
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}