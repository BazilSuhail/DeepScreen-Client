'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineChevronLeft,
    HiOutlineBeaker,
    HiOutlineSparkles,
    HiOutlineXMark,
    HiOutlineCheckCircle,
    HiOutlineChevronDown,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineListBullet,
    HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText,
} from 'react-icons/hi2';
import ProblemForm from '@/components/assessments/ProblemForm';
import ProblemBankModal from '@/components/assessments/ProblemBankModal';
import MarkdownEditor from '@/components/assessments/MarkdownEditor';
import { DIFFICULTY_COLORS, EMPTY_PROBLEM } from '@/constants/shared';

function JobSelector({ jobs, value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = jobs.find(j => j.job_id === value);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold text-left cursor-pointer">
                <span className={selected ? '' : 'opacity-40'}>{selected ? selected.job_title : 'Select a Job'}</span>
                <HiOutlineChevronDown className={`w-5 h-5 opacity-40 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 mt-2 w-full bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {jobs.length === 0 && (
                                <div className="px-6 py-4 text-sm font-medium opacity-40 text-center">No jobs available</div>
                            )}
                            {jobs.map(job => (
                                <button key={job.job_id} type="button" onClick={() => { onChange(job.job_id); setOpen(false); }}
                                    className={`w-full text-left px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all ${
                                        value === job.job_id
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'hover:bg-secondary border border-transparent'
                                    }`}>
                                    {job.job_title}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProblemListCard({ problem, index, onEdit, onDelete }) {
    return (
        <div className="glass border border-emerald-500/10 rounded-[2.5rem] p-8 flex items-center justify-between gap-6 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-lg font-black italic text-emerald-600 shrink-0">
                    {index + 1}
                </div>
                <div>
                    <h4 className="text-xl font-bold truncate max-w-[30ch]">{problem.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${DIFFICULTY_COLORS[problem.difficulty]}`}>{problem.difficulty}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase opacity-40">
                            {problem.type === 'coding' && <HiOutlineCommandLine className="w-3.5 h-3.5" />}
                            {problem.type === 'mcq' && <HiOutlineListBullet className="w-3.5 h-3.5" />}
                            {problem.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5" />}
                            {problem.type} · {problem.marks} Marks
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <button onClick={() => onEdit(problem)} className="p-4 rounded-2xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-all">
                    <HiOutlinePencilSquare className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(problem.question_id)} className="p-4 rounded-2xl bg-secondary hover:bg-red-500/10 hover:text-red-400 border border-border transition-all">
                    <HiOutlineTrash className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default function CreateAssessmentPage() {
    const router = useRouter();
    const [myJobs, setMyJobs] = useState([]);
    const [tab, setTab] = useState('details');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Details
    const [form, setForm] = useState({
        title: '',
        description: '',
        duration_minutes: 90,
        passing_score: 70,
        job: '',
    });
    const [saving, setSaving] = useState(false);

    // Step 2: Questions
    const [assessmentId, setAssessmentId] = useState(null);
    const [problems, setProblems] = useState([]);
    const [editingProblem, setEditingProblem] = useState(null);
    const [savingProblem, setSavingProblem] = useState(false);
    const [isBankOpen, setIsBankOpen] = useState(false);

    useEffect(() => {
        api.get('/jobs/recruiter/')
            .then(setMyJobs)
            .catch(() => setError('Failed to load jobs'));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (!form.job) throw new Error('You must select a job to create an assessment.');

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                duration_minutes: Number(form.duration_minutes),
                passing_score: Number(form.passing_score),
                job: form.job,
            };

            const newAssessment = await api.post('/assessments/', payload);
            setAssessmentId(newAssessment.assessment_id);
            setProblems(newAssessment.questions || []);
            setSuccess('Assessment created! Now add some questions.');
            setTimeout(() => setSuccess(''), 3000);
            setTab('questions');
        } catch (err) {
            setError(err.message || 'Failed to create assessment');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProblem = async (problemForm) => {
        setSavingProblem(true);
        try {
            const payload = { ...problemForm };
            if (payload.type !== 'coding') delete payload.coding_details;
            if (payload.type !== 'mcq') delete payload.mcq_details;
            if (payload.type !== 'subjective') delete payload.subjective_details;

            if (problemForm.question_id) {
                const res = await api.patch(`/assessments/${assessmentId}/questions/${problemForm.question_id}/`, payload);
                setProblems(res.assessment.questions);
            } else {
                const res = await api.post(`/assessments/${assessmentId}/questions/add/`, payload);
                setProblems(res.assessment.questions);
            }
            setEditingProblem(null);
            setSuccess('Question saved successfully!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Failed to save question');
            if (editingProblem) setEditingProblem(prev => ({ ...prev, error: e.message }));
        } finally {
            setSavingProblem(false);
        }
    };

    const handleSelectFromBank = async (bankProb) => {
        setSavingProblem(true);
        try {
            const res = await api.post(`/assessments/${assessmentId}/questions/add/`, { question_id: bankProb.question_id });
            setProblems(res.assessment.questions);
            setIsBankOpen(false);
            setSuccess('Question added from bank!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Failed to add question from bank');
        } finally {
            setSavingProblem(false);
        }
    };

    const handleDeleteProblem = async (questionId) => {
        if (!confirm('Remove this question from the assessment?')) return;
        try {
            const res = await api.post(`/assessments/${assessmentId}/questions/remove/`, { question_id: questionId });
            setProblems(res.assessment.questions);
        } catch {
            setError('Failed to remove question');
        }
    };

    const tabs = [
        { id: 'details', label: 'Details', icon: HiOutlineBeaker },
        { id: 'questions', label: 'Questions', icon: HiOutlineListBullet, disabled: !assessmentId },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => router.push('/recruiter/assessments')}
                    className="p-4 rounded-2xl bg-secondary border border-border transition-all hover:bg-emerald-500/10 hover:text-emerald-500 group">
                    <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient leading-none">New Assessment</h1>
                    <p className="text-muted-foreground font-medium">Set up the evaluation and configure questions</p>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                    <HiOutlineXMark className="w-6 h-6" /> {error}
                </motion.div>
            )}
            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-3">
                    <HiOutlineCheckCircle className="w-6 h-6" /> {success}
                </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-[2rem] border border-border w-fit">
                {tabs.map(t => {
                    const active = tab === t.id;
                    return (
                        <button key={t.id} type="button" disabled={t.disabled}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                                active
                                    ? 'bg-white dark:bg-slate-800 shadow-lg text-emerald-600'
                                    : t.disabled
                                        ? 'opacity-30 cursor-not-allowed'
                                        : 'text-muted-foreground hover:text-emerald-500 hover:bg-white/30'
                            }`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab: Details */}
            {tab === 'details' && (
                <form onSubmit={handleCreate} className="space-y-8 max-w-2xl">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Assessment Title</label>
                        <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Senior Frontend Engineer Test"
                            className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold text-lg" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Candidate Instructions</label>
                        <MarkdownEditor value={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} rows={4}
                            placeholder="Outline the expectations for the candidate..." />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Duration (min)</label>
                            <input type="number" min="15" max="360" value={form.duration_minutes}
                                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                                className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Pass Threshold (%)</label>
                            <input type="number" min="1" max="100" value={form.passing_score}
                                onChange={e => setForm(f => ({ ...f, passing_score: e.target.value }))}
                                className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Link to Job Opening (Required)</label>
                        <JobSelector jobs={myJobs} value={form.job} onChange={val => setForm(f => ({ ...f, job: val }))} />
                        <p className="text-xs text-muted-foreground px-3">Each assessment is uniquely tied to a specific job.</p>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={() => router.push('/recruiter/assessments')}
                            className="px-10 py-5 rounded-[2rem] bg-secondary hover:bg-secondary/80 font-black text-xs uppercase tracking-widest transition-all">
                            Discard
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-10 py-5 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                            {saving
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><HiOutlineSparkles className="w-5 h-5" /> Save & Continue</>
                            }
                        </button>
                    </div>
                </form>
            )}

            {/* Tab: Questions */}
            {tab === 'questions' && (
                <div className="space-y-8">
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
                                    <ProblemListCard problem={p} index={i} onEdit={setEditingProblem} onDelete={handleDeleteProblem} />
                                )}
                            </div>
                        ))}

                        {editingProblem && !editingProblem.question_id && (
                            <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button onClick={() => router.push(`/recruiter/assessments/${assessmentId}`)}
                            className="flex items-center gap-2 px-10 py-5 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/20 transition-all active:scale-95">
                            <HiOutlineCheckCircle className="w-5 h-5" /> Done — Edit Full Assessment
                        </button>
                    </div>

                    <AnimatePresence>
                        {isBankOpen && (
                            <ProblemBankModal onSelect={handleSelectFromBank} onClose={() => setIsBankOpen(false)} />
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
