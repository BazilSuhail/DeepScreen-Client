'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import {
    HiOutlineAcademicCap,
    HiOutlineArrowPath,
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineChartBar,
    HiOutlineChatBubbleLeftEllipsis,
    HiOutlineCheckBadge,
    HiOutlineCheckCircle,
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineCodeBracket,
    HiOutlineCommandLine,
    HiOutlineDocumentText,
    HiOutlineExclamationTriangle,
    HiOutlineEye,
    HiOutlineFire,
    HiOutlineFlag,
    HiOutlinePaperAirplane,
    HiOutlinePlus,
    HiOutlineShieldCheck,
    HiOutlineSparkles,
    HiOutlineStar,
    HiOutlineUser,
    HiOutlineUserGroup,
    HiOutlineVideoCamera,
    HiOutlineLightBulb,
    HiOutlineXCircle,
} from 'react-icons/hi2';

// Chart palette, written out so the options read clearly.
const EMERALD = '#10b981';
const VIOLET = '#8b5cf6';
const CYAN = '#06b6d4';

const STAT_FALLBACK_ICONS = [HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineVideoCamera, HiOutlineStar];

const QUEUE_STATUS = {
    waiting: { label: 'Waiting', icon: HiOutlineClock, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-500' },
    live: { label: 'Live', dot: true, cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    feedback: { label: 'Feedback', icon: HiOutlineChatBubbleLeftEllipsis, cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-500' },
    completed: { label: 'Completed', icon: HiOutlineCheckCircle, cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, cls: 'bg-secondary text-muted-foreground' },
};

const ACTION_ICONS = {
    score: HiOutlineStar,
    feedback: HiOutlineChatBubbleLeftEllipsis,
    conflict: HiOutlineExclamationTriangle,
    schedule: HiOutlineCalendarDays,
};

const ACTION_COLORS = {
    score: 'bg-amber-500/10 text-amber-600 dark:text-amber-500',
    feedback: 'bg-rose-500/10 text-rose-600 dark:text-rose-500',
    conflict: 'bg-red-500/10 text-red-600 dark:text-red-400',
    schedule: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-500',
};

const STATUS_STYLES = {
    Evaluated: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    'AI Round': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    Technical: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    Screening: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Review: 'bg-amber-500/10 text-amber-600 dark:text-amber-500',
};

const STATUS_ICONS = {
    Evaluated: HiOutlineCheckCircle,
    'AI Round': HiOutlineSparkles,
    Technical: HiOutlineCodeBracket,
    Screening: HiOutlineUser,
    Review: HiOutlineEye,
};

const ACTIVITY_ICONS = {
    assessment: HiOutlineAcademicCap,
    application: HiOutlineDocumentText,
    ai: HiOutlineChatBubbleLeftEllipsis,
    interview: HiOutlineVideoCamera,
    offer: HiOutlinePaperAirplane,
    hire: HiOutlineCheckCircle,
    success: HiOutlineCheckCircle,
};

const ACTIVITY_COLORS = {
    assessment: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-500',
    application: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    ai: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    interview: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-500',
    offer: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    hire: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';
const buttonPrimary = `inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 ${focusRing}`;
const buttonSecondary = `inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-white/10 dark:bg-transparent dark:text-foreground dark:hover:bg-white/5 ${focusRing}`;
const viewAllLink = `flex min-h-11 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-white/5 ${focusRing}`;
const rowSurface = 'bg-emerald-50/70 dark:bg-white/5';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const arr = (v) => (Array.isArray(v) ? v : []);

const ACTION_HREF = {
    score: '/recruiter/applications',
    feedback: '/recruiter/interview',
    conflict: '/recruiter/interview',
    schedule: '/recruiter/interview',
};
const hasSeriesData = (rows, keys) => Array.isArray(rows) && rows.some((r) => keys.some((k) => num(r[k]) > 0));
const hasValues = (rows, key) => Array.isArray(rows) && rows.some((r) => num(r[key]) > 0);
const firstName = (name) => (name || '').trim().split(' ')[0] || 'there';
const initials = (v) => (v ? String(v).slice(0, 2).toUpperCase() : '?');

const statIcon = (label = '', i) => {
    const s = String(label).toLowerCase();
    if (s.includes('candidate')) return HiOutlineUserGroup;
    if (s.includes('assess')) return HiOutlineAcademicCap;
    if (s.includes('interview')) return HiOutlineVideoCamera;
    if (s.includes('offer') || s.includes('hire')) return HiOutlinePaperAirplane;
    if (s.includes('score') || s.includes('rating')) return HiOutlineStar;
    if (s.includes('applic')) return HiOutlineDocumentText;
    if (s.includes('job')) return HiOutlineBriefcase;
    return STAT_FALLBACK_ICONS[i] || HiOutlineChartBar;
};

const PIPELINE_ICONS = {
    job: HiOutlineBriefcase,
    application: HiOutlineDocumentText,
    coding: HiOutlineCodeBracket,
    real: HiOutlineVideoCamera,
    ai: HiOutlineChatBubbleLeftEllipsis,
    default: HiOutlineFlag,
};

const pipelineIconKey = (stage = '') => {
    const s = String(stage).toLowerCase();
    if (s.includes('job')) return 'job';
    if (s.includes('application')) return 'application';
    if (s.includes('coding') || s.includes('assess')) return 'coding';
    if (s.includes('real')) return 'real';
    if (s.includes('ai')) return 'ai';
    return 'default';
};

// Emerald card shell used by every panel on this page.
function Panel({ title, subtitle, icon: Icon, action, delay = 0, className = '', children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`min-w-0 rounded-2xl border border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card ${className}`}
        >
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
                        {title}
                    </h3>
                    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </motion.div>
    );
}

function StatTile({ label, value, icon: Icon, hint, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800/70 dark:text-muted-foreground">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight lg:text-4xl">{num(value).toLocaleString()}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
            {hint && <p className="mt-5 text-xs text-muted-foreground">{hint}</p>}
        </motion.div>
    );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="mb-5 flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    );
}

function QueueStatusPill({ statusKey }) {
    const meta = QUEUE_STATUS[statusKey] || QUEUE_STATUS.completed;
    const Icon = meta.icon;
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${meta.cls}`}>
            {meta.dot ? (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
            ) : (
                Icon && <Icon className="h-3 w-3" aria-hidden="true" />
            )}
            {meta.label}
        </span>
    );
}

function QueueRow({ item, index }) {
    const joinable = item.statusKey === 'live' || item.statusKey === 'waiting';
    const rowClass = `flex min-h-11 min-w-0 items-center gap-3 rounded-xl p-3 transition-colors ${rowSurface}`;
    const body = (
        <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.job}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <HiOutlineClock className="h-3 w-3 shrink-0" aria-hidden="true" /> {item.time}
                </p>
            </div>
            <QueueStatusPill statusKey={item.statusKey} />
        </>
    );
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            {joinable ? (
                <Link href="/recruiter/interview" title="Open the interview room" className={`${rowClass} hover:bg-emerald-100/70 dark:hover:bg-white/10 ${focusRing}`}>
                    {body}
                </Link>
            ) : (
                <div className={rowClass}>{body}</div>
            )}
        </motion.div>
    );
}

function ActionRow({ item, index, checked, onToggle }) {
    const Icon = ACTION_ICONS[item.type] || HiOutlineFlag;
    return (
        <motion.label
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-emerald-100/70 dark:hover:bg-white/10 ${rowSurface}`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
            />
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ACTION_COLORS[item.type] || 'bg-secondary text-muted-foreground'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block break-words text-sm font-semibold ${checked ? 'text-muted-foreground line-through' : ''}`}>{item.title}</span>
                {item.detail && <span className="mt-0.5 block break-words text-xs text-muted-foreground">{item.detail}</span>}
            </span>
            <span className="shrink-0 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-500">{num(item.count)}</span>
        </motion.label>
    );
}

function PipelineTile({ stage, count, sub, index }) {
    const Icon = PIPELINE_ICONS[pipelineIconKey(stage)];
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            title={`${num(count).toLocaleString()} candidates at ${stage}`}
            className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card"
        >
            <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="min-w-0 truncate text-xs font-semibold text-muted-foreground">{stage}</p>
            </div>
            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">{num(count).toLocaleString()}</p>
            {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const Icon = STATUS_ICONS[status] || HiOutlineFlag;
    return (
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status] || 'bg-secondary text-muted-foreground'}`}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {status}
        </span>
    );
}

function Avatar({ value }) {
    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
            {initials(value)}
        </div>
    );
}

function ActivityRow({ item, index }) {
    const Icon = ACTIVITY_ICONS[item.type] || HiOutlineClock;
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex min-w-0 items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-emerald-50 dark:hover:bg-white/5"
        >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${ACTIVITY_COLORS[item.type] || 'bg-secondary text-muted-foreground'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="break-words text-sm leading-relaxed text-foreground/80">{item.text}</p>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <HiOutlineClock className="h-3 w-3" aria-hidden="true" /> {item.time}
                </span>
            </div>
        </motion.div>
    );
}

export default function RecruiterDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // Bumping `attempt` re-runs the fetch effect, which is how Retry works.
    const [attempt, setAttempt] = useState(0);
    // Captured once on mount so render stays pure.
    const [now] = useState(() => new Date());
    // Local-only checklist state for urgent actions (not saved to the server).
    const [done, setDone] = useState({});

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/accounts/recruiter/dashboard/');
                if (!cancelled) {
                    setData(res);
                    setError(false);
                }
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError(false);
        setAttempt((n) => n + 1);
    };

    const user = data?.user || {};
    const summary = data?.summary || {};
    const funnel = data?.funnel || {};
    const stats = arr(data?.stats);
    const pipeline = arr(data?.pipeline);
    const weeklyActivity = arr(data?.weeklyActivity);
    const recentApplications = arr(data?.recentApplications);
    const upcomingInterviews = arr(data?.upcomingInterviews);
    const jobPerformance = arr(data?.jobPerformance);
    const activityFeed = arr(data?.activityFeed);
    const interviewQueue = arr(data?.interviewQueue);
    const actionItems = arr(data?.actionItems);
    const statusBreakdown = arr(data?.statusBreakdown);
    const scoreDistribution = arr(data?.scoreDistribution);

    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const funnelRows = [
        { label: 'Applications', value: num(funnel.applications) },
        { label: 'Assessments', value: num(funnel.assessments) },
        { label: 'AI Interviews', value: num(funnel.ai_interviews) },
        { label: 'Real Interviews', value: num(funnel.real_interviews) },
        { label: 'Offers', value: num(funnel.offers) },
    ];

    const weeklySeries = [
        { name: 'Applicants', data: weeklyActivity.map((d) => num(d.applicants)) },
        { name: 'Assessments', data: weeklyActivity.map((d) => num(d.assessments)) },
        { name: 'Interviews', data: weeklyActivity.map((d) => num(d.interviews)) },
    ];
    const jobSeries = [
        { name: 'Applicants', data: jobPerformance.map((j) => num(j.apps)) },
        { name: 'Hires', data: jobPerformance.map((j) => num(j.hires)) },
    ];

    const errorBanner = error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
            <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Something went wrong</p>
                <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-300/70">We could not load your dashboard.</p>
            </div>
            <button
                type="button"
                onClick={retry}
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/25 dark:text-red-300 ${focusRing}`}
            >
                <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
                Retry
            </button>
        </div>
    ) : null;

    const showContent = !loading && !!data;

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            {/* ═══ Banner ═══ */}
            <DashboardBanner
                loading={loading}
                icon={HiOutlineSparkles}
                badge={loading ? null : { label: `${num(summary.totalCandidates).toLocaleString()} ${num(summary.totalCandidates) === 1 ? 'candidate' : 'candidates'} in pipeline`, icon: HiOutlineUserGroup }}
                title={loading ? 'Recruiter dashboard' : `${greeting}, ${firstName(user.name)}`}
                subtitle={loading ? today : `${today} · ${num(summary.inAssessment).toLocaleString()} in assessment · ${num(funnel.conversion)}% conversion`}
                aside={
                    loading ? (
                        <div className="flex gap-2">
                            <BannerBlock className="h-11 w-36 rounded-xl" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <Link href="/recruiter/jobs/create" className={buttonPrimary}>
                                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post job
                            </Link>
                            <Link href="/recruiter/interview" className={buttonSecondary}>
                                <HiOutlineVideoCamera className="h-4 w-4" aria-hidden="true" /> Interviews
                            </Link>
                        </div>
                    )
                }
                footer={
                    loading ? null : actionItems.length > 0 ? (
                        <span className="flex items-start gap-2">
                            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                            <span>
                                {actionItems.length} urgent {actionItems.length === 1 ? 'item needs' : 'items need'} you.{' '}
                                <Link href={ACTION_HREF[actionItems[0].type] || '/recruiter'} className={`inline-flex min-h-11 items-center rounded-md font-semibold text-emerald-950 underline underline-offset-4 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300 ${focusRing}`}>
                                    Start with &ldquo;{actionItems[0].title}&rdquo;
                                </Link>
                            </span>
                        </span>
                    ) : (
                        <span className="flex items-start gap-2">
                            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                            <span>Nothing urgent. Post a job or review new applications to keep the pipeline moving.</span>
                        </span>
                    )
                }
            />

            {errorBanner}

            {loading && <PageSkeleton stats={4} cards={4} banner={false} />}

            {showContent && (
                <>
                    {/* ═══ Stats ═══ */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.slice(0, 4).map((stat, i) => {
                            const Icon = statIcon(stat.label, i);
                            return (
                                <StatTile
                                    key={`${stat.label}-${i}`}
                                    label={stat.label}
                                    value={stat.value}
                                    icon={Icon}
                                    hint={stat.change}
                                    index={i}
                                />
                            );
                        })}
                    </div>

                    {/* ═══ Command row ═══ */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Panel
                            title="Today's interview queue"
                            subtitle={`${interviewQueue.length} in the queue`}
                            icon={HiOutlineVideoCamera}
                            delay={0}
                            className="lg:col-span-2"
                        >
                            {interviewQueue.length > 0 ? (
                                <div className="space-y-3">
                                    {interviewQueue.map((item, i) => (
                                        <QueueRow key={item.room_id || i} item={item} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={HiOutlineVideoCamera}
                                    title="No interviews today"
                                    text="Scheduled interviews for today will show up here."
                                    action={<Link href="/recruiter/interview" className={buttonPrimary}><HiOutlineVideoCamera className="h-4 w-4" aria-hidden="true" /> Interviews</Link>}
                                />
                            )}
                        </Panel>

                        <Panel title="Urgent actions" subtitle="Tick off as you go" icon={HiOutlineFire} delay={0.05}>
                            {actionItems.length > 0 ? (
                                <div className="space-y-3">
                                    {actionItems.map((item, i) => (
                                        <ActionRow
                                            key={`${item.type}-${i}`}
                                            item={item}
                                            index={i}
                                            checked={!!done[i]}
                                            onToggle={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={HiOutlineCheckBadge} title="Nothing urgent right now" text="Action items appear here when something needs you." />
                            )}
                        </Panel>
                    </div>

                    {/* ═══ Pipeline stages ═══ */}
                    <section>
                        <SectionHeader icon={HiOutlineFlag} title="Pipeline" subtitle="Candidates at each stage" />
                        {pipeline.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                {pipeline.map((p, i) => (
                                    <PipelineTile key={p.stage || i} stage={p.stage} count={p.count} sub={p.sub} index={i} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={HiOutlineFlag} title="No pipeline data yet" text="Stage counts appear once you post a job." action={<Link href="/recruiter/jobs/create" className={buttonPrimary}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post job</Link>} />
                        )}
                    </section>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Panel title="Conversion funnel" subtitle="From application to offer" icon={HiOutlineChartBar} delay={0}>
                            {hasValues(funnelRows, 'value') ? (
                                <ApexChart
                                    type="bar"
                                    height={260}
                                    series={[{ name: 'Candidates', data: funnelRows.map((r) => r.value) }]}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%' } },
                                        xaxis: { categories: funnelRows.map((r) => r.label) },
                                        colors: [EMERALD],
                                        legend: { show: false },
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineChartBar} title="No funnel data yet" text="The funnel fills in as candidates move through stages." />
                            )}
                        </Panel>

                        <Panel title="Status breakdown" subtitle="Candidates by current status" icon={HiOutlineShieldCheck} delay={0.05}>
                            {hasValues(statusBreakdown, 'value') ? (
                                <ApexChart
                                    type="donut"
                                    height={260}
                                    series={statusBreakdown.map((s) => num(s.value))}
                                    options={{
                                        labels: statusBreakdown.map((s) => s.label),
                                        colors: CHART_COLORS,
                                        legend: { position: 'bottom' },
                                        dataLabels: { enabled: false },
                                        plotOptions: { pie: { donut: { size: '65%' } } },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineShieldCheck} title="No statuses yet" text="The breakdown appears once candidates apply." />
                            )}
                        </Panel>
                    </div>

                    {/* ═══ Charts ═══ */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Panel title="Weekly activity" subtitle="Applicants, assessments and interviews" icon={HiOutlineCalendarDays} delay={0}>
                            {hasSeriesData(weeklyActivity, ['applicants', 'assessments', 'interviews']) ? (
                                <ApexChart
                                    type="area"
                                    height={260}
                                    series={weeklySeries}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        xaxis: { categories: weeklyActivity.map((d) => d.label) },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [EMERALD, VIOLET, CYAN],
                                        stroke: { curve: 'smooth', width: 2 },
                                        fill: { type: 'solid', opacity: 0.15 },
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineCalendarDays} title="No activity this week" text="Activity from the last seven days shows up here." />
                            )}
                        </Panel>

                        <Panel title="Job performance" subtitle="Applicants and hires per job" icon={HiOutlineBriefcase} delay={0.05}>
                            {hasSeriesData(jobPerformance, ['apps', 'hires']) ? (
                                <ApexChart
                                    type="bar"
                                    height={260}
                                    series={jobSeries}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
                                        xaxis: { categories: jobPerformance.map((j) => j.title) },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [CYAN, EMERALD],
                                        legend: { position: 'bottom' },
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineBriefcase} title="No job data yet" text="Post a job to start seeing per-job results." />
                            )}
                        </Panel>

                        <Panel title="Score distribution" subtitle="Candidates by score band" icon={HiOutlineStar} delay={0.1}>
                            {hasValues(scoreDistribution, 'value') ? (
                                <ApexChart
                                    type="bar"
                                    height={260}
                                    series={[{ name: 'Candidates', data: scoreDistribution.map((s) => num(s.value)) }]}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
                                        xaxis: { categories: scoreDistribution.map((s) => s.label) },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [VIOLET],
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineStar} title="No scores yet" text="Scores show up after assessments are graded." />
                            )}
                        </Panel>
                    </div>

                    {/* ═══ Lists ═══ */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Panel
                            title="Recent applications"
                            subtitle="Latest candidates who applied"
                            icon={HiOutlineUser}
                            delay={0}
                            action={<Link href="/recruiter/applications" title="Review all applications" className={viewAllLink}>View all <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
                        >
                            {recentApplications.length > 0 ? (
                                <div className="space-y-3">
                                    {recentApplications.slice(0, 4).map((app, i) => (
                                        <motion.div
                                            key={`${app.name}-${i}`}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex min-w-0 items-center gap-3 rounded-xl p-3 ${rowSurface}`}
                                        >
                                            <Avatar value={app.avatar || app.name} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="truncate text-sm font-semibold">{app.name}</span>
                                                    <StatusBadge status={app.status} />
                                                </div>
                                                <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                                                    <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                                                    <span className="truncate">{app.job || app.role}</span>
                                                </p>
                                            </div>
                                            {num(app.score) > 0 && (
                                                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                    <HiOutlineStar className="h-3 w-3" aria-hidden="true" /> {app.score}%
                                                </span>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={HiOutlineDocumentText} title="No applications yet" text="Candidates who apply will be listed here." action={<Link href="/recruiter/jobs/create" className={buttonPrimary}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post job</Link>} />
                            )}
                        </Panel>

                        <Panel
                            title="Upcoming interviews"
                            subtitle={`${upcomingInterviews.length} scheduled`}
                            icon={HiOutlineVideoCamera}
                            delay={0.05}
                            action={<Link href="/recruiter/interview" title="Open the interview schedule" className={viewAllLink}>View all <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
                        >
                            {upcomingInterviews.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingInterviews.slice(0, 4).map((iv, i) => (
                                        <motion.div
                                            key={`${iv.name}-${i}`}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex min-w-0 items-center gap-3 rounded-xl p-3 ${rowSurface}`}
                                        >
                                            <Avatar value={iv.avatar || iv.name} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="truncate text-sm font-semibold">{iv.name}</span>
                                                    {iv.type && <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-white/10 dark:text-muted-foreground">{iv.type}</span>}
                                                </div>
                                                <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                                                    <HiOutlineVideoCamera className="h-3 w-3 shrink-0" aria-hidden="true" />
                                                    <span className="truncate">{iv.role}</span>
                                                </p>
                                                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                    <HiOutlineClock className="h-3 w-3 shrink-0" aria-hidden="true" /> {iv.time}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={HiOutlineVideoCamera} title="No upcoming interviews" text="Scheduled interviews will show up here." action={<Link href="/recruiter/interview" className={buttonPrimary}><HiOutlineVideoCamera className="h-4 w-4" aria-hidden="true" /> Schedule</Link>} />
                            )}
                        </Panel>

                        <Panel title="Recent activity" subtitle="Everything happening across your jobs" icon={HiOutlineCommandLine} delay={0.1}>
                            {activityFeed.length > 0 ? (
                                <div className="space-y-1">
                                    {activityFeed.slice(0, 6).map((item, i) => (
                                        <ActivityRow key={`${item.time}-${i}`} item={item} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={HiOutlineClock} title="No activity yet" text="Activity from your jobs and candidates appears here." />
                            )}
                        </Panel>
                    </div>
                </>
            )}
        </div>
    );
}
