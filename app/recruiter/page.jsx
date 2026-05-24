'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import RecruiterDashboardSkeleton from '@/components/skeletons/recruiter/RecruiterDashboardSkeleton';
import { base, fadeUp, stagger } from '@/constants/motion';
import { card, focusRing, iconTile, primaryButton as buttonPrimary, secondaryButton as buttonSecondary } from '@/components/ui/styles';
import {
    HiOutlineAcademicCap,
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
const TEAL = '#14b8a6';
const AMBER = '#f59e0b';

const STAT_FALLBACK_ICONS = [HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineVideoCamera, HiOutlineStar];

const QUEUE_STATUS = {
    waiting: { label: 'Waiting', icon: HiOutlineClock, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-500' },
    live: { label: 'Live', dot: true, cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    feedback: { label: 'Feedback', icon: HiOutlineChatBubbleLeftEllipsis, cls: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
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
    feedback: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    conflict: 'bg-red-500/10 text-red-600 dark:text-red-400',
    schedule: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
};

const STATUS_STYLES = {
    Evaluated: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    'AI Round': 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    Technical: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    Screening: 'bg-secondary text-muted-foreground',
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
    assessment: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    application: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    ai: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    interview: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    offer: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    hire: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

const viewAllLink = `flex min-h-11 items-center gap-1 rounded-md px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-white/5 ${focusRing}`;
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
// Empty when the name is missing so the greeting reads "Good morning" instead of a placeholder.
const firstName = (name) => (name || '').trim().split(' ')[0];
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

// Card shell used by every panel on this page: icon tile, title, helper text, optional action.
function Panel({ title, subtitle, icon: Icon, action, delay = 0, className = '', children }) {
    return (
        <motion.section
            {...fadeUp}
            transition={{ ...base, delay }}
            className={`${card} flex min-w-0 flex-col p-5 lg:p-6 ${className}`}
        >
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    {Icon && (
                        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{title}</h2>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                {action && <div className="-my-2 shrink-0">{action}</div>}
            </div>
            <div className="min-w-0 flex-1">{children}</div>
        </motion.section>
    );
}

function StatTile({ label, value, icon: Icon, hint, index }) {
    return (
        <motion.div
            {...fadeUp}
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            className={`${card} relative min-w-0 overflow-hidden p-5`}
        >
            <span className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" aria-hidden="true" />
            <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{num(value).toLocaleString()}</p>
            {hint && <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>}
        </motion.div>
    );
}

function QueueStatusPill({ statusKey }) {
    const meta = QUEUE_STATUS[statusKey] || QUEUE_STATUS.completed;
    const Icon = meta.icon;
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${meta.cls}`}>
            {meta.dot ? (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full motion-reduce:animate-none bg-emerald-400 opacity-75" />
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
    const rowClass = `flex min-h-11 min-w-0 items-center gap-3 rounded-md p-3 transition-colors ${rowSurface}`;
    const body = (
        <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
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
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
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
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-md p-3 transition-colors hover:bg-emerald-100/70 dark:hover:bg-white/10 ${rowSurface}`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
            />
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${ACTION_COLORS[item.type] || 'bg-secondary text-muted-foreground'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block break-words text-sm font-semibold ${checked ? 'text-muted-foreground line-through' : ''}`}>{item.title}</span>
                {item.detail && <span className="mt-0.5 block break-words text-xs text-muted-foreground">{item.detail}</span>}
            </span>
            <span className="shrink-0 rounded-sm bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">{num(item.count)}</span>
        </motion.label>
    );
}

function PipelineTile({ stage, count, sub, index }) {
    const Icon = PIPELINE_ICONS[pipelineIconKey(stage)];
    return (
        <motion.div
            {...fadeUp}
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            title={`${num(count).toLocaleString()} candidates at ${stage}`}
            className="min-w-0 rounded-md border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5"
        >
            <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
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
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status] || 'bg-secondary text-muted-foreground'}`}>
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
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            className="flex min-w-0 items-start gap-3 rounded-md p-2.5 transition-colors hover:bg-emerald-50 dark:hover:bg-white/5"
        >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm ${ACTIVITY_COLORS[item.type] || 'bg-secondary text-muted-foreground'}`}>
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

    const errorBanner = error ? <ErrorState title="Something went wrong" message="We could not load your dashboard." onRetry={retry} /> : null;

    const showContent = !loading && !!data;

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 2xl:px-10">
            {/* ═══ Banner ═══ */}
            <DashboardBanner
                loading={loading}
                icon={HiOutlineSparkles}
                badge={!showContent ? null : { label: `${num(summary.totalCandidates).toLocaleString()} ${num(summary.totalCandidates) === 1 ? 'candidate' : 'candidates'} in pipeline`, icon: HiOutlineUserGroup }}
                title={!showContent ? 'Recruiter dashboard' : [greeting, firstName(user.name)].filter(Boolean).join(', ')}
                subtitle={!showContent ? today : `${today} · ${num(summary.inAssessment).toLocaleString()} in assessment · ${num(funnel.conversion)}% conversion`}
                aside={
                    loading ? (
                        <div className="flex gap-2">
                            <BannerBlock className="h-11 w-36 rounded-md" />
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
                    !showContent ? null : actionItems.length > 0 ? (
                        <span className="flex items-start gap-2">
                            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                            <span>
                                {actionItems.length} urgent {actionItems.length === 1 ? 'item needs' : 'items need'} you.{' '}
                                <Link href={ACTION_HREF[actionItems[0].type] || '/recruiter'} className={`inline-flex min-h-11 items-center rounded-sm font-semibold text-emerald-950 underline underline-offset-4 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300 ${focusRing}`}>
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

            {loading && <RecruiterDashboardSkeleton banner={false} />}

            {showContent && (
                <>
                    {/* ═══ Stats ═══ */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

                    {/* ═══ Pipeline stages ═══ */}
                    <Panel icon={HiOutlineFlag} title="Pipeline" subtitle="Candidates at each stage">
                        {pipeline.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {pipeline.map((p, i) => (
                                    <PipelineTile key={p.stage || i} stage={p.stage} count={p.count} sub={p.sub} index={i} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={HiOutlineFlag} title="No pipeline data yet" text="Stage counts appear once you post a job." action={<Link href="/recruiter/jobs/create" className={buttonPrimary}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post job</Link>} />
                        )}
                    </Panel>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <Panel
                            title="Today's interview queue"
                            subtitle={`${interviewQueue.length} in the queue`}
                            icon={HiOutlineVideoCamera}
                            delay={0}
                            className="lg:col-span-8"
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

                        <Panel title="Urgent actions" subtitle="Tick off as you go" icon={HiOutlineFire} delay={0.05} className="lg:col-span-4">
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

                    {/* ═══ Charts ═══ */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-6">
                        <Panel title="Weekly activity" subtitle="Applicants, assessments and interviews" icon={HiOutlineCalendarDays} delay={0} className="lg:col-span-2 xl:col-span-4">
                            {hasSeriesData(weeklyActivity, ['applicants', 'assessments', 'interviews']) ? (
                                <ApexChart
                                    type="area"
                                    height={260}
                                    series={weeklySeries}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        xaxis: { categories: weeklyActivity.map((d) => d.label) },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [EMERALD, TEAL, AMBER],
                                        stroke: { curve: 'smooth', width: 2 },
                                        fill: { type: 'solid', opacity: 0.15 },
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineCalendarDays} title="No activity this week" text="Activity from the last seven days shows up here." />
                            )}
                        </Panel>

                        <Panel title="Conversion funnel" className="xl:col-span-2" subtitle="From application to offer" icon={HiOutlineChartBar} delay={0}>
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

                        <Panel title="Status breakdown" subtitle="Candidates by current status" icon={HiOutlineShieldCheck} delay={0.05} className="xl:col-span-2">
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

                        <Panel title="Job performance" subtitle="Applicants and hires per job" icon={HiOutlineBriefcase} delay={0.1} className="xl:col-span-2">
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
                                        colors: [TEAL, EMERALD],
                                        legend: { position: 'bottom' },
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineBriefcase} title="No job data yet" text="Post a job to start seeing per-job results." />
                            )}
                        </Panel>

                        <Panel title="Score distribution" subtitle="Candidates by score band" icon={HiOutlineStar} delay={0.15} className="xl:col-span-2">
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
                                        colors: [TEAL],
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineStar} title="No scores yet" text="Scores show up after assessments are graded." />
                            )}
                        </Panel>
                    </div>

                    {/* ═══ Lists ═══ */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
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
                                            transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                                            className={`flex min-w-0 items-center gap-3 rounded-md p-3 ${rowSurface}`}
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
                                            transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                                            className={`flex min-w-0 items-center gap-3 rounded-md p-3 ${rowSurface}`}
                                        >
                                            <Avatar value={iv.avatar || iv.name} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="truncate text-sm font-semibold">{iv.name}</span>
                                                    {iv.type && <span className="shrink-0 rounded-sm bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-white/10 dark:text-muted-foreground">{iv.type}</span>}
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

                        <Panel title="Recent activity" subtitle="Everything happening across your jobs" icon={HiOutlineCommandLine} delay={0.1} className="lg:col-span-2 2xl:col-span-1">
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
