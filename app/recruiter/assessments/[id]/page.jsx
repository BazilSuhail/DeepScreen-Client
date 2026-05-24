'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineBeaker, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash,
    HiOutlineListBullet, HiOutlineCommandLine, HiOutlineChatBubbleBottomCenterText,
    HiOutlineSparkles, HiOutlineCog6Tooth, HiOutlineDocumentText, HiOutlineClock,
    HiOutlineChartBar, HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineArchiveBox,
} from 'react-icons/hi2';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/assessments/AssessmentBadge';
import AssessmentDetailSkeleton from '@/components/skeletons/recruiter/AssessmentDetailSkeleton';
import ProblemForm from '@/components/assessments/ProblemForm';
import ProblemBankModal from '@/components/assessments/ProblemBankModal';
import AssessmentEditor from '@/components/assessments/AssessmentEditor';
import AssessmentNotice from '@/components/assessments/AssessmentNotice';
import { EMPTY_PROBLEM } from '@/constants/shared';
import {
    SectionTitle, Alert, EmptyState,
    card, btnPrimary, btnSecondary, btnIcon, btnDangerIcon, inputClass,
} from '@/components/assessments/SubmissionUi';
import { dangerButton, hintClass } from '@/components/ui/styles';

const labelClass = 'flex items-center gap-1.5 text-sm font-medium text-emerald-900 dark:text-foreground';

const DIFFICULTY_META = {
    easy: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
    medium: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
    hard: 'text-red-800 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20',
};

const TYPE_ICON = {
    coding: HiOutlineCommandLine,
    mcq: HiOutlineListBullet,
    subjective: HiOutlineChatBubbleBottomCenterText,
};

export default function AssessmentEditPage() {
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
    const [attempt, setAttempt] = useState(0);
    const [pending, setPending] = useState(null);
    const [meta, setMeta] = useState({ title: '', description: '', duration_minutes: 90, passing_score: 70 });

    const flashTimer = useRef(null);
    const newQuestionRef = useRef(null);

    useEffect(() => () => clearTimeout(flashTimer.current), []);

    const flash = (message) => {
        clearTimeout(flashTimer.current);
        setSuccess(message);
        flashTimer.current = setTimeout(() => setSuccess(''), 2500);
    };

    useEffect(() => {
        if (editingProblem && !editingProblem.question_id) {
            newQuestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [editingProblem]);

    useEffect(() => {
        if (!id) return;
        let active = true;

        api.get(`/assessments/${id}/`)
            .then((data) => {
                if (!active) return;
                setAssessment(data);
                setMeta({
                    title: data?.title ?? '',
                    description: data?.description || '',
                    duration_minutes: data?.duration_minutes ?? 90,
                    passing_score: data?.passing_score ?? 70,
                });
                setProblems(Array.isArray(data?.questions) ? data.questions : []);
                setError('');
            })
            .catch(() => {
                if (active) setError('We could not load this assessment. Check your connection and try again.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [id, attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const handleSaveMeta = async () => {
        setSaving(true);
        setError('');
        try {
            await api.patch(`/assessments/${id}/`, meta);
            flash('Assessment settings updated.');
        } catch (e) {
            setError(e?.message || 'Could not save the settings. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProblem = async (form) => {
        setSavingProblem(true);
        setError('');
        try {
            const payload = { ...form };
            if (payload.type !== 'coding') delete payload.coding_details;
            if (payload.type !== 'mcq') delete payload.mcq_details;
            if (payload.type !== 'subjective') delete payload.subjective_details;

            const res = form.question_id
                ? await api.patch(`/assessments/${id}/questions/${form.question_id}/`, payload)
                : await api.post(`/assessments/${id}/questions/add/`, payload);
            setProblems(Array.isArray(res?.assessment?.questions) ? res.assessment.questions : []);
            setEditingProblem(null);
            flash('Question saved.');
        } catch (e) {
            const message = e?.message || 'Could not save the question. Try again.';
            setError(message);
            setEditingProblem((prev) => (prev ? { ...prev, error: message } : prev));
        } finally {
            setSavingProblem(false);
        }
    };

    const handleSelectFromBank = async (bankProb) => {
        setSavingProblem(true);
        setError('');
        try {
            const res = await api.post(`/assessments/${id}/questions/add/`, { question_id: bankProb.question_id });
            setProblems(Array.isArray(res?.assessment?.questions) ? res.assessment.questions : []);
            setIsBankOpen(false);
            flash('Question added from the bank.');
        } catch (e) {
            setError(e?.message || 'Could not add the question from the bank. Try again.');
        } finally {
            setSavingProblem(false);
        }
    };

    const handleDeleteProblem = (questionId) =>
        setPending({
            title: 'Remove this question from the assessment?',
            description: 'It stays in the organization pool.',
            confirmLabel: 'Remove question',
            run: () => removeProblem(questionId),
        });

    const removeProblem = async (questionId) => {
        setError('');
        try {
            const res = await api.post(`/assessments/${id}/questions/remove/`, { question_id: questionId });
            setProblems(Array.isArray(res?.assessment?.questions) ? res.assessment.questions : []);
            flash('Question removed.');
        } catch (e) {
            setError(e?.message || 'Could not remove the question. Try again.');
        }
    };

    const canSaveSettings = !saving && meta.title.trim().length > 0;

    if (loading) return <AssessmentDetailSkeleton />;

    const chip = 'inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-white/5 dark:text-muted-foreground';

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
            <PageHeader
                back={{ href: '/recruiter/assessments', label: 'All assessments' }}
                icon={HiOutlineBeaker}
                eyebrow="Assessment"
                title={assessment ? (assessment.title || 'Untitled assessment') : 'Assessment unavailable'}
                description="Configure the settings and questions candidates will see."
                meta={assessment && (
                    <>
                        {assessment.is_active !== false
                            ? <Badge tone="emerald" icon={HiOutlineCheckCircle}>Active</Badge>
                            : <Badge tone="neutral" icon={HiOutlineArchiveBox}>Archived</Badge>}
                        <span className={chip}><HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" /> {assessment.duration_minutes ?? '—'} min</span>
                        <span className={chip}><HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" /> Pass at {assessment.passing_score ?? '—'}%</span>
                        <span className={chip}><HiOutlineListBullet className="h-3.5 w-3.5" aria-hidden="true" /> {problems.length} {problems.length === 1 ? 'question' : 'questions'}</span>
                    </>
                )}
                actions={assessment && (
                    <Link href={`/recruiter/assessments/${id}/sessions`} className={btnPrimary}>
                        <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> View sessions
                    </Link>
                )}
            />

            {!assessment && (
                <AssessmentNotice title="Could not load this assessment" message={error || 'Something went wrong. Try again.'} onRetry={retry} />
            )}

            {assessment && (<>
            {error && <Alert tone="error">{error}</Alert>}
            {success && <Alert tone="success">{success}</Alert>}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                {/* ── Settings ─────────────────────────────────────── */}
                <section aria-labelledby="settings-heading" className={`${card} space-y-5 lg:order-2 p-5 lg:sticky lg:top-6 lg:col-span-4 lg:self-start lg:p-6 2xl:col-span-3`}>
                    <div id="settings-heading">
                        <SectionTitle icon={HiOutlineCog6Tooth} title="Settings" hint="Shown to candidates before and during the test" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="edit-title" className={labelClass}>
                                <HiOutlineDocumentText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Title
                            </label>
                            <input
                                id="edit-title"
                                value={meta.title}
                                onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                                className={inputClass}
                                required
                            />
                            <p className={hintClass}>The name candidates see at the top of the test.</p>
                        </div>

                        <div className="space-y-1.5">
                            <span className={labelClass}>
                                <HiOutlineSparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Instructions
                            </span>
                            <AssessmentEditor
                                value={meta.description}
                                onChange={(val) => setMeta((m) => ({ ...m, description: val }))}
                                rows={4}
                                placeholder="Outline the expectations for the candidate..."
                            />
                            <p className={hintClass}>Rules, allowed tools and what the candidate must submit.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label htmlFor="edit-duration" className={labelClass}>
                                    <HiOutlineClock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Time limit
                                </label>
                                <input
                                    id="edit-duration"
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    value={meta.duration_minutes}
                                    onChange={(e) => setMeta((m) => ({ ...m, duration_minutes: Number(e.target.value) }))}
                                    className={inputClass}
                                />
                                <p className={hintClass}>Minutes</p>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="edit-pass" className={labelClass}>
                                    <HiOutlineChartBar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Pass mark
                                </label>
                                <input
                                    id="edit-pass"
                                    type="number"
                                    min={0}
                                    max={100}
                                    inputMode="numeric"
                                    value={meta.passing_score}
                                    onChange={(e) => setMeta((m) => ({ ...m, passing_score: Number(e.target.value) }))}
                                    className={inputClass}
                                />
                                <p className={hintClass}>Percent to pass</p>
                            </div>
                        </div>
                    </div>

                    <button type="button" onClick={handleSaveMeta} disabled={!canSaveSettings} className={`${btnPrimary} w-full`}>
                        {saving
                            ? <span className="h-4 w-4 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                            : <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />}
                        {saving ? 'Saving...' : 'Save settings'}
                    </button>
                </section>

                {/* ── Questions ────────────────────────────────────── */}
                <section aria-labelledby="questions-heading" className="min-w-0 space-y-4 lg:order-1 lg:col-span-8 2xl:col-span-9">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div id="questions-heading">
                            <SectionTitle
                                icon={HiOutlineListBullet}
                                title="Questions"
                                count={problems.length}
                                hint="Candidates answer these in the order shown"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setIsBankOpen(true)}
                                className={btnSecondary}
                            >
                                <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Add from bank
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length })}
                                className={btnPrimary}
                            >
                                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> New question
                            </button>
                        </div>
                    </div>

                    {problems.length === 0 && !editingProblem && (
                        <EmptyState
                            icon={HiOutlineBeaker}
                            title="No questions yet"
                            text="Add at least one question so candidates have something to answer."
                            action={(
                                <button type="button" onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: 0 })} className={btnPrimary}>
                                    <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Write a question
                                </button>
                            )}
                        />
                    )}

                    <ul className="space-y-3">
                        <AnimatePresence initial={false}>
                            {problems.map((p, i) => {
                                const editing = editingProblem?.question_id && editingProblem.question_id === p.question_id;
                                const TypeIcon = TYPE_ICON[p.type] || HiOutlineDocumentText;
                                return (
                                    <motion.li
                                        key={p.question_id || `${p.title}-${i}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {editing ? (
                                            <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                                        ) : (
                                            <div className={`${card} flex items-center justify-between gap-4 p-4 transition-colors hover:border-emerald-500/40 sm:p-5`}>
                                                <div className="flex min-w-0 items-center gap-3.5">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-base font-semibold text-emerald-950 dark:bg-white/10 dark:text-foreground" aria-label={`Question ${i + 1}`}>
                                                        {i + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-sm font-semibold text-emerald-950 dark:text-foreground sm:text-base">
                                                            {p.title || 'Untitled question'}
                                                        </h3>
                                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-900/80 dark:text-muted-foreground">
                                                            {p.difficulty && (
                                                                <span className={`rounded-sm border px-2 py-0.5 capitalize ${DIFFICULTY_META[p.difficulty] || 'border-emerald-100 bg-emerald-50 text-emerald-900/80 dark:border-white/10 dark:bg-white/10 dark:text-muted-foreground'}`}>
                                                                    {p.difficulty}
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-0.5 capitalize dark:bg-white/10">
                                                                <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" /> {p.type || '—'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1">
                                                                <HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" /> {p.marks ?? 0} marks
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    <button type="button" onClick={() => setEditingProblem(p)} aria-label={`Edit question ${i + 1}`} title="Edit question" className={btnIcon}>
                                                        <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteProblem(p.question_id)}
                                                        aria-label={`Remove question ${i + 1} from this assessment`}
                                                        title="Remove from this assessment (it stays in the pool)"
                                                        className={btnDangerIcon}
                                                    >
                                                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.li>
                                );
                            })}
                        </AnimatePresence>
                    </ul>

                    {editingProblem && !editingProblem.question_id && (
                        <div ref={newQuestionRef}>
                            <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                        </div>
                    )}
                </section>
            </div>

            </>)}

            <AnimatePresence>
                {isBankOpen && (
                    <ProblemBankModal onSelect={handleSelectFromBank} onClose={() => setIsBankOpen(false)} />
                )}
            </AnimatePresence>
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
