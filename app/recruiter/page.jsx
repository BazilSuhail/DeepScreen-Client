'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
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
} from 'react-icons/hi2';

// Chart palette, written out so the options read clearly.
const EMERALD = '#10b981';
const VIOLET = '#8b5cf6';
const CYAN = '#06b6d4';

const STAT_TONES = ['blue', 'emerald', 'purple', 'amber'];
const STAT_FALLBACK_ICONS = [HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineVideoCamera, HiOutlineStar];

const QUEUE_STATUS = {
    waiting: { label: 'Waiting', cls: 'bg-amber-500/10 text-amber-500' },
    live: { label: 'Live', cls: 'bg-emerald-500/10 text-emerald-500', dot: true },
    feedback: { label: 'Feedback', cls: 'bg-rose-500/10 text-rose-500' },
    completed: { label: 'Completed', cls: 'bg-secondary text-muted-foreground' },
    cancelled: { label: 'Cancelled', cls: 'bg-secondary text-muted-foreground' },
};

const ACTION_ICONS = {
    score: HiOutlineStar,
    feedback: HiOutlineChatBubbleLeftEllipsis,
    conflict: HiOutlineExclamationTriangle,
    schedule: HiOutlineCalendarDays,
};

const ACTION_COLORS = {
    score: 'bg-amber-500/10 text-amber-500',
    feedback: 'bg-rose-500/10 text-rose-500',
    conflict: 'bg-red-500/10 text-red-400',
    schedule: 'bg-cyan-500/10 text-cyan-500',
};

const STATUS_STYLES = {
    Evaluated: 'bg-emerald-500/10 text-emerald-500',
    'AI Round': 'bg-violet-500/10 text-violet-500',
    Technical: 'bg-cyan-500/10 text-cyan-500',
    Screening: 'bg-blue-500/10 text-blue-500',
    Review: 'bg-amber-500/10 text-amber-500',
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
    assessment: 'bg-cyan-500/10 text-cyan-500',
    application: 'bg-blue-500/10 text-blue-500',
    ai: 'bg-violet-500/10 text-violet-500',
    interview: 'bg-cyan-500/10 text-cyan-500',
    offer: 'bg-purple-500/10 text-purple-400',
    hire: 'bg-emerald-500/10 text-emerald-500',
    success: 'bg-emerald-500/10 text-emerald-500',
};

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';
const viewAllLink = 'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/10';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

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
    const s = label.toLowerCase();
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
    const s = stage.toLowerCase();
    if (s.includes('job')) return 'job';
    if (s.includes('application')) return 'application';
    if (s.includes('coding') || s.includes('assess')) return 'coding';
    if (s.includes('real')) return 'real';
    if (s.includes('ai')) return 'ai';
    return 'default';
};

function SectionHeader({ icon: Icon, tone, title, subtitle }) {
    return (
        <div className="mb-5 flex min-w-0 items-center gap-3">
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

function QueueStatusPill({ statusKey }) {
    const meta = QUEUE_STATUS[statusKey] || QUEUE_STATUS.completed;
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${meta.cls}`}>
            {meta.dot && (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
            )}
            {meta.label}
        </span>
    );
}

function QueueRow({ item, index }) {
    const joinable = item.statusKey === 'live' || item.statusKey === 'waiting';
    const rowClass = 'flex min-w-0 items-center gap-3 rounded-xl bg-secondary/30 p-3 transition-colors';
    const body = (
        <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.job}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
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
                <Link href="/recruiter/interview" title="Open the interview room" className={`${rowClass} hover:bg-secondary/50`}>
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
            className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
            />
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ACTION_COLORS[item.type] || 'bg-secondary text-muted-foreground'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block break-words text-sm font-semibold ${checked ? 'text-muted-foreground line-through' : ''}`}>{item.title}</span>
                {item.detail && <span className="mt-0.5 block break-words text-xs text-muted-foreground">{item.detail}</span>}
            </span>
            <span className="shrink-0 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">{num(item.count)}</span>
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
            className="min-w-0 rounded-2xl border border-border bg-card p-5"
        >
            <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="min-w-0 truncate text-xs font-semibold text-muted-foreground">{stage}</p>
            </div>
            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">{num(count).toLocaleString()}</p>
            {sub && <p className="mt-1 truncate text-xs text-muted-foreground/70">{sub}</p>}
        </motion.div>
    );
}

function StatusBadge({ status }) {
    return (
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status] || 'bg-secondary text-muted-foreground'}`}>
            {status}
        </span>
    );
}

function Avatar({ value }) {
    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-emerald-500/10 text-xs font-semibold text-emerald-500">
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
            className="flex min-w-0 items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary/20"
        >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${ACTIVITY_COLORS[item.type] || 'bg-secondary text-muted-foreground'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="break-words text-sm leading-relaxed text-foreground/80">{item.text}</p>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/60">
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
    // Local-only checklist state for urgent actions (not saved to the server).
    const [done, setDone] = useState({});

    useEffect(() => {
        (async () => {
            try {
                setData(await api.get('/accounts/recruiter/dashboard/'));
                setError(false);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError(false);
        setAttempt((n) => n + 1);
    };

    if (loading) return <PageSkeleton stats={4} cards={4} />;

    const errorBanner = error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
            <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-300">Something went wrong</p>
                <p className="mt-0.5 text-xs text-red-300/70">We could not load your dashboard.</p>
            </div>
            <button
                type="button"
                onClick={retry}
                className="shrink-0 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            >
                Retry
            </button>
        </div>
    ) : null;

    if (!data) {
        return <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">{errorBanner}</div>;
    }

    const user = data.user || {};
    const summary = data.summary || {};
    const funnel = data.funnel || {};
    const stats = Array.isArray(data.stats) ? data.stats : [];
    const pipeline = Array.isArray(data.pipeline) ? data.pipeline : [];
    const weeklyActivity = Array.isArray(data.weeklyActivity) ? data.weeklyActivity : [];
    const recentApplications = Array.isArray(data.recentApplications) ? data.recentApplications : [];
    const upcomingInterviews = Array.isArray(data.upcomingInterviews) ? data.upcomingInterviews : [];
    const jobPerformance = Array.isArray(data.jobPerformance) ? data.jobPerformance : [];
    const activityFeed = Array.isArray(data.activityFeed) ? data.activityFeed : [];
    const interviewQueue = Array.isArray(data.interviewQueue) ? data.interviewQueue : [];
    const actionItems = Array.isArray(data.actionItems) ? data.actionItems : [];
    const statusBreakdown = Array.isArray(data.statusBreakdown) ? data.statusBreakdown : [];
    const scoreDistribution = Array.isArray(data.scoreDistribution) ? data.scoreDistribution : [];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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

    return (
        <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
            {/* ═══ Hero ═══ */}
            <DashboardBanner
                icon={HiOutlineSparkles}
                badge={{ label: `${num(summary.totalCandidates).toLocaleString()} ${num(summary.totalCandidates) === 1 ? 'candidate' : 'candidates'} in pipeline`, icon: HiOutlineUserGroup }}
                title={`${greeting}, ${firstName(user.name)}`}
                subtitle={`${today} · ${num(summary.inAssessment).toLocaleString()} in assessment`}
                footer={
                    actionItems.length > 0 ? (
                        <span className="flex items-start gap-2">
                            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                            <span>
                                {actionItems.length} urgent {actionItems.length === 1 ? 'item needs' : 'items need'} you.{' '}
                                <Link href={ACTION_HREF[actionItems[0].type] || '/recruiter'} className="font-semibold text-white underline underline-offset-4 hover:text-emerald-300">
                                    Start with &ldquo;{actionItems[0].title}&rdquo;
                                </Link>
                            </span>
                        </span>
                    ) : (
                        <span className="flex items-start gap-2">
                            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                            <span>Nothing urgent. Post a job or review new applications to keep the pipeline moving.</span>
                        </span>
                    )
                }
                ring={{ label: 'Conversion', value: num(funnel.conversion) }}
                emptyText={actionItems.length > 0 ? 'Urgent items are listed below' : 'Nothing urgent right now'}
            />

            {errorBanner}

            {/* ═══ Stats ═══ */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
                {stats.slice(0, 4).map((stat, i) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={num(stat.value)}
                        icon={statIcon(stat.label, i)}
                        tone={STAT_TONES[i] || 'emerald'}
                        hint={stat.change}
                        delay={i * 0.08}
                    />
                ))}
            </div>

            {/* ═══ Command row ═══ */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <ChartCard
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
                            action={<Link href="/recruiter/interview" className={linkButton}><HiOutlineVideoCamera className="h-4 w-4" aria-hidden="true" /> Interviews</Link>}
                        />
                    )}
                </ChartCard>

                <ChartCard title="Urgent actions" subtitle="Tick off as you go" icon={HiOutlineFire} delay={0.05}>
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
                </ChartCard>
            </div>

            {/* ═══ Pipeline stages ═══ */}
            <section>
                <SectionHeader icon={HiOutlineFlag} tone="bg-emerald-500/10 text-emerald-500" title="Pipeline" subtitle="Candidates at each stage" />
                {pipeline.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        {pipeline.map((p, i) => (
                            <PipelineTile key={p.stage || i} stage={p.stage} count={p.count} sub={p.sub} index={i} />
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={HiOutlineFlag} title="No pipeline data yet" text="Stage counts appear once you post a job." action={<Link href="/recruiter/jobs/create" className={linkButton}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post job</Link>} />
                )}
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ChartCard title="Conversion funnel" subtitle="From application to offer" icon={HiOutlineChartBar} delay={0}>
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
                </ChartCard>

                <ChartCard title="Status breakdown" subtitle="Candidates by current status" icon={HiOutlineShieldCheck} delay={0.05}>
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
                </ChartCard>
            </div>

            {/* ═══ Charts ═══ */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <ChartCard title="Weekly activity" subtitle="Applicants, assessments and interviews" icon={HiOutlineCalendarDays} delay={0}>
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
                </ChartCard>

                <ChartCard title="Job performance" subtitle="Applicants and hires per job" icon={HiOutlineBriefcase} delay={0.05}>
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
                </ChartCard>

                <ChartCard title="Score distribution" subtitle="Candidates by score band" icon={HiOutlineStar} delay={0.1}>
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
                </ChartCard>
            </div>

            {/* ═══ Lists ═══ */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <ChartCard
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
                                    className="flex min-w-0 items-center gap-3 rounded-xl bg-secondary/30 p-3"
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
                                        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-500">
                                            <HiOutlineStar className="h-3 w-3" aria-hidden="true" /> {app.score}%
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={HiOutlineDocumentText} title="No applications yet" text="Candidates who apply will be listed here." action={<Link href="/recruiter/jobs/create" className={linkButton}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post job</Link>} />
                    )}
                </ChartCard>

                <ChartCard
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
                                    className="flex min-w-0 items-center gap-3 rounded-xl bg-secondary/30 p-3"
                                >
                                    <Avatar value={iv.avatar || iv.name} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="truncate text-sm font-semibold">{iv.name}</span>
                                            {iv.type && <span className="shrink-0 rounded bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{iv.type}</span>}
                                        </div>
                                        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                                            <HiOutlineVideoCamera className="h-3 w-3 shrink-0" aria-hidden="true" />
                                            <span className="truncate">{iv.role}</span>
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                            <HiOutlineClock className="h-3 w-3 shrink-0" aria-hidden="true" /> {iv.time}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={HiOutlineVideoCamera} title="No upcoming interviews" text="Scheduled interviews will show up here." action={<Link href="/recruiter/interview" className={linkButton}><HiOutlineVideoCamera className="h-4 w-4" aria-hidden="true" /> Schedule</Link>} />
                    )}
                </ChartCard>

                <ChartCard title="Recent activity" subtitle="Everything happening across your jobs" icon={HiOutlineCommandLine} delay={0.1}>
                    {activityFeed.length > 0 ? (
                        <div className="space-y-1">
                            {activityFeed.slice(0, 6).map((item, i) => (
                                <ActivityRow key={`${item.time}-${i}`} item={item} index={i} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={HiOutlineClock} title="No activity yet" text="Activity from your jobs and candidates appears here." />
                    )}
                </ChartCard>
            </div>
        </div>
    );
}
