'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineClock,
    HiOutlineChevronDown,
    HiOutlineBeaker,
    HiOutlineMapPin,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBar,
    HiOutlineShieldCheck,
    HiOutlineSquares2X2,
    HiOutlineInbox,
    HiOutlineXCircle,
    HiOutlineArrowRight,
    HiOutlineInformationCircle,
    HiOutlineMagnifyingGlass,
    HiOutlineClipboardDocumentList,
    HiOutlineFlag,
    HiOutlineStar,
    HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import Link from 'next/link';
import { badge, card, focusRing, iconButton, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';
import { base, fadeUp, spring, stagger } from '@/constants/motion';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import ApplicationsSkeleton from '@/components/skeletons/candidate/ApplicationsSkeleton';

const STAGE_LABELS = {
    applied: 'Application Received',
    shortlisted: 'Shortlisted by AI',
    coding_pending: 'Coding Test Pending',
    coding_passed: 'Coding Test Passed',
    ai_interview_pending: 'AI Interview Pending',
    ai_interview_passed: 'AI Interview Passed',
    real_interview_scheduled: 'Interview Scheduled',
    offered: 'Offer Extended',
    hired: 'Hired',
    rejected: 'Not Selected',
};

const TEAL = 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300';
const EMERALD = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300';
const AMBER = 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300';

// Palette-only stage colours (the shared StageBadge in components/applications is outside this area).
const STAGE_STYLES = {
    applied: TEAL,
    shortlisted: EMERALD,
    coding_pending: AMBER,
    coding_passed: EMERALD,
    ai_interview_pending: AMBER,
    ai_interview_passed: EMERALD,
    real_interview_scheduled: TEAL,
    offered: TEAL,
    hired: EMERALD,
    rejected: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300',
};

const FILTERS = [
    { key: 'all', icon: HiOutlineSquares2X2, hint: 'Show every application' },
    { key: 'applied', icon: HiOutlineInbox, hint: 'Received and waiting for review' },
    { key: 'shortlisted', icon: HiOutlineShieldCheck, hint: 'Passed AI screening' },
    { key: 'coding_pending', icon: HiOutlineBeaker, hint: 'Coding test waiting for you' },
    { key: 'rejected', icon: HiOutlineXCircle, hint: 'Not moving forward' },
];

const SCORE_BARS = [
    { key: 'skills_score', label: 'Skills', color: 'bg-emerald-500' },
    { key: 'workexp_score', label: 'Work Experience', color: 'bg-teal-500' },
    { key: 'projects_score', label: 'Projects', color: 'bg-emerald-400' },
    { key: 'summary_score', label: 'Summary', color: 'bg-amber-500' },
];

function StageBadge({ stage }) {
    return (
        <span className={`${badge} font-semibold uppercase tracking-wider ${STAGE_STYLES[stage] || 'bg-muted text-muted-foreground'}`}>
            <HiOutlineFlag className="h-3 w-3" aria-hidden="true" />
            {stage?.replace(/_/g, ' ') || '—'}
        </span>
    );
}

function DetailItem({ icon: Icon, label, value, valueClass = '' }) {
    return (
        <div className="min-w-0 rounded-md border border-emerald-100 bg-card p-3 dark:border-white/10">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> {label}
            </p>
            <p className={`mt-1 break-words text-sm font-semibold ${valueClass}`}>{value || <span className="text-muted-foreground">—</span>}</p>
        </div>
    );
}

function ScoreBreakdown({ stageResults }) {
    const sr = stageResults?.shortlist;
    if (!sr) return null;
    return (
        <div className="space-y-3 rounded-md border border-emerald-100 bg-card p-4 dark:border-white/10">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <HiOutlineChartBar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> AI match breakdown
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {SCORE_BARS.map(({ key, label, color }) => {
                    const value = sr[key] ?? 0;
                    return (
                        <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-semibold tabular-nums">{(value * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${value * 100}%` }} transition={base} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ApplicationCard({ app, index }) {
    const [expanded, setExpanded] = useState(false);
    const hasScore = app.shortlist_score != null;
    const router = useRouter();

    const handleStartChat = () => {
        router.push(`/chats/${app.application_id}`);
    };

    return (
        <motion.article
            {...fadeUp}
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            className={`min-w-0 overflow-hidden transition-colors hover:border-emerald-300 dark:hover:border-emerald-500/40 ${card}`}
        >
            <div className="flex min-w-0 flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between lg:p-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className={`${iconTile} h-11 w-11 ${STAGE_STYLES[app.current_stage] || 'bg-muted text-muted-foreground'}`}>
                        <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold lg:text-lg">{app.job_details?.job_title || 'Position'}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex min-w-0 items-center gap-1">
                                <HiOutlineBuildingOffice2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span className="truncate">{app.job_details?.organization_name || 'Organization'}</span>
                            </span>
                            {app.job_details?.location && (
                                <span className="flex min-w-0 items-center gap-1">
                                    <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    <span className="truncate">{app.job_details.location}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                Applied {new Date(app.applied_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:shrink-0">
                    {hasScore && (
                        <div className="flex items-center gap-2" title="Match score from AI screening">
                            <HiOutlineStar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI score</p>
                                <p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                                    {(Number(app.shortlist_score) * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-start gap-1">
                        <StageBadge stage={app.current_stage} />
                        <span className="text-xs text-muted-foreground">{STAGE_LABELS[app.current_stage]}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setExpanded((x) => !x)}
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Hide details' : 'Show details'}
                        title={expanded ? 'Hide details' : 'Show details'}
                        className={`${iconButton} ml-auto border border-emerald-200 md:ml-0 dark:border-white/10`}
                    >
                        <HiOutlineChevronDown className={`h-4 w-4 transition-[rotate] duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={base}
                        className="overflow-hidden border-t border-emerald-100 dark:border-white/10"
                    >
                        <div className="space-y-4 bg-emerald-50/50 p-5 lg:p-6 dark:bg-white/5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <DetailItem icon={HiOutlineClipboardDocumentList} label="Status" value={(app.status || '').replace('_', ' ')} valueClass="capitalize" />
                                <DetailItem icon={HiOutlineFlag} label="Stage" value={STAGE_LABELS[app.current_stage]} valueClass="text-emerald-700 dark:text-emerald-400" />
                                {app.shortlist_rank && (
                                    <DetailItem icon={HiOutlineStar} label="AI rank" value={`#${app.shortlist_rank}`} />
                                )}
                            </div>

                            {hasScore && <ScoreBreakdown stageResults={app.stage_results} />}

                            {app.current_stage === 'coding_pending' && (
                                <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/20 dark:bg-amber-500/10">
                                    <p className="flex min-w-0 items-center gap-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
                                        <HiOutlineBeaker className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        You have a coding assessment waiting.
                                    </p>
                                    <Link href="/candidate/assessments" className={`${primaryButton} shrink-0`}>
                                        <HiOutlineBeaker className="h-4 w-4" aria-hidden="true" />
                                        Take test <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            )}

                            {app.status !== 'rejected' && app.current_stage !== 'applied' && (
                                <div className="flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <p className="flex min-w-0 items-center gap-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                        <HiOutlineChatBubbleLeftRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        You can message the recruiter.
                                    </p>
                                    <button type="button" onClick={handleStartChat} className={`${app.current_stage === 'coding_pending' ? secondaryButton : primaryButton} shrink-0`}>
                                        <HiOutlineChatBubbleLeftRight className="h-4 w-4" aria-hidden="true" />
                                        Message <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            )}

                            {app.current_stage === 'rejected' && app.rejection_reason && (
                                <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                                    <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">Feedback</p>
                                        <p className="mt-1 break-words text-sm text-muted-foreground">{app.rejection_reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

export default function CandidateApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const fetchApplications = async () => {
            try {
                const data = await api.get('/applications/');
                if (!cancelled) {
                    setApplications(Array.isArray(data) ? data : []);
                    setError('');
                }
            } catch {
                if (!cancelled) setError('We could not load your applications. Check your connection and try again.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchApplications();
        return () => { cancelled = true; };
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    if (loading) return <ApplicationsSkeleton />;

    const pendingTests = applications.filter(a => a?.current_stage === 'coding_pending').length;
    const rejectedCount = applications.filter((a) => a?.current_stage === 'rejected').length;
    const advancingCount = applications.filter((a) => a?.current_stage && !['applied', 'rejected'].includes(a.current_stage)).length;

    const filtered = filter === 'all' ? applications
        : applications.filter(a => a?.current_stage === filter || a?.status === filter);

    const nextStep = applications.length === 0
        ? 'Browse jobs and apply to your first role.'
        : pendingTests > 0
            ? `Complete your ${pendingTests} pending coding ${pendingTests === 1 ? 'test' : 'tests'} to move forward.`
            : 'Check your active roles and reply to recruiters from the chat.';

    const stats = [
        { label: 'Applications', value: applications.length, icon: HiOutlineDocumentText, tone: 'emerald' },
        { label: 'Advancing', value: advancingCount, icon: HiOutlineArrowTrendingUp, tone: 'emerald' },
        { label: 'Tests pending', value: pendingTests, icon: HiOutlineBeaker, tone: 'amber' },
        { label: 'Not selected', value: rejectedCount, icon: HiOutlineXCircle, tone: 'amber' },
    ];

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
            <DashboardBanner
                compact
                icon={HiOutlineClipboardDocumentList}
                title="My applications"
                subtitle="Track your pipeline across every position you applied to."
                actions={[{ label: 'Browse jobs', href: '/jobs', icon: HiOutlineMagnifyingGlass }]}
                footer={!error && nextStep}
            />

            {error ? (
                <ErrorState message={error} onRetry={retry} />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {stats.map((s, i) => (
                            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} delay={Math.min(i, 8) * stagger} />
                        ))}
                    </div>

                    <section className="space-y-4">
                        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                            {FILTERS.map((f) => {
                                const FilterIcon = f.icon;
                                const active = filter === f.key;
                                return (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setFilter(f.key)}
                                        aria-pressed={active}
                                        title={f.hint}
                                        className={`relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-semibold capitalize transition-[color,background-color,border-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${active ? 'border-transparent text-white' : 'border-emerald-200 bg-card text-emerald-800 hover:bg-emerald-50 dark:border-white/10 dark:text-foreground dark:hover:bg-white/5'}`}
                                    >
                                        {active && <motion.span layoutId="candidate-applications-filter" transition={spring} className="absolute inset-0 rounded-md bg-emerald-600" aria-hidden="true" />}
                                        <FilterIcon className="relative h-4 w-4" aria-hidden="true" />
                                        <span className="relative">{f.key === 'all' ? `All (${applications.length})` : f.key.replace(/_/g, ' ')}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {filtered.length > 0 ? (
                            <motion.div layout className="grid gap-4 2xl:grid-cols-2">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {filtered.map((app, i) => (
                                        <motion.div key={app.application_id} layout exit={{ opacity: 0, scale: 0.98 }} transition={base} className="min-w-0">
                                            <ApplicationCard app={app} index={i} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <EmptyState
                                icon={HiOutlineDocumentText}
                                title={filter === 'all' ? 'No applications yet' : 'Nothing in this stage'}
                                text={filter === 'all'
                                    ? 'Apply to a job and it will show up here with its live status.'
                                    : `No applications are in the "${filter.replace(/_/g, ' ')}" stage right now. Choose All to see every application.`}
                                action={filter === 'all' ? (
                                    <Link href="/jobs" className={secondaryButton}><HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" /> Browse jobs</Link>
                                ) : null}
                            />
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
