'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import {
    HiOutlineSparkles,
    HiOutlineCheckCircle,
    HiOutlinePlus,
    HiOutlineListBullet,
    HiOutlineCog6Tooth,
    HiOutlineLockClosed,
    HiOutlineBriefcase,
    HiOutlineClock,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlineFolderOpen,
    HiOutlineEye,
    HiOutlineArrowRight,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineBeaker,
    HiOutlineXMark,
} from 'react-icons/hi2';
import ProblemForm from '@/components/assessments/ProblemForm';
import ProblemBankModal from '@/components/assessments/ProblemBankModal';
import AssessmentEditor from '@/components/assessments/AssessmentEditor';
import { EMPTY_PROBLEM } from '@/constants/shared';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AssessmentCreateSkeleton from '@/components/skeletons/recruiter/AssessmentCreateSkeleton';
import AssessmentNotice from '@/components/assessments/AssessmentNotice';
import AssessmentJobSelector from '@/components/assessments/AssessmentJobSelector';
import AssessmentQuestionListItem from '@/components/assessments/AssessmentQuestionListItem';
import AssessmentQuestionPreview from '@/components/assessments/AssessmentQuestionPreview';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from '@/components/dashboard/EmptyState';
import { spring } from '@/constants/motion';
import { cardPadded, dangerButton, focusRing, iconTile, inputClass, hintClass, primaryButton, secondaryButton } from '@/components/ui/styles';

const labelClass = 'flex items-center gap-1.5 text-sm font-semibold text-emerald-950 dark:text-foreground';

const TABS = [
    { id: 'details', label: '1. Details', icon: HiOutlineCog6Tooth },
    { id: 'questions', label: '2. Questions', icon: HiOutlineListBullet },
];

// Error text from a thrown API object or Error.
const messageOf = (err, fallback) => (err && typeof err.message === 'string' && err.message) || fallback;

export default function CreateAssessmentPage() {
    const router = useRouter();
    const [myJobs, setMyJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState('');
    const [jobsAttempt, setJobsAttempt] = useState(0);

    const [tab, setTab] = useState('details');
    const [formError, setFormError] = useState('');
    const [notice, setNotice] = useState('');

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
    const [pending, setPending] = useState(null);

    // Ignore responses from a superseded request (retry or unmount).
    useEffect(() => {
        let ignore = false;
        api.get('/jobs/recruiter/')
            .then((data) => {
                if (ignore) return;
                setMyJobs(Array.isArray(data) ? data : []);
                setJobsError('');
            })
            .catch(() => {
                if (!ignore) setJobsError('We could not load your job openings. Check your connection and try again.');
            })
            .finally(() => {
                if (!ignore) setJobsLoading(false);
            });
        return () => { ignore = true; };
    }, [jobsAttempt]);

    // Success notices clear themselves; cleanup stops an older timer from hiding a newer message.
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(''), 3000);
        return () => clearTimeout(timer);
    }, [notice]);

    const retryJobs = () => {
        setJobsLoading(true);
        setJobsError('');
        setJobsAttempt((n) => n + 1);
    };

    // Replace the question list from an API response that carries assessment.questions.
    const applyQuestions = (res) => {
        const updated = res?.assessment?.questions;
        if (!Array.isArray(updated)) throw new Error('Saved, but the question list did not refresh. Reload the page to see it.');
        setProblems(updated);
    };

    const hasDraft = form.title.trim() !== '' || form.description.trim() !== '';

    const handleDiscard = () => {
        const leave = () => router.push('/recruiter/assessments');
        if (!hasDraft) return leave();
        setPending({ title: 'Discard this assessment?', description: 'Nothing you typed will be saved.', confirmLabel: 'Discard', run: leave });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!form.job) {
            setFormError('Choose the job opening this assessment belongs to.');
            return;
        }
        if (!form.title.trim()) {
            setFormError('Enter a title for the assessment.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                duration_minutes: Number(form.duration_minutes),
                passing_score: Number(form.passing_score),
                job: form.job,
            };

            const created = await api.post('/assessments/', payload);
            if (!created?.assessment_id) {
                throw new Error('The assessment was saved, but the response was incomplete. Open it from the assessments list.');
            }
            setAssessmentId(created.assessment_id);
            setProblems(Array.isArray(created.questions) ? created.questions : []);
            setNotice('Assessment saved. Now add some questions.');
            setTab('questions');
        } catch (err) {
            setFormError(messageOf(err, 'Failed to create the assessment. Try again.'));
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProblem = async (problemForm) => {
        setSavingProblem(true);
        setFormError('');
        try {
            const payload = { ...problemForm };
            if (payload.type !== 'coding') delete payload.coding_details;
            if (payload.type !== 'mcq') delete payload.mcq_details;
            if (payload.type !== 'subjective') delete payload.subjective_details;

            if (problemForm.question_id) {
                const res = await api.patch(`/assessments/${assessmentId}/questions/${problemForm.question_id}/`, payload);
                applyQuestions(res);
            } else {
                const res = await api.post(`/assessments/${assessmentId}/questions/add/`, payload);
                applyQuestions(res);
            }
            setEditingProblem(null);
            setNotice('Question saved.');
        } catch (err) {
            const message = messageOf(err, 'Failed to save the question. Try again.');
            setFormError(message);
            setEditingProblem((prev) => (prev ? { ...prev, error: message } : prev));
        } finally {
            setSavingProblem(false);
        }
    };

    const handleSelectFromBank = async (bankProb) => {
        setSavingProblem(true);
        setFormError('');
        try {
            const res = await api.post(`/assessments/${assessmentId}/questions/add/`, { question_id: bankProb.question_id });
            applyQuestions(res);
            setIsBankOpen(false);
            setNotice('Question added from your bank.');
        } catch (err) {
            setFormError(messageOf(err, 'Failed to add the question from the bank. Try again.'));
        } finally {
            setSavingProblem(false);
        }
    };

    const handleDeleteProblem = (questionId) =>
        setPending({
            title: 'Remove this question from the assessment?',
            description: 'You can add it back from the bank.',
            confirmLabel: 'Remove question',
            run: () => removeProblem(questionId),
        });

    const removeProblem = async (questionId) => {
        setFormError('');
        try {
            const res = await api.post(`/assessments/${assessmentId}/questions/remove/`, { question_id: questionId });
            applyQuestions(res);
            setEditingProblem((prev) => (prev?.question_id === questionId ? null : prev));
            setNotice('Question removed.');
        } catch (err) {
            setFormError(messageOf(err, 'Failed to remove the question. Try again.'));
        }
    };

    const questionsUnlocked = Boolean(assessmentId);
    const showNewForm = editingProblem && !editingProblem.question_id;

    if (jobsLoading) return <AssessmentCreateSkeleton />;

    const selectedJob = myJobs.find((j) => j.job_id === form.job);
    const summary = [
        { icon: HiOutlineDocumentText, label: 'Title', value: form.title.trim() },
        { icon: HiOutlineClock, label: 'Time limit', value: form.duration_minutes ? `${form.duration_minutes} min` : '' },
        { icon: HiOutlineChartBar, label: 'Passing score', value: form.passing_score ? `${form.passing_score}%` : '' },
        { icon: HiOutlineBriefcase, label: 'Job opening', value: selectedJob?.job_title },
        { icon: HiOutlineListBullet, label: 'Questions', value: questionsUnlocked ? String(problems.length) : '' },
    ];

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
            <PageHeader
                back={{ href: '/recruiter/assessments', label: 'All assessments' }}
                icon={HiOutlineBeaker}
                eyebrow="Assessments"
                title="New assessment"
                description="Set up the evaluation first, then add its questions."
            />

            <>
            <div role="tablist" aria-label="Assessment setup steps" className="grid grid-cols-2 gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 p-1.5 sm:inline-grid dark:border-white/10 dark:bg-white/5">
                {TABS.map((t) => {
                    const active = tab === t.id;
                    const disabled = t.id === 'questions' && !questionsUnlocked;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`tab-${t.id}`}
                            aria-selected={active}
                            aria-controls={`panel-${t.id}`}
                            disabled={disabled}
                            onClick={() => setTab(t.id)}
                            className={`relative flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none sm:px-6 ${focusRing} ${
                                active
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : disabled
                                        ? 'cursor-not-allowed text-emerald-700/60 dark:text-muted-foreground'
                                        : 'text-emerald-900/80 hover:bg-card/70 dark:text-muted-foreground dark:hover:bg-white/10'
                            }`}
                        >
                            {active && (
                                <motion.span layoutId="assessment-create-tab" transition={spring} className="absolute inset-0 rounded-md border border-emerald-100 bg-card shadow-sm dark:border-white/10 dark:bg-white/10" aria-hidden="true" />
                            )}
                            <t.icon className="relative h-4 w-4" aria-hidden="true" />
                            <span className="relative">{t.label}</span>
                            {disabled && <HiOutlineLockClosed className="relative h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>

            {!questionsUnlocked && (
                <p className={hintClass}>Save the details first to unlock questions.</p>
            )}

            {notice && <AssessmentNotice tone="success" message={notice} />}
            {formError && <AssessmentNotice title="Something went wrong" message={formError} />}

            {tab === 'details' && (
                <section id="panel-details" role="tabpanel" aria-labelledby="tab-details" className="grid gap-6 lg:grid-cols-12">
                    <div className={`${cardPadded} min-w-0 lg:col-span-8 2xl:col-span-9`}>
                    {jobsError && (
                        <div className="mb-6">
                            <AssessmentNotice title="Could not load job openings" message={jobsError} onRetry={retryJobs} />
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="assessment-title" className={labelClass}>
                                <HiOutlineDocumentText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Assessment title
                            </label>
                            <input
                                id="assessment-title"
                                required
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. Senior Frontend Engineer Test"
                                className={inputClass}
                            />
                            <p className={hintClass}>This is the name candidates see on their list of tests.</p>
                        </div>

                        <div className="space-y-2">
                            <span className={labelClass}>
                                <HiOutlineSparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Candidate instructions
                            </span>
                            <AssessmentEditor
                                value={form.description}
                                onChange={(val) => setForm((f) => ({ ...f, description: val }))}
                                rows={4}
                                placeholder="Outline the expectations for the candidate..."
                            />
                            <p className={hintClass}>Explain the rules, allowed tools and what the candidate must submit.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="assessment-duration" className={labelClass}>
                                    <HiOutlineClock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Time limit (minutes)
                                </label>
                                <input
                                    id="assessment-duration"
                                    type="number"
                                    required
                                    min="15"
                                    max="360"
                                    inputMode="numeric"
                                    value={form.duration_minutes}
                                    onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                                    className={inputClass}
                                />
                                <p className={hintClass}>Between 15 and 360 minutes.</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="assessment-pass" className={labelClass}>
                                    <HiOutlineChartBar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Passing score (%)
                                </label>
                                <input
                                    id="assessment-pass"
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    inputMode="numeric"
                                    value={form.passing_score}
                                    onChange={(e) => setForm((f) => ({ ...f, passing_score: e.target.value }))}
                                    className={inputClass}
                                />
                                <p className={hintClass}>Candidates who score at least this percentage pass.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className={labelClass}>
                                <HiOutlineBriefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Job opening
                            </span>
                            <AssessmentJobSelector
                                jobs={myJobs}
                                value={form.job}
                                loading={jobsLoading}
                                onChange={(val) => setForm((f) => ({ ...f, job: val }))}
                            />
                            <p className={hintClass}>Each assessment belongs to one job opening.</p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-emerald-100 pt-6 sm:flex-row sm:justify-end dark:border-white/10">
                            <button type="button" onClick={handleDiscard} className={secondaryButton}>
                                <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Discard
                            </button>
                            <button type="submit" disabled={saving} aria-busy={saving} className={primaryButton}>
                                {saving ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" /> Save and add questions
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    </div>

                    <aside className={`${cardPadded} space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:self-start 2xl:col-span-3`}>
                        <h2 className="flex items-center gap-3 text-base font-semibold text-foreground">
                            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                <HiOutlineEye className="h-4 w-4" aria-hidden="true" />
                            </span>
                            Summary
                        </h2>
                        <dl className="divide-y divide-border">
                            {summary.map((row) => (
                                <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                    <dt className="flex items-center gap-2 text-muted-foreground">
                                        <row.icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {row.label}
                                    </dt>
                                    <dd className="min-w-0 truncate text-right font-medium text-foreground">
                                        {row.value || <span className="text-muted-foreground">—</span>}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </aside>
                </section>
            )}

            {tab === 'questions' && questionsUnlocked && (
                <section id="panel-questions" role="tabpanel" aria-labelledby="tab-questions" className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h2 className="flex items-center gap-3 text-base font-semibold text-foreground">
                                <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                    <HiOutlineListBullet className="h-4 w-4" aria-hidden="true" />
                                </span>
                                Questions
                                <span className="rounded-sm bg-emerald-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-900/80 dark:bg-white/10 dark:text-muted-foreground">{problems.length}</span>
                            </h2>
                            <p className={`mt-1 ${hintClass}`}>Candidates answer in the order shown here.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:flex">
                            <button type="button" onClick={() => setIsBankOpen(true)} className={secondaryButton}>
                                <HiOutlineFolderOpen className="h-4 w-4" aria-hidden="true" /> From bank
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length })}
                                className={primaryButton}
                            >
                                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> New question
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        <div className="min-w-0 space-y-3 lg:col-span-7 2xl:col-span-8">
                            {problems.length === 0 && !editingProblem && (
                                <EmptyState
                                    icon={HiOutlineListBullet}
                                    title="No questions yet"
                                    text="Add at least one question to finish this assessment."
                                    action={
                                        <button type="button" onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: 0 })} className={secondaryButton}>
                                            <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Write a question
                                        </button>
                                    }
                                />
                            )}

                            {problems.map((p, i) => (
                                <div key={p.question_id ?? `q-${i}`}>
                                    {editingProblem?.question_id && editingProblem.question_id === p.question_id ? (
                                        <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                                    ) : (
                                        <AssessmentQuestionListItem problem={p} index={i} onEdit={setEditingProblem} onDelete={handleDeleteProblem} />
                                    )}
                                </div>
                            ))}

                            {showNewForm && (
                                <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                            )}
                        </div>

                        <div className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:col-span-5 2xl:col-span-4">
                            <h3 className="flex items-center gap-3 text-base font-semibold text-foreground">
                                <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                    <HiOutlineEye className="h-4 w-4" aria-hidden="true" />
                                </span>
                                Candidate preview
                            </h3>
                            {editingProblem ? (
                                <AssessmentQuestionPreview problem={editingProblem} />
                            ) : problems.length > 0 ? (
                                <div className="space-y-3">
                                    {problems.map((p, i) => (
                                        <AssessmentQuestionPreview key={p.question_id ?? `preview-${i}`} problem={p} />
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-lg border border-dashed border-emerald-200 px-4 py-8 text-center text-sm text-emerald-800/70 dark:border-white/15 dark:text-muted-foreground">
                                    Questions appear here as candidates will see them.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-emerald-100 pt-6 sm:flex-row sm:justify-end dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => router.push(`/recruiter/assessments/${assessmentId}`)}
                            className={secondaryButton}
                        >
                            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" /> Open full editor
                        </button>
                        <button type="button" onClick={() => router.push('/recruiter/assessments')} className={primaryButton}>
                            <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> Done
                        </button>
                    </div>

                    <AnimatePresence>
                        {isBankOpen && (
                            <ProblemBankModal onSelect={handleSelectFromBank} onClose={() => setIsBankOpen(false)} />
                        )}
                    </AnimatePresence>
                </section>
            )}

            </>

            <style>{`
                .prose-content h1 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h2 { font-size: 1.125rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h3 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content p  { font-size: 0.875rem; line-height: 1.625; margin: 0.5rem 0; }
                .prose-content ul { list-style: none; padding-left: 0; margin: 0.5rem 0; }
                .prose-content ul > li { position: relative; padding-left: 1.5rem; font-size: 0.875rem; line-height: 1.625; }
                .prose-content ul > li::before { content: ''; position: absolute; left: 0; top: 0.6em; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.45; }
                .prose-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
                .prose-content li { font-size: 0.875rem; line-height: 1.625; }
                .prose-content a  { color: var(--color-emerald-500); text-decoration: underline; text-underline-offset: 2px; }
                .prose-content a:hover { opacity: 0.8; }
                .prose-content pre {
                    background: color-mix(in srgb, var(--secondary) 80%, transparent);
                    border: 1px solid var(--border);
                    border-radius: 0.375rem;
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
                .prose-content pre code { color: var(--foreground); }
                .prose-content hr {
                    border: none;
                    border-top: 2px solid;
                    border-color: var(--border);
                    opacity: 0.5;
                    margin: 1rem 0;
                }
                .prose-content blockquote {
                    border-left: 3px solid var(--color-emerald-500);
                    padding-left: 1rem;
                    margin: 0.75rem 0;
                    font-style: italic;
                }
                .prose-content img { max-width: 100%; border-radius: 0.375rem; margin: 0.75rem 0; }
            `}</style>
            <ConfirmDialog
                open={pending !== null}
                title={pending?.title}
                description={pending?.description}
                confirmLabel={pending?.confirmLabel}
                confirmClassName={dangerButton}
                onConfirm={() => {
                    const { run } = pending;
                    setPending(null);
                    run();
                }}
                onCancel={() => setPending(null)}
            />
        </div>
    );
}
