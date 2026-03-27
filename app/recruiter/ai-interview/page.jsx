'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlineMicrophone, HiOutlinePlus, HiOutlineMagnifyingGlass, 
    HiOutlineChevronRight, HiOutlineChatBubbleLeftRight,
    HiOutlineClock, HiOutlineUserGroup, HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2';

export default function RecruiterAIInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        title: '',
        job: '',
        system_prompt: 'You are an expert technical interviewer. Evaluate the candidate on their problem-solving, communication, and technical depth.',
        number_of_questions: 5,
        duration_minutes: 20,
        passing_score: 65
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [intv, jbs] = await Promise.all([
                    api.get('/ai-interviews/'),
                    api.get('/jobs/recruiter/')
                ]);
                setInterviews(intv);
                setJobs(jbs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/ai-interviews/', form);
            window.location.href = `/recruiter/ai-interview/${res.interview_id}`;
        } catch (e) {
            alert(e.message || 'Failed to create AI Interview');
        }
    };

    const filtered = interviews.filter(i => 
        i.title.toLowerCase().includes(search.toLowerCase()) || 
        i.job_title?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" /></div>;

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <HiOutlineMicrophone className="w-6 h-6" />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gradient">AI Interviews</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
                        Automated video & audio interviews powered by LLMs. Configure prompts, set criteria, and review candidate performance.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search interviews..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-12 pr-6 py-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-border outline-none focus:border-emerald-500/50 transition-all w-[300px] shadow-sm font-medium"
                        />
                    </div>
                    <button 
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-8 py-4 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> Setup Interview
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map((interview, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={interview.interview_id}
                        onClick={() => window.location.href = `/recruiter/ai-interview/${interview.interview_id}`}
                        className="group relative glass border border-border rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <HiOutlineMicrophone className="w-32 h-32" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    {interview.job_title || 'Generic'}
                                </span>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <HiOutlineClock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{interview.duration_minutes}m</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                                    {interview.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 font-medium">
                                    {interview.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Questions</span>
                                    <span className="text-lg font-black">{interview.number_of_questions}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Sessions</span>
                                    <span className="text-lg font-black">{interview.session_count || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                    <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> Manage Config
                                </div>
                                <HiOutlineChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto text-slate-400">
                            <HiOutlineMicrophone className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">No AI Interviews configured yet</h3>
                            <p className="text-slate-500">Create your first automated interview to start screening candidates.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl glass border border-border p-12 rounded-[3rem] shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">New AI Interview</h3>
                                <button onClick={() => setShowCreate(false)} className="p-3 rounded-xl hover:bg-secondary transition-all"><HiOutlineXMark className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Interview Title</label>
                                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Frontend AI Screen" className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Link to Job Opening</label>
                                    <select required value={form.job} onChange={e => setForm({...form, job: e.target.value})} className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium appearance-none cursor-pointer">
                                        <option value="">Select a Job</option>
                                        {jobs.map(j => <option key={j.job_id} value={j.job_id}>{j.job_title}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">No. of Questions</label>
                                    <input type="number" required value={form.number_of_questions} onChange={e => setForm({...form, number_of_questions: e.target.value})} className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium" />
                                </div>
                                
                                <div className="md:col-span-2 flex gap-4 pt-6">
                                    <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-5 rounded-[1.5rem] bg-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-5 rounded-[1.5rem] bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all">Create Interview</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function HiOutlineXMark(props) { return <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }
