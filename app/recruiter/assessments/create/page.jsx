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
    HiOutlineClock,
    HiOutlineChartBar,
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
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold text-left cursor-pointer text-sm">
                <span className={selected ? '' : 'text-muted-foreground'}>{selected ? selected.job_title : 'Select a Job'}</span>
                <HiOutlineChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 mt-2 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                        <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                            {jobs.length === 0 && (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">No jobs available</div>
                            )}
                            {jobs.map(job => (
                                <button key={job.job_id} type="button" onClick={() => { onChange(job.job_id); setOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${
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
        <div className="bg-card border border-border hover:border-emerald-500/30 rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-base font-bold text-emerald-500 shrink-0">
                    {index + 1}
                </div>
                <div className="min-w-0">
                    <h4 className="text-base font-bold truncate max-w-[30ch]">{problem.title}</h4>
                    <div className="flex items-center gap-2.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${DIFFICULTY_COLORS[problem.difficulty]}`}>{problem.difficulty}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground/60">
                            {problem.type === 'coding' && <HiOutlineCommandLine className="w-3.5 h-3.5" />}
                            {problem.type === 'mcq' && <HiOutlineListBullet className="w-3.5 h-3.5" />}
                            {problem.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5" />}
                            {problem.type} &middot; {problem.marks} Marks
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
                <button onClick={() => onEdit(problem)} className="p-2.5 rounded-lg bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-all">
                    <HiOutlinePencilSquare className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(problem.question_id)} className="p-2.5 rounded-lg bg-secondary hover:bg-red-500/10 hover:text-red-400 border border-border transition-all">
                    <HiOutlineTrash className="w-4 h-4" />
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

    const [form, setForm] = useState({
        title: '',
        description: '',
        duration_minutes: 90,
        passing_score: 70,
        job: '',
    });
    const [saving, setSaving] = useState(false);

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
        { id: 'details', label: 'Details', icon: HiOutlineChartBar },
        { id: 'questions', label: 'Questions', icon: HiOutlineListBullet, disabled: !assessmentId },
    ];

    return (
        <div className="w-full px-4 md:px-6 space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/recruiter/assessments')}
                    className="p-3 rounded-xl bg-secondary border border-border transition-all hover:bg-emerald-500/10 hover:text-emerald-500 group">
                    <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">New Assessment</h1>
                    <p className="text-muted-foreground mt-1">Set up the evaluation and configure questions</p>
                </div>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold flex items-center gap-2.5">
                    <HiOutlineXMark className="w-5 h-5" /> {error}
                </motion.div>
            )}
            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-2.5">
                    <HiOutlineCheckCircle className="w-5 h-5" /> {success}
                </motion.div>
            )}

            <div className="flex gap-1.5 p-1 bg-secondary/50 rounded-xl border border-border w-fit">
                {tabs.map(t => {
                    const active = tab === t.id;
                    return (
                        <button key={t.id} type="button" disabled={t.disabled}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                active
                                    ? 'bg-card shadow-sm text-emerald-500 border border-border'
                                    : t.disabled
                                        ? 'opacity-30 cursor-not-allowed'
                                        : 'text-muted-foreground hover:text-emerald-500 hover:bg-card/50'
                            }`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'details' && (
                <form onSubmit={handleCreate} className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Assessment Title</label>
                        <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Senior Frontend Engineer Test"
                            className="w-full px-5 py-3.5 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold text-base" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Candidate Instructions</label>
                        <MarkdownEditor value={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} rows={4}
                            placeholder="Outline the expectations for the candidate..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Duration (min)</label>
                            <input type="number" min="15" max="360" value={form.duration_minutes}
                                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                                className="w-full px-5 py-3.5 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Pass Threshold (%)</label>
                            <input type="number" min="1" max="100" value={form.passing_score}
                                onChange={e => setForm(f => ({ ...f, passing_score: e.target.value }))}
                                className="w-full px-5 py-3.5 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Link to Job Opening (Required)</label>
                        <JobSelector jobs={myJobs} value={form.job} onChange={val => setForm(f => ({ ...f, job: val }))} />
                        <p className="text-xs text-muted-foreground px-1">Each assessment is uniquely tied to a specific job.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => router.push('/recruiter/assessments')}
                            className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-xs uppercase tracking-widest transition-all">
                            Discard
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                            {saving
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><HiOutlineSparkles className="w-4 h-4" /> Save & Continue</>
                            }
                        </button>
                    </div>
                </form>
            )}

            {tab === 'questions' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Assessment Structure</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setIsBankOpen(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary border border-border font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/5 hover:text-emerald-500 transition-all">
                                <HiOutlineSparkles className="w-3.5 h-3.5" /> From Bank
                            </button>
                            <button onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length })}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/20 transition-all active:scale-95">
                                <HiOutlinePlus className="w-3.5 h-3.5" /> New Question
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {problems.length === 0 && !editingProblem && (
                            <div className="py-24 text-center bg-card border border-dashed border-border rounded-2xl">
                                <HiOutlineBeaker className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-muted-foreground/60">Workspace Empty</h3>
                                <p className="text-muted-foreground text-sm mt-1">Add at least one question to this assessment</p>
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

                    <div className="flex justify-end pt-2">
                        <button onClick={() => router.push(`/recruiter/assessments/${assessmentId}`)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                            <HiOutlineCheckCircle className="w-4 h-4" /> Done — Edit Full Assessment
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
