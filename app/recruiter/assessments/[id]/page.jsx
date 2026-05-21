'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineChevronLeft, HiOutlinePlus,
    HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBeaker,
    HiOutlineCheckCircle, HiOutlineListBullet, HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText, HiOutlineSparkles,
    HiOutlineCog6Tooth, HiOutlineArrowPath, HiOutlineDocumentText,
    HiOutlineClock, HiOutlineChartBar,
} from 'react-icons/hi2';
import ProblemForm from '@/components/assessments/ProblemForm';
import ProblemBankModal from '@/components/assessments/ProblemBankModal';
import AssessmentEditor from '@/components/assessments/AssessmentEditor';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import { DIFFICULTY_COLORS, EMPTY_PROBLEM } from '@/constants/shared';

const labelClass = 'flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground';
const inputClass = 'w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500';
const hintClass = 'px-1 text-xs leading-relaxed text-muted-foreground';

function SectionHeader({ icon: Icon, tone, title, count }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {count !== undefined && (
                <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
            )}
        </div>
    );
}

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

    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;

        const load = async () => {
            try {
                const data = await api.get(`/assessments/${id}/`);
                if (!isMounted) return;
                setAssessment(data);
                setMeta({ title: data.title, description: data.description || '', duration_minutes: data.duration_minutes, passing_score: data.passing_score });
                setProblems(data.questions || []);
            } catch {
                if (isMounted) setError('We could not load this assessment. Check your connection and try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, [id, attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

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
                const res = await api.patch(`/assessments/${id}/questions/${form.question_id}/`, payload);
                setProblems(res.assessment.questions);
            } else {
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

    if (loading) return <PageSkeleton stats={0} cards={2} />;

    if (!assessment && error) return (
        <div className="mx-auto w-full min-w-0 space-y-4 px-4 pb-16 pt-10 md:px-8">
            <FormError title="Could not load this assessment" message={error} />
            <button type="button" onClick={retry} title="Load this assessment again"
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary">
                <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
        </div>
    );

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 pt-10 md:px-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/recruiter/assessments')}
                    title="Back to assessments" aria-label="Back to assessments"
                    className="group shrink-0 rounded-xl border border-border bg-secondary p-3 transition-all hover:bg-emerald-500/10 hover:text-emerald-500">
                    <HiOutlineChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Assessment workspace</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Configure the evaluation flow and its questions.</p>
                </div>
            </div>

            {error && <FormError title="Something went wrong" message={error} />}
            {success && (
                <motion.div role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-sm font-semibold text-emerald-500">
                    <HiOutlineCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> {success}
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <div className="space-y-6 lg:col-span-1">
                    <div className="space-y-5 rounded-xl border border-border bg-card p-5 lg:p-6">
                        <SectionHeader icon={HiOutlineCog6Tooth} tone="bg-emerald-500/10 text-emerald-500" title="General settings" />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="edit-title" className={labelClass} title="The name candidates see">
                                    <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" /> Assessment title
                                </label>
                                <input id="edit-title" value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                                    className={inputClass} />
                                <p className={hintClass}>Shown to candidates at the top of the test.</p>
                            </div>
                            <div className="space-y-1.5">
                                <span className={labelClass} title="Shown to the candidate before they start">
                                    <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" /> Instructions
                                </span>
                                <AssessmentEditor value={meta.description} onChange={val => setMeta(m => ({ ...m, description: val }))} rows={4}
                                    placeholder="Outline the expectations for the candidate..." />
                                <p className={hintClass}>Rules, allowed tools and what the candidate must submit.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="edit-duration" className={labelClass} title="Time limit in minutes">
                                        <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" /> Minutes
                                    </label>
                                    <input id="edit-duration" type="number" value={meta.duration_minutes} onChange={e => setMeta(m => ({ ...m, duration_minutes: Number(e.target.value) }))}
                                        className={inputClass} />
                                    <p className={hintClass}>Time limit.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="edit-pass" className={labelClass} title="Minimum percentage to pass">
                                        <HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" /> Pass (%)
                                    </label>
                                    <input id="edit-pass" type="number" value={meta.passing_score} onChange={e => setMeta(m => ({ ...m, passing_score: Number(e.target.value) }))}
                                        className={inputClass} />
                                    <p className={hintClass}>Minimum to pass.</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSaveMeta} disabled={saving} title="Save the title, instructions, time limit and pass mark"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50">
                            {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                            Update settings
                        </button>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <SectionHeader icon={HiOutlineListBullet} tone="bg-blue-500/10 text-blue-500" title="Assessment structure" count={problems.length} />
                        <div className="flex gap-2">
                            <button onClick={() => setIsBankOpen(true)} title="Pick questions from your question bank"
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2 text-[10px] font-semibold uppercase tracking-widest transition-all hover:bg-emerald-500/5 hover:text-emerald-500">
                                <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" /> From bank
                            </button>
                            <button onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length })} title="Write a new question"
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95">
                                <HiOutlinePlus className="h-3.5 w-3.5" aria-hidden="true" /> New question
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {problems.length === 0 && !editingProblem && (
                            <EmptyState
                                icon={HiOutlineBeaker}
                                title="No questions yet"
                                text="Add at least one question so candidates have something to answer."
                            />
                        )}

                        {problems.map((p, i) => (
                            <div key={p.question_id || i} className="relative">
                                {editingProblem?.question_id === p.question_id && p.question_id ? (
                                    <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                                ) : (
                                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-emerald-500/30 lg:p-6">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-base font-semibold text-emerald-500" title={`Question ${i + 1}`}>
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="max-w-[30ch] truncate text-base font-semibold">{p.title}</h4>
                                                <div className="mt-1 flex flex-wrap items-center gap-2.5">
                                                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground/70">
                                                        {p.type === 'coding' && <HiOutlineCommandLine className="h-3.5 w-3.5" aria-hidden="true" />}
                                                        {p.type === 'mcq' && <HiOutlineListBullet className="h-3.5 w-3.5" aria-hidden="true" />}
                                                        {p.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="h-3.5 w-3.5" aria-hidden="true" />}
                                                        {p.type} &middot; {p.marks} Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <button onClick={() => setEditingProblem(p)} title="Edit this question" aria-label="Edit question"
                                                className="rounded-lg border border-border bg-secondary p-2.5 transition-all hover:bg-emerald-500/10 hover:text-emerald-500">
                                                <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                            <button onClick={() => handleDeleteProblem(p.question_id)} title="Remove from this assessment (it stays in the org pool)" aria-label="Remove question"
                                                className="rounded-lg border border-border bg-secondary p-2.5 transition-all hover:bg-red-500/10 hover:text-red-400">
                                                <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
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
