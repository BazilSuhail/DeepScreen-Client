'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { base, spring, stagger } from '@/constants/motion';
import {
    HiOutlineUserGroup, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineClock,
    HiOutlineCheckCircle, HiOutlineMinusCircle, HiOutlinePlayCircle,
    HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineChevronRight,
    HiOutlineArrowPath, HiOutlineCalendarDays, HiOutlineBeaker, HiOutlineDocumentText, HiOutlineXMark, HiOutlineChartBar,
} from 'react-icons/hi2';
import { getCandidateInitial, formatDate, hasScore } from '@/components/assessments/SubmissionHelpers';
import PageHeader from '@/components/ui/PageHeader';
import { cardInteractive, inputClass } from '@/components/ui/styles';
import AssessmentSessionsSkeleton from '@/components/skeletons/recruiter/AssessmentSessionsSkeleton';
import AssessmentNotice from '@/components/assessments/AssessmentNotice';
import {
    SectionTitle, StatCard, StatusBadge, ScoreRing, Alert, EmptyState,
    btnSecondary, focusRing, card,
} from '@/components/assessments/SubmissionUi';

const FILTERS = [
    { key: 'all', label: 'All', icon: HiOutlineFunnel },
    { key: 'pending', label: 'Pending', icon: HiOutlineMinusCircle },
    { key: 'in_progress', label: 'In progress', icon: HiOutlinePlayCircle },
    { key: 'submitted', label: 'Submitted', icon: HiOutlineDocumentText },
    { key: 'evaluated', label: 'Evaluated', icon: HiOutlineCheckCircle },
];

export default function AssessmentSessionsPage() {
    const { id } = useParams();

    const [assessment, setAssessment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!id) return;
        let active = true;

        Promise.all([
            api.get(`/assessments/${id}/`),
            api.get(`/assessments/${id}/submissions/`),
        ])
            .then(([assessData, submissionsData]) => {
                if (!active) return;
                setAssessment(assessData);
                setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
                setError('');
            })
            .catch(() => {
                if (active) setError('We could not load the sessions for this assessment. Check your connection and try again.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [id, attempt]);

    const retry = () => {
        setLoading(true);
        setAttempt((n) => n + 1);
    };

    const passMark = assessment?.passing_score ?? 70;
    const query = search.trim().toLowerCase();
    const filtersActive = query !== '' || statusFilter !== 'all';

    const filtered = submissions.filter((s) => {
        const nameMatch = (s.candidate_name || '').toLowerCase().includes(query);
        const emailMatch = (s.candidate_email || '').toLowerCase().includes(query);
        const statusMatch = statusFilter === 'all' || s.status === statusFilter;
        return (nameMatch || emailMatch) && statusMatch;
    });

    const stats = {
        total: submissions.length,
        evaluated: submissions.filter((s) => s.status === 'evaluated').length,
        in_progress: submissions.filter((s) => s.status === 'in_progress').length,
        passed: submissions.filter((s) => hasScore(s.percentage) && s.percentage >= passMark).length,
    };

    const statCards = [
        { label: 'Invited', value: stats.total, icon: HiOutlineUserGroup, valueClass: 'text-emerald-950 dark:text-foreground' },
        { label: 'Evaluated', value: stats.evaluated, icon: HiOutlineCheckCircle, valueClass: 'text-emerald-950 dark:text-foreground' },
        { label: 'In progress', value: stats.in_progress, icon: HiOutlinePlayCircle, valueClass: 'text-emerald-950 dark:text-foreground' },
        { label: 'Passed', value: stats.passed, icon: HiOutlineAcademicCap, valueClass: 'text-emerald-950 dark:text-foreground', sub: `Score ${passMark}% or higher`, subClass: 'text-emerald-800/70 dark:text-muted-foreground' },
    ];

    const showLoadError = !loading && error && submissions.length === 0;

    if (loading) return <AssessmentSessionsSkeleton />;

    const chip = 'inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-white/5 dark:text-muted-foreground';

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
            <PageHeader
                back={{ href: `/recruiter/assessments/${id}`, label: 'Back to assessment' }}
                icon={HiOutlineUserGroup}
                eyebrow="Assessment sessions"
                title={assessment?.title || 'Assessment sessions'}
                description="Candidates who started this assessment, their status and score."
                meta={!showLoadError && (
                    <>
                        <span className={chip}><HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" /> {stats.total} {stats.total === 1 ? 'candidate' : 'candidates'}</span>
                        <span className={chip}><HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" /> Pass mark {passMark}%</span>
                    </>
                )}
            />

            {showLoadError && (
                <AssessmentNotice title="Could not load sessions" message={error} onRetry={retry} />
            )}

            {!showLoadError && (<>
            {error && <Alert tone="error">{error}</Alert>}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {statCards.map((stat, i) => (
                    <StatCard key={stat.label} {...stat} delay={Math.min(i, 8) * stagger} />
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 lg:flex-1">
                        <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email"
                            aria-label="Search candidates by name or email"
                            className={`${inputClass} pl-10`}
                        />
                    </div>
                    <fieldset aria-label="Filter by status" className="m-0 -mx-1 flex min-w-0 gap-1.5 overflow-x-auto border-0 p-0 px-1 pb-1 lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none]">
                        {FILTERS.map((f) => {
                            const active = statusFilter === f.key;
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setStatusFilter(f.key)}
                                    aria-pressed={active}
                                    className={`relative flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3.5 text-sm font-medium transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
                                        active
                                            ? 'border-transparent text-white'
                                            : 'border-emerald-100 bg-card text-emerald-900/80 hover:bg-emerald-50/60 dark:border-white/10 dark:text-muted-foreground dark:hover:bg-white/10'
                                    }`}
                                >
                                    {active && (
                                        <motion.span layoutId="assessment-sessions-filter" transition={spring} className="absolute -inset-px rounded-md border border-emerald-600 bg-emerald-600 dark:border-emerald-500" aria-hidden="true" />
                                    )}
                                    <Icon className="relative h-4 w-4" aria-hidden="true" />
                                    <span className="relative">{f.label}</span>
                                </button>
                            );
                        })}
                    </fieldset>
                </div>

                <section aria-labelledby="candidates-heading" className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div id="candidates-heading">
                            <SectionTitle icon={HiOutlineUserGroup} title="Candidates" count={`${filtered.length} of ${submissions.length}`} />
                        </div>
                    </div>

                    {error && submissions.length > 0 && (
                        <button type="button" onClick={retry} className={btnSecondary}>
                            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Refresh list
                        </button>
                    )}

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={filtersActive ? HiOutlineMagnifyingGlass : HiOutlineBeaker}
                            title={filtersActive ? 'No matching candidates' : 'No sessions yet'}
                            text={filtersActive
                                ? 'Try a different search or show all statuses.'
                                : 'Candidates who start this assessment will appear here.'}
                            action={filtersActive ? (
                                <button type="button" onClick={() => { setSearch(''); setStatusFilter('all'); }} className={btnSecondary}>
                                    <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Clear filters
                                </button>
                            ) : null}
                        />
                    )}

                    <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        <AnimatePresence initial={false} mode="popLayout">
                            {filtered.map((sub) => {
                                const isPending = sub.status === 'pending';
                                const href = `/recruiter/assessments/${id}/sessions/${sub.submission_id}`;
                                const name = sub.candidate_name || sub.candidate_email || 'Candidate';
                                const submittedLabel = formatDate(sub.submitted_at, { month: 'short', day: 'numeric' });

                                const content = (
                                    <>
                                        <div className="relative shrink-0">
                                            <span
                                                aria-hidden="true"
                                                className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white ${
                                                    isPending ? 'bg-emerald-400 dark:bg-emerald-700' : 'bg-emerald-600'
                                                }`}
                                            >
                                                {getCandidateInitial(sub.candidate_name, sub.candidate_email)}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="max-w-full truncate text-base font-semibold text-emerald-950 dark:text-foreground">
                                                    {name}
                                                </h3>
                                                <StatusBadge status={sub.status} />
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-800/70 dark:text-muted-foreground">
                                                {sub.candidate_email && (
                                                    <span className="inline-flex min-w-0 items-center gap-1">
                                                        <HiOutlineEnvelope className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                        <span className="truncate">{sub.candidate_email}</span>
                                                    </span>
                                                )}
                                                {sub.time_taken_minutes != null && (
                                                    <span className="inline-flex shrink-0 items-center gap-1">
                                                        <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {sub.time_taken_minutes} min
                                                    </span>
                                                )}
                                                {submittedLabel && (
                                                    <span className="inline-flex shrink-0 items-center gap-1">
                                                        <HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {submittedLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            {sub.status === 'evaluated' ? (
                                                <ScoreRing percentage={sub.percentage} size={52} />
                                            ) : (
                                                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-emerald-100 bg-emerald-50/60 dark:border-white/10 dark:bg-white/10">
                                                    {sub.status === 'in_progress'
                                                        ? <HiOutlinePlayCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                                                        : isPending
                                                            ? <HiOutlineMinusCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                                            : <HiOutlineClock className="h-5 w-5 text-emerald-800/70 dark:text-muted-foreground" aria-hidden="true" />}
                                                </span>
                                            )}
                                            {!isPending && (
                                                <HiOutlineChevronRight className="h-5 w-5 text-muted-foreground transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
                                            )}
                                        </div>
                                    </>
                                );

                                const rowClass = 'group flex h-full items-center gap-4 p-4 sm:p-5';

                                return (
                                    <motion.li
                                        key={sub.submission_id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={base}
                                    >
                                        {isPending ? (
                                            <div aria-disabled="true" className={`${card} ${rowClass} opacity-70`}>
                                                <span className="sr-only">{name}, not started yet</span>
                                                {content}
                                            </div>
                                        ) : (
                                            <Link
                                                href={href}
                                                className={`${cardInteractive} ${rowClass}`}
                                            >
                                                {content}
                                            </Link>
                                        )}
                                    </motion.li>
                                );
                            })}
                        </AnimatePresence>
                    </ul>
                </section>
            </div>
            </>)}
        </div>
    );
}
