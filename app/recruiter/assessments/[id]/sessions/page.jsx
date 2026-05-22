'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineUserGroup, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineClock,
    HiOutlineCheckCircle, HiOutlineMinusCircle, HiOutlinePlayCircle,
    HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineChevronRight,
    HiOutlineArrowPath, HiOutlineCalendarDays, HiOutlineBeaker, HiOutlineDocumentText, HiOutlineChevronLeft, HiOutlineXMark,
} from 'react-icons/hi2';
import { getCandidateInitial, formatDate, hasScore } from '@/components/assessments/SubmissionHelpers';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
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
        { label: 'Passed', value: stats.passed, icon: HiOutlineAcademicCap, valueClass: 'text-emerald-950 dark:text-foreground', sub: `Score ${passMark}% or higher`, subClass: 'text-emerald-800/70 dark:text-slate-400' },
    ];

    const showLoadError = !loading && error && submissions.length === 0;
    const pageTitle = loading ? 'Loading sessions' : (assessment?.title || 'Assessment sessions');
    const pageSubtitle = loading ? 'Candidates who start this assessment' : `${stats.total} ${stats.total === 1 ? 'candidate' : 'candidates'} · Pass mark ${passMark}%`;

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <DashboardBanner
                loading={loading}
                icon={HiOutlineUserGroup}
                title={pageTitle}
                subtitle={pageSubtitle}
                aside={loading ? (
                    <div className="flex gap-2"><BannerBlock className="h-11 w-44 rounded-xl" /></div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Link href={`/recruiter/assessments/${id}`} className={btnSecondary}>
                            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to assessment
                        </Link>
                    </div>
                )}
            />

            {loading && <PageSkeleton stats={4} cards={2} banner={false} />}

            {showLoadError && (
                <AssessmentNotice title="Could not load sessions" message={error} onRetry={retry} />
            )}

            {!loading && !showLoadError && (<>
            {error && <Alert tone="error">{error}</Alert>}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {statCards.map((stat, i) => (
                    <StatCard key={stat.label} {...stat} delay={i * 0.05} />
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 lg:max-w-sm lg:flex-1">
                        <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700/70" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email"
                            aria-label="Search candidates by name or email"
                            className={`min-h-11 w-full rounded-2xl border border-emerald-100 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 outline-none transition-colors placeholder:text-emerald-700/60 focus:border-emerald-500 dark:border-white/10 dark:bg-card dark:text-foreground dark:placeholder:text-slate-500 ${focusRing}`}
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
                                    className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-sm font-medium transition-colors ${focusRing} ${
                                        active
                                            ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-600'
                                            : 'border-emerald-100 bg-white text-emerald-900/80 hover:bg-emerald-50/60 dark:border-white/10 dark:bg-card dark:text-slate-300 dark:hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    {f.label}
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

                    <ul className="space-y-3">
                        <AnimatePresence initial={false}>
                            {filtered.map((sub) => {
                                const isPending = sub.status === 'pending';
                                const href = `/recruiter/assessments/${id}/sessions/${sub.submission_id}`;
                                const name = sub.candidate_name || 'Unknown candidate';
                                const submittedLabel = formatDate(sub.submitted_at, { month: 'short', day: 'numeric' });

                                const content = (
                                    <>
                                        <div className="relative shrink-0">
                                            <span
                                                aria-hidden="true"
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white ${
                                                    isPending ? 'bg-emerald-400 dark:bg-emerald-700' : 'bg-emerald-600'
                                                }`}
                                            >
                                                {getCandidateInitial(sub.candidate_name, sub.candidate_email)}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="max-w-full truncate text-base font-semibold text-emerald-950 dark:text-foreground md:max-w-[320px]">
                                                    {name}
                                                </h3>
                                                <StatusBadge status={sub.status} />
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-800/70 dark:text-slate-400">
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
                                                        ? <HiOutlinePlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                                        : isPending
                                                            ? <HiOutlineMinusCircle className="h-5 w-5 text-emerald-700/70" aria-hidden="true" />
                                                            : <HiOutlineClock className="h-5 w-5 text-emerald-800/70 dark:text-slate-400" aria-hidden="true" />}
                                                </span>
                                            )}
                                            {!isPending && (
                                                <HiOutlineChevronRight className="h-5 w-5 text-emerald-700/70 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                            )}
                                        </div>
                                    </>
                                );

                                const rowClass = `group flex items-center gap-4 rounded-xl border p-4 sm:p-5 ${card}`;

                                return (
                                    <motion.li
                                        key={sub.submission_id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {isPending ? (
                                            <div aria-disabled="true" className={`${rowClass} opacity-70`}>
                                                <span className="sr-only">{name}, not started yet</span>
                                                {content}
                                            </div>
                                        ) : (
                                            <Link
                                                href={href}
                                                className={`${rowClass} transition-colors hover:border-emerald-500/50 hover:bg-emerald-50/60 dark:hover:bg-white/5 ${focusRing}`}
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
