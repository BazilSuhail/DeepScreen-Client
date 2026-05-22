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
    HiOutlineChevronUp,
    HiOutlineBeaker,
    HiOutlineMapPin,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBar,
    HiOutlineShieldCheck,
    HiOutlineSquares2X2,
    HiOutlineInbox,
    HiOutlineXCircle,
    HiOutlineArrowRight,
    HiOutlineArrowPath,
    HiOutlineExclamationTriangle,
    HiOutlineInformationCircle,
    HiOutlineMagnifyingGlass,
    HiOutlineClipboardDocumentList,
    HiOutlineFlag,
    HiOutlineStar,
    HiOutlineLightBulb,
} from 'react-icons/hi2';
import Link from 'next/link';

// Modular Components
import StageBadge from '@/components/applications/StageBadge';
import ScoreBar from '@/components/applications/ScoreBar';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const STAGE_LABELS = {
    applied: 'Application Received',
    shortlisted: 'Shortlisted by AI',
    coding_pending: 'Coding Test Pending',
    coding_passed: 'Coding Test Passed',
    ai_interview_pending: 'AI Interview Pending',
    ai_interview_passed: 'AI Interview Passed',
    real_interview_scheduled: 'Interview Scheduled',
    offered: 'Offer Extended',
    hired: 'Hired! 🎉',
    rejected: 'Not Selected',
};

const FILTERS = [
    { key: 'all', icon: HiOutlineSquares2X2, hint: 'Show every application' },
    { key: 'applied', icon: HiOutlineInbox, hint: 'Received and waiting for review' },
    { key: 'shortlisted', icon: HiOutlineShieldCheck, hint: 'Passed AI screening' },
    { key: 'coding_pending', icon: HiOutlineBeaker, hint: 'Coding test waiting for you' },
    { key: 'rejected', icon: HiOutlineXCircle, hint: 'Not moving forward' },
];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';
const primaryButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 ${focusRing}`;
const secondaryButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 ${focusRing}`;
const cardSurface = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';
const statTile = 'min-w-0 rounded-xl border border-emerald-100 bg-white p-3 dark:border-white/10 dark:bg-card';
const mutedText = 'text-emerald-900/70 dark:text-slate-400';

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight text-emerald-950 dark:text-foreground">{title}</h2>
                {subtitle && <p className={`text-xs ${mutedText}`}>{subtitle}</p>}
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value, valueClass = '' }) {
    return (
        <div className={statTile} title={label}>
            <p className={`flex items-center gap-1.5 text-xs font-semibold ${mutedText}`}>
                <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> {label}
            </p>
            <p className={`mt-1 break-words font-semibold text-emerald-950 dark:text-foreground ${valueClass}`}>{value}</p>
        </div>
    );
}

function ScoreBreakdown({ stageResults }) {
    const sr = stageResults?.shortlist;
    if (!sr) return null;
    return (
        <div className={`space-y-3 p-4 ${cardSurface}`}>
            <p className={`flex items-center gap-2 text-xs font-semibold ${mutedText}`}>
                <HiOutlineChartBar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> AI match breakdown
            </p>
            <ScoreBar label="Skills" value={sr.skills_score ?? 0} color="bg-emerald-500" />
            <ScoreBar label="Work Experience" value={sr.workexp_score ?? 0} color="bg-blue-500" />
            <ScoreBar label="Projects" value={sr.projects_score ?? 0} color="bg-purple-500" />
            <ScoreBar label="Summary" value={sr.summary_score ?? 0} color="bg-orange-400" />
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`min-w-0 overflow-hidden transition-colors hover:border-emerald-300 ${cardSurface}`}
        >
            {/* Card header */}
            <div className="flex min-w-0 flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between lg:p-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" title="Position">
                        <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-emerald-950 dark:text-foreground">{app.job_details?.job_title || 'Position'}</h3>
                        <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${mutedText}`}>
                            <span className="flex min-w-0 items-center gap-1" title="Organization">
                                <HiOutlineBuildingOffice2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span className="truncate">{app.job_details?.organization_name || 'Organization'}</span>
                            </span>
                            {app.job_details?.location && (
                                <span className="flex min-w-0 items-center gap-1" title="Location">
                                    <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    <span className="truncate">{app.job_details.location}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1" title="Date applied">
                                <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                Applied {new Date(app.applied_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:shrink-0">
                    {hasScore && (
                        <div className="flex items-center gap-2" title="Match score from AI screening">
                            <HiOutlineStar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                            <div>
                                <p className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>AI score</p>
                                <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                                    {(Number(app.shortlist_score) * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stage badge */}
                    <div className="flex flex-col items-start gap-1 md:items-center">
                        <span className="inline-flex items-center gap-1.5">
                            <HiOutlineFlag className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                            <StageBadge stage={app.current_stage} />
                        </span>
                        <span className={`text-xs font-semibold ${mutedText}`}>
                            {STAGE_LABELS[app.current_stage]}
                        </span>
                    </div>

                    {/* Expand toggle */}
                    <button
                        type="button"
                        onClick={() => setExpanded((x) => !x)}
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Hide details' : 'Show details'}
                        title={expanded ? 'Hide details' : 'Show details'}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 ${focusRing}`}
                    >
                        {expanded ? <HiOutlineChevronUp className="h-4 w-4" aria-hidden="true" /> : <HiOutlineChevronDown className="h-4 w-4" aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-emerald-100 dark:border-white/10"
                    >
                        <div className="space-y-4 bg-emerald-50/50 p-5 lg:p-6 dark:bg-white/5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                <DetailItem icon={HiOutlineClipboardDocumentList} label="Status" value={(app.status || '').replace('_', ' ')} valueClass="capitalize" />
                                <DetailItem icon={HiOutlineFlag} label="Stage" value={STAGE_LABELS[app.current_stage]} valueClass="text-emerald-700 dark:text-emerald-400" />
                                {app.shortlist_rank && (
                                    <DetailItem icon={HiOutlineStar} label="AI rank" value={`#${app.shortlist_rank}`} />
                                )}
                            </div>

                            {/* AI Score Breakdown */}
                            {hasScore && <ScoreBreakdown stageResults={app.stage_results} />}

                            {/* CTAs */}
                            {app.current_stage === 'coding_pending' && (
                                <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/20 dark:bg-amber-500/10">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <HiOutlineBeaker className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">You have a coding assessment waiting!</p>
                                    </div>
                                    <Link href="/candidate/assessments"
                                        className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-500 ${focusRing} focus-visible:ring-amber-500`}>
                                        <HiOutlineBeaker className="h-3.5 w-3.5" aria-hidden="true" />
                                        Take test <HiOutlineArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                </div>
                            )}

                            {/* Message Recruiter CTA */}
                            {app.status !== 'rejected' && app.current_stage !== 'applied' && (
                                <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <HiOutlineChatBubbleLeftRight className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">You can message the recruiter.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleStartChat}
                                        className={`${primaryButton} shrink-0`}
                                    >
                                        <HiOutlineChatBubbleLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        Message <HiOutlineArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            )}

                            {/* Rejection note */}
                            {app.current_stage === 'rejected' && app.rejection_reason && (
                                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                                    <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-400">Feedback</p>
                                        <p className={`mt-1 break-words text-sm ${mutedText}`}>{app.rejection_reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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

    const pendingTests = applications.filter(a => a?.current_stage === 'coding_pending').length;

    const filtered = filter === 'all' ? applications
        : applications.filter(a => a?.current_stage === filter || a?.status === filter);

    const nextStep = applications.length === 0
        ? 'Next step: browse jobs and apply to your first role.'
        : pendingTests > 0
            ? `Next step: complete your ${pendingTests} pending coding ${pendingTests === 1 ? 'test' : 'tests'} to move forward.`
            : 'Next step: check your active roles and reply to recruiters from the chat.';

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <DashboardBanner
                loading={loading}
                icon={HiOutlineDocumentText}
                badge={loading ? undefined : { label: `${applications.length} ${applications.length === 1 ? 'application' : 'applications'}`, icon: HiOutlineClipboardDocumentList }}
                title="My Applications"
                subtitle="Track your pipeline across all applied positions"
                aside={loading ? (
                    <div className="flex gap-2"><BannerBlock className="h-11 w-36 rounded-xl" /></div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Link href="/jobs" className={primaryButton}>
                            <HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" /> Browse jobs
                        </Link>
                    </div>
                )}
                footer={loading ? undefined : (
                    <span className="flex items-start gap-2">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                        <span>{nextStep}</span>
                    </span>
                )}
            />

            {loading && <PageSkeleton stats={0} cards={2} banner={false} />}

            {!loading && error && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/25 dark:bg-red-500/10">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Something went wrong</p>
                        <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-300/70">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={retry}
                        className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-red-100 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25 ${focusRing}`}
                    >
                        <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
                    </button>
                </div>
            )}

            {/* ═══ Pipeline ═══ */}
            {!loading && (
            <section className="space-y-5">
                <SectionHeader icon={HiOutlineClipboardDocumentList} title="Pipeline" subtitle="Filter by stage to focus on what needs attention" />

                <div className="flex flex-wrap gap-2">
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
                                className={`flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition-all ${focusRing} ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500' : 'border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'}`}
                            >
                                <FilterIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {f.key === 'all' ? `All (${applications.length})` : f.key.replace(/_/g, ' ')}
                            </button>
                        );
                    })}
                </div>

                {filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((app, i) => <ApplicationCard key={app.application_id} app={app} index={i} />)}
                    </div>
                ) : !error && (
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
            )}
        </div>
    );
}
