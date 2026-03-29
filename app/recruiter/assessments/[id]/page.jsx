'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineChevronLeft, HiOutlinePlus, HiOutlineXMark,
    HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBeaker,
    HiOutlineCheckCircle, HiOutlineListBullet, HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText, HiOutlineSparkles,
} from 'react-icons/hi2';
import ProblemForm from '@/components/assessments/ProblemForm';
import ProblemBankModal from '@/components/assessments/ProblemBankModal';
import { DIFFICULTY_COLORS, EMPTY_PROBLEM } from '@/constants/shared';

export default function AssessmentEditPage() {
    const router = useRouter();
    const { id } = useParams();

    const [assessment, setAssessment] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingProblem, setEditingProblem] = useState(null); 
    const [savingProblem, setSavingProblem] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isBankOpen, setIsBankOpen] = useState(false);

    const [meta, setMeta] = useState({ title: '', description: '', duration_minutes: 90, passing_score: 70 });

    const load = async () => {
        try {
            const data = await api.get(`/assessments/${id}/`);
            setAssessment(data);
            setMeta({ title: data.title, description: data.description || '', duration_minutes: data.duration_minutes, passing_score: data.passing_score });
            // Questions are fetched directly from the JSONB questions_data field
            setProblems(data.questions || []);
        } catch {
            setError('Failed to load assessment');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) load(); }, [id]);

    const handleSaveMeta = async () => {
        setSaving(true);
        try {
            await api.patch(`/assessments/${id}/`, meta);
            setSuccess('Assessment settings updated!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleSaveProblem = async (form) => {
        setSavingProblem(true);
        try {
            const payload = { ...form };
            if (payload.type !== 'coding') delete payload.coding_details;
            if (payload.type !== 'mcq') delete payload.mcq_details;
            if (payload.type !== 'subjective') delete payload.subjective_details;

            if (form.question_id) {
                // Update existing
                const res = await api.patch(`/assessments/${id}/questions/${form.question_id}/`, payload);
                setProblems(res.assessment.questions);
            } else {
                // Create new and add
                const res = await api.post(`/assessments/${id}/questions/add/`, payload);
                setProblems(res.assessment.questions);
            }
            setEditingProblem(null);
            setSuccess('Question saved successfully!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            const msg = e.message || 'Failed to save question';
            setError(msg);
            if (editingProblem) {
                setEditingProblem(prev => ({ ...prev, error: msg }));
            }
        } finally { setSavingProblem(false); }
    };

    const handleSelectFromBank = async (bankProb) => {
        setSavingProblem(true);
        try {
            // Add from pool using question_id
            const res = await api.post(`/assessments/${id}/questions/add/`, { question_id: bankProb.question_id });
            setProblems(res.assessment.questions);
            setIsBankOpen(false);
            setSuccess('Question added from bank!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Failed to add question from bank');
        } finally { setSavingProblem(false); }
    };

    const handleDeleteProblem = async (questionId) => {
        if (!confirm('Remove this question from the assessment? (It remains in the org pool)')) return;
        try {
            const res = await api.post(`/assessments/${id}/questions/remove/`, { question_id: questionId });
            setProblems(res.assessment.questions);
        } catch { alert('Failed to remove question'); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div className="p-4 md:p-12 space-y-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.push('/recruiter/assessments')} className="p-4 rounded-2xl bg-secondary border border-border transition-all hover:bg-emerald-500/10 hover:text-emerald-500 group">
                        <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient leading-none">Assessment Workspace</h1>
                        <p className="text-muted-foreground font-medium mt-1">Configure your evaluation flow and questions</p>
                    </div>
                </div>
            </div>

            {error && <div className="p-6 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                <HiOutlineXMark className="w-6 h-6" /> {error}
            </div>}
            {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-3">
                <HiOutlineCheckCircle className="w-6 h-6" /> {success}
            </motion.div>}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Left: Metadata */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-8 sticky top-24">
                        <div className="flex items-center gap-3 text-emerald-500">
                            <HiOutlineBeaker className="w-6 h-6" />
                            <h2 className="font-black text-sm uppercase tracking-widest">General Settings</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Assessment Title</label>
                                <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Instructions</label>
                                <textarea rows="4" value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Duration (m)</label>
                                    <input type="number" value={meta.duration_minutes} onChange={e => setMeta(m => ({ ...m, duration_minutes: Number(e.target.value) }))}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Pass (%)</label>
                                    <input type="number" value={meta.passing_score} onChange={e => setMeta(m => ({ ...m, passing_score: Number(e.target.value) }))}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSaveMeta} disabled={saving}
                            className="w-full py-5 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Update Settings
                        </button>
                    </div>
                </div>

                {/* Right: Problems */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Assessment Structure</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setIsBankOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary border border-border font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/5 hover:text-emerald-500 transition-all">
                                <HiOutlineSparkles className="w-4 h-4" /> From Bank
                            </button>
                            <button onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length })}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                                <HiOutlinePlus className="w-4 h-4" /> New Question
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {problems.length === 0 && !editingProblem && (
                            <div className="py-32 text-center glass rounded-[4rem] border-dashed border-2 border-border/50">
                                <HiOutlineBeaker className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter opacity-40">Workspace Empty</h3>
                                <p className="text-muted-foreground font-medium mt-2">Add at least one question to this assessment</p>
                            </div>
                        )}

                        {problems.map((p, i) => (
                            <div key={p.question_id || i} className="relative group">
                                {editingProblem?.question_id === p.question_id && p.question_id ? (
                                    <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                                ) : (
                                    <div className="glass border border-emerald-500/10 rounded-[2.5rem] p-8 flex items-center justify-between gap-6 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-lg font-black italic text-emerald-600 shrink-0">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold truncate max-w-[30ch]">{p.title}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase opacity-40">
                                                        {p.type === 'coding' && <HiOutlineCommandLine className="w-3.5 h-3.5" />}
                                                        {p.type === 'mcq' && <HiOutlineListBullet className="w-3.5 h-3.5" />}
                                                        {p.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5" />}
                                                        {p.type} · {p.marks} Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => setEditingProblem(p)} className="p-4 rounded-2xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-all">
                                                <HiOutlinePencilSquare className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteProblem(p.question_id)} className="p-4 rounded-2xl bg-secondary hover:bg-red-500/10 hover:text-red-400 border border-border transition-all">
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {editingProblem && !editingProblem.question_id && (
                            <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isBankOpen && (
                    <ProblemBankModal onSelect={handleSelectFromBank} onClose={() => setIsBankOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
