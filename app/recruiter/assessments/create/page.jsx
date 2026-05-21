'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineChevronLeft,
    HiOutlineBeaker,
    HiOutlineSparkles,
    HiOutlineCheckCircle,
    HiOutlineChevronDown,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineListBullet,
    HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineChartBar,
    HiOutlineCog6Tooth,
    HiOutlineBriefcase,
    HiOutlineArrowPath,
    HiOutlineDocumentText,
    HiOutlineClock,
} from 'react-icons/hi2';
import ProblemForm from '@/components/assessments/ProblemForm';
import ProblemBankModal from '@/components/assessments/ProblemBankModal';
import AssessmentEditor from '@/components/assessments/AssessmentEditor';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import { DIFFICULTY_COLORS, EMPTY_PROBLEM } from '@/constants/shared';

const labelClass = 'flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground';
const inputClass = 'w-full rounded-xl border border-border bg-secondary/30 px-5 py-3.5 font-semibold outline-none transition-all focus:border-emerald-500';
const hintClass = 'px-1 text-xs leading-relaxed text-muted-foreground';

function SectionHeader({ icon: Icon, tone, title, count }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            {count !== undefined && (
                <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
            )}
        </div>
    );
}

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
                aria-haspopup="listbox"
                aria-expanded={open}
                title="Choose the job opening this assessment belongs to"
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-secondary/30 px-5 py-3.5 text-left text-sm font-semibold outline-none transition-all focus:border-emerald-500">
                <span className={`flex min-w-0 items-center gap-2 ${selected ? '' : 'text-muted-foreground'}`}>
                    <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{selected ? selected.job_title : 'Select a job'}</span>
                </span>
                <HiOutlineChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        role="listbox"
                        className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                        <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                            {jobs.length === 0 && (
                                <div className="px-4 py-3 text-center text-sm text-muted-foreground">No jobs available. Post a job first.</div>
                            )}
                            {jobs.map(job => (
                                <button key={job.job_id} type="button" role="option" aria-selected={value === job.job_id}
                                    onClick={() => { onChange(job.job_id); setOpen(false); }}
                                    className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all ${
                                        value === job.job_id
                                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                                            : 'border border-transparent hover:bg-secondary'
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
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-emerald-500/30 lg:p-6">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-base font-semibold text-emerald-500" title={`Question ${index + 1}`}>
                    {index + 1}
                </div>
                <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold">{problem.title}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${DIFFICULTY_COLORS[problem.difficulty]}`}>{problem.difficulty}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground/70">
                            {problem.type === 'coding' && <HiOutlineCommandLine className="h-3.5 w-3.5" aria-hidden="true" />}
                            {problem.type === 'mcq' && <HiOutlineListBullet className="h-3.5 w-3.5" aria-hidden="true" />}
                            {problem.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="h-3.5 w-3.5" aria-hidden="true" />}
                            {problem.type} &middot; {problem.marks} Marks
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
                <button onClick={() => onEdit(problem)} title="Edit this question" aria-label="Edit question"
                    className="rounded-lg border border-border bg-secondary p-2.5 transition-all hover:bg-emerald-500/10 hover:text-emerald-500">
                    <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
                </button>
                <button onClick={() => onDelete(problem.question_id)} title="Remove from this assessment" aria-label="Remove question"
                    className="rounded-lg border border-border bg-secondary p-2.5 transition-all hover:bg-red-500/10 hover:text-red-400">
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

export default function CreateAssessmentPage() {
    const router = useRouter();
    const [myJobs, setMyJobs] = useState([]);
    const [jobsFailed, setJobsFailed] = useState(false);
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

    const loadJobs = () => {
        setJobsFailed(false);
        api.get('/jobs/recruiter/')
            .then(setMyJobs)
            .catch(() => { setJobsFailed(true); setError('Failed to load jobs'); });
    };

    useEffect(() => { loadJobs(); }, []);

    const retryJobs = () => {
        setError('');
        loadJobs();
    };

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

    function QuestionPreview({ problem }) {
        const coding = problem.coding_details;
        const mcq = problem.mcq_details;
        const subj = problem.subjective_details;
        return (
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 lg:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-base font-semibold text-muted-foreground" title="Question preview">#</div>
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold">{problem.title || 'Untitled question'}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${DIFFICULTY_COLORS[problem.difficulty] || ''}`}>{problem.difficulty || 'medium'}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground/70">
                                {problem.type === 'coding' && <HiOutlineCommandLine className="h-3.5 w-3.5" aria-hidden="true" />}
                                {problem.type === 'mcq' && <HiOutlineListBullet className="h-3.5 w-3.5" aria-hidden="true" />}
                                {problem.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="h-3.5 w-3.5" aria-hidden="true" />}
                                {problem.type} &middot; {problem.marks || 0} Marks
                            </span>
                        </div>
                    </div>
                </div>
                {problem.description && (
                    <div className="prose-content line-clamp-4 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: problem.description }} />
                )}
                {problem.type === 'coding' && coding?.testCases?.length > 0 && (
                    <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                            <HiOutlineCommandLine className="h-3.5 w-3.5" aria-hidden="true" /> Test cases ({coding.testCases.length})
                        </p>
                        <div className="grid gap-2">
                            {coding.testCases.slice(0, 2).map((tc, i) => (
                                <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 font-mono text-xs">
                                    <div className="mb-1 text-[9px] font-semibold uppercase text-muted-foreground/60">{tc.isHidden ? 'Hidden' : 'Visible'} case {i + 1}</div>
                                    <div className="truncate text-muted-foreground">In: {tc.input || '—'}</div>
                                    <div className="truncate text-muted-foreground">Out: {tc.expectedOutput || '—'}</div>
                                </div>
                            ))}
                            {coding.testCases.length > 2 && <div className="text-[10px] font-semibold text-muted-foreground/60">+{coding.testCases.length - 2} more</div>}
                        </div>
                    </div>
                )}
                {problem.type === 'mcq' && mcq?.options?.length > 0 && (
                    <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                            <HiOutlineListBullet className="h-3.5 w-3.5" aria-hidden="true" /> Options ({mcq.options.length})
                        </p>
                        <div className="grid gap-1.5">
                            {mcq.options.map((opt, i) => (
                                <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 text-xs ${opt.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-border bg-secondary/30 text-muted-foreground'}`}>
                                    <div className={`flex h-4 w-4 items-center justify-center rounded border-2 ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-border'}`}>
                                        {opt.isCorrect && <HiOutlineCheckCircle className="h-3 w-3 text-white" aria-hidden="true" />}
                                    </div>
                                    <span className="truncate">{opt.text || `Option ${i + 1}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {problem.type === 'subjective' && subj?.modelAnswer && (
                    <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                            <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" /> Model answer
                        </p>
                        <div className="line-clamp-3 text-sm text-muted-foreground">{subj.modelAnswer}</div>
                    </div>
                )}
            </div>
        );
    }

    const tabs = [
        { id: 'details', label: 'Details', icon: HiOutlineCog6Tooth, hint: 'Title, instructions, timing and job' },
        { id: 'questions', label: 'Questions', icon: HiOutlineListBullet, disabled: !assessmentId, hint: assessmentId ? 'Add and arrange questions' : 'Save the details first to add questions' },
    ];

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 pt-10 md:px-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/recruiter/assessments')}
                    title="Back to assessments" aria-label="Back to assessments"
                    className="group shrink-0 rounded-xl border border-border bg-secondary p-3 transition-all hover:bg-emerald-500/10 hover:text-emerald-500">
                    <HiOutlineChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">New assessment</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Set up the evaluation first, then add its questions.</p>
                </div>
            </div>

            {error && (
                <div className="space-y-3">
                    <FormError title={jobsFailed ? 'Could not load your jobs' : 'Something went wrong'} message={error} />
                    {jobsFailed && (
                        <button type="button" onClick={retryJobs} title="Load your jobs again"
                            className="-mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary">
                            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                        </button>
                    )}
                </div>
            )}
            {success && (
                <motion.div role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-sm font-semibold text-emerald-500">
                    <HiOutlineCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> {success}
                </motion.div>
            )}

            <div role="tablist" className="flex w-full gap-1.5 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-1 sm:w-fit">
                {tabs.map(t => {
                    const active = tab === t.id;
                    return (
                        <button key={t.id} type="button" role="tab" aria-selected={active} disabled={t.disabled}
                            onClick={() => setTab(t.id)}
                            title={t.hint}
                            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all sm:flex-none sm:px-5 ${
                                active
                                    ? 'border border-border bg-card text-emerald-500 shadow-sm'
                                    : t.disabled
                                        ? 'cursor-not-allowed opacity-40'
                                        : 'text-muted-foreground hover:bg-card/50 hover:text-emerald-500'
                            }`}>
                            <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'details' && (
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="assessment-title" className={labelClass} title="The name candidates see for this test">
                            <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" /> Assessment title
                        </label>
                        <input id="assessment-title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Senior Frontend Engineer Test"
                            className={`${inputClass} text-base`} />
                        <p className={hintClass}>This is the name candidates see on their list of tests.</p>
                    </div>

                    <div className="space-y-2">
                        <span className={labelClass} title="Shown to the candidate before they start">
                            <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" /> Candidate instructions
                        </span>
                        <AssessmentEditor value={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} rows={4}
                            placeholder="Outline the expectations for the candidate..." />
                        <p className={hintClass}>Explain the rules, allowed tools and what the candidate must submit.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="assessment-duration" className={labelClass} title="How long the candidate has to finish">
                                <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" /> Duration (min)
                            </label>
                            <input id="assessment-duration" type="number" min="15" max="360" value={form.duration_minutes}
                                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                                className={inputClass} />
                            <p className={hintClass}>Between 15 and 360 minutes.</p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="assessment-pass" className={labelClass} title="Minimum score to pass">
                                <HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" /> Pass threshold (%)
                            </label>
                            <input id="assessment-pass" type="number" min="1" max="100" value={form.passing_score}
                                onChange={e => setForm(f => ({ ...f, passing_score: e.target.value }))}
                                className={inputClass} />
                            <p className={hintClass}>Candidates who score at least this percentage pass.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className={labelClass} title="Each assessment belongs to one job opening">
                            <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> Job opening (required)
                        </span>
                        <JobSelector jobs={myJobs} value={form.job} onChange={val => setForm(f => ({ ...f, job: val }))} />
                        <p className={hintClass}>Each assessment is tied to one job opening.</p>
                    </div>

                    <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
                        <button type="button" onClick={() => router.push('/recruiter/assessments')}
                            title="Leave without saving"
                            className="rounded-xl bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all hover:bg-secondary/80">
                            Discard
                        </button>
                        <button type="submit" disabled={saving}
                            title="Create the assessment and add questions"
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50">
                            {saving
                                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                : <><HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Save & continue</>
                            }
                        </button>
                    </div>
                </form>
            )}

            {tab === 'questions' && (
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <SectionHeader icon={HiOutlineListBullet} tone="bg-emerald-500/10 text-emerald-500" title="Assessment structure" count={problems.length} />
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
                    <p className={hintClass}>Add at least one question. Questions are scored in the order shown here.</p>

                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                        <div className="min-w-0 space-y-4">
                            {problems.length === 0 && !editingProblem && (
                                <EmptyState
                                    icon={HiOutlineBeaker}
                                    title="No questions yet"
                                    text="Use New question to write one, or From bank to reuse an existing question."
                                />
                            )}

                            {problems.map((p, i) => (
                                <div key={p.question_id || i} className="relative">
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

                        <div className="sticky top-6 min-w-0 space-y-4">
                            <SectionHeader icon={HiOutlineChartBar} tone="bg-blue-500/10 text-blue-500" title="Preview" />
                            {editingProblem ? (
                                <QuestionPreview problem={editingProblem} />
                            ) : problems.length > 0 ? (
                                <div className="space-y-3">
                                    {problems.map((p, i) => (
                                        <QuestionPreview key={p.question_id || i} problem={p} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={HiOutlineDocumentText} title="Nothing to preview" text="Questions appear here as candidates will see them." />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button onClick={() => router.push(`/recruiter/assessments/${assessmentId}`)}
                            title="Open the full editor for this assessment"
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95">
                            <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> Done — edit full assessment
                        </button>
                    </div>

                    <AnimatePresence>
                        {isBankOpen && (
                            <ProblemBankModal onSelect={handleSelectFromBank} onClose={() => setIsBankOpen(false)} />
                        )}
                    </AnimatePresence>
                </div>
            )}

            <style>{`
                .prose-content h1 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h2 { font-size: 1.125rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h3 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content p  { font-size: 0.875rem; line-height: 1.625; margin: 0.5rem 0; color: var(--muted-foreground); }
                .prose-content ul { list-style: none; padding-left: 0; margin: 0.5rem 0; }
                .prose-content ul > li { position: relative; padding-left: 1.5rem; font-size: 0.875rem; line-height: 1.625; }
                .prose-content ul > li::before { content: ''; position: absolute; left: 0; top: 0.6em; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.45; }
                .prose-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
                .prose-content li { font-size: 0.875rem; line-height: 1.625; }
                .prose-content a  { color: #10b981; text-decoration: underline; text-underline-offset: 2px; }
                .prose-content a:hover { opacity: 0.8; }
                .prose-content pre {
                    background: color-mix(in srgb, var(--secondary) 80%, transparent);
                    border: 1px solid var(--border);
                    border-radius: 1rem;
                    padding: 1.25rem;
                    margin: 0.75rem 0;
                    overflow-x: auto;
                }
                .prose-content code {
                    font-family: ui-monospace, monospace;
                    font-size: 0.75rem;
                    line-height: 1.625;
                    color: var(--foreground);
                }
                .prose-content pre code {
                    color: var(--foreground);
                }
                .prose-content hr {
                    border: none;
                    border-top: 2px solid;
                    border-color: var(--border);
                    opacity: 0.5;
                    margin: 1rem 0;
                }
                .prose-content blockquote {
                    border-left: 3px solid #10b981;
                    padding-left: 1rem;
                    margin: 0.75rem 0;
                    color: var(--muted-foreground);
                    font-style: italic;
                }
                .prose-content img { max-width: 100%; border-radius: 0.75rem; margin: 0.75rem 0; }
            `}</style>
        </div>
    );
}
