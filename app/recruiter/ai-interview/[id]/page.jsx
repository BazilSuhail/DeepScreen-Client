'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlineSparkles,
    HiOutlineDocumentText, HiOutlinePlay, HiOutlineTrash,
    HiOutlineArrowUpRight, HiOutlineChatBubbleBottomCenterText,
    HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineEllipsisVertical,
    HiOutlinePlusCircle, HiOutlineXMark, HiOutlineListBullet
} from 'react-icons/hi2';

export default function RecruiterAIInterviewDetail() {
    const { id } = useParams();
    const router = useRouter();
    
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'config'

    const [form, setForm] = useState({
        title: '',
        description: '',
        system_prompt: '',
        context_for_ai: '',
        evaluation_criteria: {},
        number_of_questions: 5,
        duration_minutes: 20,
        passing_score: 65,
        questions: []
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.get(`/ai-interviews/${id}/`);
                setInterview(data);
                setForm({
                    title: data.title,
                    description: data.description || '',
                    system_prompt: data.system_prompt || '',
                    context_for_ai: data.context_for_ai || '',
                    evaluation_criteria: data.evaluation_criteria || {},
                    number_of_questions: data.number_of_questions,
                    duration_minutes: data.duration_minutes,
                    passing_score: data.passing_score,
                    questions: data.questions || []
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/ai-interviews/${id}/`, form);
            setInterview({...interview, ...res});
            alert('Interview configuration updated');
        } catch (e) {
            alert(e.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleDecision = async (sessionId, action, rejectOthers = false) => {
        if (!confirm(`Are you sure you want to ${action} this candidate?`)) return;
        try {
            await api.post(`/ai-interviews/sessions/${sessionId}/decide/`, { action, reject_others: rejectOthers });
            // Refresh data
            const data = await api.get(`/ai-interviews/${id}/`);
            setInterview(data);
        } catch (e) {
            alert(e.message || 'Failed to process decision');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" /></div>;

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-black text-[10px] uppercase tracking-widest group">
                    <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Interviews
                </button>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                {interview.job_title}
                            </span>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient">{interview.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center bg-secondary/30 p-1.5 rounded-[1.5rem] border border-border">
                        <button 
                            onClick={() => setActiveTab('sessions')}
                            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xl shadow-black/10' : 'text-slate-500 hover:text-emerald-500'}`}
                        >
                            Candidate Sessions
                        </button>
                        <button 
                            onClick={() => setActiveTab('config')}
                            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xl shadow-black/10' : 'text-slate-500 hover:text-emerald-500'}`}
                        >
                            LLM Configuration
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'config' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Prompting */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-[2.5rem] p-10 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border pb-6">
                                <HiOutlineSparkles className="w-6 h-6 text-emerald-500" />
                                <h3 className="text-xl font-black italic uppercase tracking-widest">System Intelligence</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Master Interviewer Prompt</label>
                                    <textarea 
                                        value={form.system_prompt} 
                                        onChange={e => setForm({...form, system_prompt: e.target.value})}
                                        rows={6}
                                        placeholder="Instructions for the AI on how to conduct the interview..."
                                        className="w-full p-8 rounded-[2rem] bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Job Context (Hidden from Candidate)</label>
                                    <textarea 
                                        value={form.context_for_ai} 
                                        onChange={e => setForm({...form, context_for_ai: e.target.value})}
                                        rows={4}
                                        placeholder="Add specific details about the job, culture, or project that the AI should keep in mind during evaluation..."
                                        className="w-full p-8 rounded-[2rem] bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium leading-relaxed"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Evaluation Criteria */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass border border-border rounded-[2.5rem] p-10 space-y-8">
                            <div className="flex items-center justify-between border-b border-border pb-6">
                                <div className="flex items-center gap-3">
                                    <HiOutlineCheckCircle className="w-6 h-6 text-emerald-500" />
                                    <h3 className="text-xl font-black italic uppercase tracking-widest">Scoring Metrics</h3>
                                </div>
                                <button className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:underline">
                                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Metric
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(form.evaluation_criteria).map(([name, weight]) => (
                                    <div key={name} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-secondary/30 border border-border">
                                        <div className="space-y-1">
                                            <span className="text-sm font-bold uppercase tracking-tight italic">{name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${weight}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black opacity-40">{weight}% Weight</span>
                                            </div>
                                        </div>
                                        <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {Object.keys(form.evaluation_criteria).length === 0 && (
                                    <p className="col-span-full text-center py-6 text-slate-400 text-xs font-medium italic">Define criteria like "Communication", "Technical Depth", etc. to guide the AI evaluator.</p>
                                )}
                            </div>
                        </motion.div>

                        {/* Question Pool */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-border rounded-[2.5rem] p-10 space-y-8">
                            <div className="flex items-center justify-between border-b border-border pb-6">
                                <div className="flex items-center gap-3">
                                    <HiOutlineListBullet className="w-6 h-6 text-emerald-500" />
                                    <h3 className="text-xl font-black italic uppercase tracking-widest">Question Pool</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const next = [...form.questions, "New question text..."];
                                            setForm({...form, questions: next});
                                        }}
                                        className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:underline"
                                    >
                                        <HiOutlinePlusCircle className="w-4 h-4" /> Add Manually
                                    </button>
                                    <button 
                                        type="button"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                    >
                                        <HiOutlineSparkles className="w-4 h-4" /> AI Generate Pool
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {form.questions.map((q, idx) => (
                                    <div key={idx} className="group flex items-start gap-6 p-6 rounded-[1.5rem] bg-secondary/20 border border-border hover:border-emerald-500/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-[10px] font-black opacity-30">
                                            {idx + 1}
                                        </div>
                                        <textarea 
                                            value={q} 
                                            onChange={e => {
                                                const next = [...form.questions];
                                                next[idx] = e.target.value;
                                                setForm({...form, questions: next});
                                            }}
                                            className="flex-1 bg-transparent outline-none text-sm font-medium leading-relaxed pt-2 resize-none h-auto"
                                            rows={2}
                                        />
                                        <button 
                                            onClick={() => {
                                                const next = form.questions.filter((_, i) => i !== idx);
                                                setForm({...form, questions: next});
                                            }}
                                            className="p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {form.questions.length === 0 && (
                                    <div className="py-12 text-center space-y-4 border-2 border-dashed border-border rounded-[2rem]">
                                        <p className="text-slate-400 text-sm font-medium italic">No specific questions defined. The AI will generate questions dynamically if the pool is empty.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-10">
                        {/* Settings */}
                        <div className="glass border border-border rounded-[2.5rem] p-10 space-y-8 sticky top-10">
                            <h3 className="text-xl font-black italic uppercase tracking-widest border-b border-border pb-6">Session Parameters</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Passing Score (%)</label>
                                    <input type="number" value={form.passing_score} onChange={e => setForm({...form, passing_score: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none font-bold text-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Questions Count</label>
                                    <input type="number" value={form.number_of_questions} onChange={e => setForm({...form, number_of_questions: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none font-bold text-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Time Limit (Min)</label>
                                    <input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none font-bold text-xl" />
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-6 rounded-[2rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? 'Syncing...' : <><HiOutlineSparkles className="w-5 h-5" /> Save Configuration</>}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Sessions Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        {(interview.sessions || []).map((session, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={session.session_id}
                                className="glass border border-border rounded-[2.5rem] p-8 hover:border-emerald-500/20 transition-all group overflow-hidden relative"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border border-border flex items-center justify-center text-slate-400 font-black text-xl italic uppercase">
                                            {session.candidate_name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">
                                                {session.candidate_name}
                                            </h4>
                                            <p className="text-slate-400 text-xs font-medium">{session.candidate_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">AI Score</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-2xl font-black ${session.overall_score >= interview.passing_score ? 'text-emerald-500' : 'text-red-400'}`}>
                                                    {session.overall_score || 'N/A'}%
                                                </span>
                                                {session.overall_score >= interview.passing_score && <HiOutlineSparkles className="w-5 h-5 text-emerald-500 animate-pulse" />}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</span>
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                session.status === 'evaluated' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                session.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                            }`}>
                                                {session.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleDecision(session.session_id, 'reject')}
                                                className="w-12 h-12 rounded-2xl bg-secondary hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-border"
                                            >
                                                <HiOutlineHandThumbDown className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDecision(session.session_id, 'select', true)}
                                                className="px-6 h-12 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                                            >
                                                <HiOutlineHandThumbUp className="w-5 h-5" /> Select Candidate
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {session.overall_feedback && (
                                    <div className="mt-8 p-6 rounded-[1.5rem] bg-secondary/20 border border-border italic text-sm text-slate-500 leading-relaxed font-medium">
                                        "{session.overall_feedback}"
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {(!interview.sessions || interview.sessions.length === 0) && (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto text-slate-400 opacity-30">
                                    <HiOutlineUserGroup className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold uppercase italic tracking-tighter opacity-40">No Candidates have taken this interview yet</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function HiOutlineUserGroup(props) { return <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
