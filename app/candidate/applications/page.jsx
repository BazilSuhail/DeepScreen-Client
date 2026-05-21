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
import DashboardBanner from '@/components/dashboard/DashboardBanner';
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

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

function SectionHeader({ icon: Icon, tone, title, subtitle }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value, valueClass = '' }) {
    return (
        <div className="min-w-0 rounded-xl border border-border bg-card p-3" title={label}>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {label}
            </p>
            <p className={`mt-1 break-words font-semibold ${valueClass}`}>{value}</p>
        </div>
    );
}

function ScoreBreakdown({ stageResults }) {
    const sr = stageResults?.shortlist;
    if (!sr) return null;
    return (
        <div className="space-y-3 rounded-xl border border-emerald-500/10 bg-card p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <HiOutlineChartBar className="h-4 w-4 text-emerald-500" aria-hidden="true" /> AI match breakdown
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
            className="min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-emerald-500/25"
        >
            {/* Card header */}
            <div className="flex min-w-0 flex-col gap-5 p-5 lg:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500" title="Position">
                        <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{app.job_details?.job_title || 'Position'}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
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
                            <HiOutlineStar className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">AI score</p>
                                <p className="text-xl font-semibold text-emerald-500">
                                    {(app.shortlist_score * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stage badge */}
                    <div className="flex flex-col items-start gap-1 md:items-center">
                        <StageBadge stage={app.current_stage} />
                        <span className="text-xs font-semibold text-muted-foreground">
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
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
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
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="space-y-4 bg-secondary/20 p-5 lg:p-6">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                <DetailItem icon={HiOutlineClipboardDocumentList} label="Status" value={app.status.replace('_', ' ')} valueClass="capitalize" />
                                <DetailItem icon={HiOutlineFlag} label="Stage" value={STAGE_LABELS[app.current_stage]} valueClass="text-emerald-500" />
                                {app.shortlist_rank && (
                                    <DetailItem icon={HiOutlineStar} label="AI rank" value={`#${app.shortlist_rank}`} />
                                )}
                            </div>

                            {/* AI Score Breakdown */}
                            {hasScore && <ScoreBreakdown stageResults={app.stage_results} />}

                            {/* CTAs */}
                            {app.current_stage === 'coding_pending' && (
                                <div className="flex flex-col gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <HiOutlineBeaker className="h-5 w-5 shrink-0 text-yellow-500" aria-hidden="true" />
                                        <p className="text-sm font-semibold text-yellow-500">You have a coding assessment waiting!</p>
                                    </div>
                                    <Link href="/candidate/assessments"
                                        className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-yellow-500 px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-yellow-400">
                                        Take test <HiOutlineArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                </div>
                            )}

                            {/* Message Recruiter CTA */}
                            {app.status !== 'rejected' && app.current_stage !== 'applied' && (
                                <div className="flex flex-col gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <HiOutlineChatBubbleLeftRight className="h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
                                        <p className="text-sm font-semibold text-blue-500">You can message the recruiter.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleStartChat}
                                        className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-600"
                                    >
                                        Message <HiOutlineArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            )}

                            {/* Rejection note */}
                            {app.current_stage === 'rejected' && app.rejection_reason && (
                                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                                    <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-red-400">Feedback</p>
                                        <p className="mt-1 break-words text-sm text-muted-foreground">{app.rejection_reason}</p>
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
        const fetchApplications = async () => {
            try {
                const data = await api.get('/applications/');
                setApplications(data);
                setError('');
            } catch {
                setError('We could not load your applications. Check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const pendingTests = applications.filter(a => a.current_stage === 'coding_pending').length;

    const filtered = filter === 'all' ? applications
        : applications.filter(a => a.current_stage === filter || a.status === filter);

    if (loading) return <PageSkeleton stats={0} cards={2} />;

    const nextStep = applications.length === 0
        ? 'Next step: browse jobs and apply to your first role.'
        : pendingTests > 0
            ? `Next step: complete your ${pendingTests} pending coding ${pendingTests === 1 ? 'test' : 'tests'} to move forward.`
            : 'Next step: check your active roles and reply to recruiters from the chat.';

    return (
        <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
            {/* ═══ Banner ═══ */}
            <DashboardBanner
                icon={HiOutlineDocumentText}
                badge={{ label: `${applications.length} ${applications.length === 1 ? 'application' : 'applications'}`, icon: HiOutlineClipboardDocumentList }}
                title="My Applications"
                subtitle="Track your pipeline across all applied positions"
                footer={
                    <span className="flex items-start gap-2">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span>{nextStep}</span>
                    </span>
                }
            />

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-red-300">Something went wrong</p>
                        <p className="mt-0.5 text-xs text-red-300/70">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={retry}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
                    >
                        <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
                    </button>
                </div>
            )}

            {/* ═══ Pipeline ═══ */}
            <section className="space-y-5">
                <SectionHeader icon={HiOutlineClipboardDocumentList} tone="bg-emerald-500/10 text-emerald-500" title="Pipeline" subtitle="Filter by stage to focus on what needs attention" />

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
                                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition-all ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-emerald-600/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'}`}
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
                        action={filter === 'all' ? <Link href="/jobs" className={linkButton}><HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" /> Browse jobs</Link> : null}
                    />
                )}
            </section>
        </div>
    );
}
