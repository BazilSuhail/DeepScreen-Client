'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import ProfileStrengthCard from '@/components/dashboard/ProfileStrengthCard';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ReviewCard from '@/components/dashboard/ReviewCard';
import CandidateDashboardSkeleton from '@/components/dashboard/CandidateDashboardSkeleton';
import {
    HiOutlineAcademicCap,
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineChatBubbleLeftEllipsis,
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineCodeBracket,
    HiOutlineDocumentText,
    HiOutlineEnvelope,
    HiOutlineExclamationTriangle,
    HiOutlineFire,
    HiOutlineFlag,
    HiOutlineMagnifyingGlass,
    HiOutlinePaperAirplane,
    HiOutlineShieldCheck,
    HiOutlineSparkles,
    HiOutlineStar,
    HiOutlineVideoCamera,
} from 'react-icons/hi2';

const STAT_ICON_MAP = {
    HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineStar,
    HiOutlineBriefcase, HiOutlineVideoCamera, HiOutlineAcademicCap, HiOutlineClock,
};
const STAT_FALLBACK_ICONS = [HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlinePaperAirplane];
const STAT_TONES = ['blue', 'emerald', 'purple', 'cyan'];

const STAGE_STYLES = {
    Applied: 'bg-blue-500/10 text-blue-500',
    Shortlisted: 'bg-emerald-500/10 text-emerald-500',
    'Coding Pending': 'bg-amber-500/10 text-amber-500',
    'Coding Passed': 'bg-emerald-500/10 text-emerald-500',
    'Ai Interview Pending': 'bg-violet-500/10 text-violet-500',
    'Ai Interview Passed': 'bg-violet-500/10 text-violet-500',
    'Real Interview Scheduled': 'bg-cyan-500/10 text-cyan-500',
    Offered: 'bg-purple-500/10 text-purple-400',
    Hired: 'bg-emerald-500/10 text-emerald-500',
    Rejected: 'bg-rose-500/10 text-rose-500',
};

const ACTIVITY_ICONS = {
    success: HiOutlineCheckCircle,
    offer: HiOutlinePaperAirplane,
    interview: HiOutlineVideoCamera,
    ai: HiOutlineChatBubbleLeftEllipsis,
    assessment: HiOutlineAcademicCap,
    rejection: HiOutlineExclamationTriangle,
    pending: HiOutlineClock,
    application: HiOutlineDocumentText,
};

const ACTIVITY_COLORS = {
    success: 'bg-emerald-500/10 text-emerald-500',
    offer: 'bg-purple-500/10 text-purple-400',
    interview: 'bg-cyan-500/10 text-cyan-500',
    ai: 'bg-violet-500/10 text-violet-500',
    assessment: 'bg-emerald-500/10 text-emerald-500',
    rejection: 'bg-rose-500/10 text-rose-500',
    pending: 'bg-amber-500/10 text-amber-500',
    application: 'bg-blue-500/10 text-blue-500',
};


const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

const EMERALD = '#10b981';
const VIOLET = '#8b5cf6';
const CYAN = '#06b6d4';

const hasData = (rows, key) => Array.isArray(rows) && rows.some((r) => Number(r[key]) > 0);
const firstName = (name) => (name || '').split(' ')[0] || 'there';
const shortDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function stageIcon(stage = '') {
    const s = stage.toLowerCase();
    if (s.includes('shortlist')) return HiOutlineShieldCheck;
    if (s.includes('coding')) return HiOutlineCodeBracket;
    if (s.includes('ai')) return HiOutlineChatBubbleLeftEllipsis;
    if (s.includes('interview')) return HiOutlineVideoCamera;
    if (s.includes('offer')) return HiOutlinePaperAirplane;
    if (s.includes('hire')) return HiOutlineCheckCircle;
    if (s.includes('reject')) return HiOutlineExclamationTriangle;
    return HiOutlineBriefcase;
}

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

function StageBadge({ stage }) {
    return (
        <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${STAGE_STYLES[stage] || 'bg-secondary text-muted-foreground'}`}>
            {stage}
        </span>
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

export default function CandidateDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                setData(await api.get('/accounts/candidate/dashboard/'));
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

    if (loading) return <CandidateDashboardSkeleton />;

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
        return <div className="mx-auto w-full min-w-0 space-y-14 px-5 pb-20 md:px-10 lg:px-12">{errorBanner}</div>;
    }

    const user = data.user || {};
    const stats = data.stats || [];
    const stageBreakdown = data.stageBreakdown || [];
    const statusBreakdown = data.statusBreakdown || [];
    const weeklyActivity = data.weeklyActivity || [];
    const applicationScores = data.applicationScores || [];
    const assessmentTrend = data.assessmentTrend || [];
    const aiReviews = data.aiReviews || [];
    const recentApplications = data.recentApplications || [];
    const upcomingInterviews = data.upcomingInterviews || [];
    const activity = data.activity || [];
    const summary = data.summary || {};
    const strengthItems = summary.strengthChecklist || [];
    const strengthDone = strengthItems.filter((item) => item.done).length;
    const strengthPercent = strengthItems.length ? Math.round((strengthDone / strengthItems.length) * 100) : 0;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const weeklySeries = [{ name: 'Applicants', data: weeklyActivity.map((d) => d.applicants) }];
    const stageSeries = [{ name: 'Candidates', data: stageBreakdown.map((s) => s.value) }];
    const statusSeries = statusBreakdown.map((s) => s.value);
    const scoreSeries = [{ name: 'Score', data: applicationScores.map((a) => a.score) }];
    const trendSeries = [{ name: 'Score', data: assessmentTrend.map((a) => a.percentage) }];

    return (
        <div className="mx-auto w-full min-w-0 space-y-10 px-5 pb-20 md:px-8 ">
            {/* ═══ Hero ═══ */}
            <div className="[&_.py-6]:py-4 [&_.py-8]:py-5 [&_.gap-6]:gap-4 [&_.h-24]:h-16 [&_.w-24]:w-16">
                <DashboardBanner
                    date={today}
                    title={`Welcome back, ${firstName(user.name)}`}
                    subtitle={
                        <span className="flex min-w-0 items-center gap-2">
                            <HiOutlineEnvelope className="h-4 w-4 shrink-0" aria-hidden="true" /> {user.email}
                        </span>
                    }
                    ring={{ label: 'Profile strength', value: strengthPercent }}
                    aside={<ProfileStrengthCard items={strengthItems} />}
                />
            </div>

            {errorBanner}

            {/* ═══ Stats ═══ */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[...stats, { label: 'Assessments', value: data.assessments?.total ?? 0, icon: 'HiOutlineAcademicCap' }].map((stat, i) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={STAT_ICON_MAP[stat.icon] || STAT_FALLBACK_ICONS[i] || HiOutlineDocumentText}
                        tone={STAT_TONES[i] || 'emerald'}
                        delay={i * 0.08}
                    />
                ))}
            </div>

            {/* ═══ Charts ═══ */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ChartCard title="Weekly applications" subtitle="Applicants per day" icon={HiOutlineChartBar} delay={0}>
                    {hasData(weeklyActivity, 'applicants') ? (
                        <ApexChart
                            type="area"
                            height={260}
                            series={weeklySeries}
                            options={{
                                chart: { toolbar: { show: false } },
                                xaxis: { categories: weeklyActivity.map((d) => d.label) },
                                yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                colors: [EMERALD],
                                stroke: { curve: 'smooth', width: 2 },
                                fill: { type: 'solid', opacity: 0.2 },
                                dataLabels: { enabled: false },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineCalendarDays} title="No activity this week" text="Applications you submit this week will show up here." />
                    )}
                </ChartCard>

                <ChartCard title="Pipeline stages" subtitle="Where your applications sit" icon={HiOutlineFlag} delay={0.05}>
                    {hasData(stageBreakdown, 'value') ? (
                        <ApexChart
                            type="bar"
                            height={260}
                            series={stageSeries}
                            options={{
                                chart: { toolbar: { show: false } },
                                plotOptions: { bar: { horizontal: true, borderRadius: 6, distributed: true, barHeight: '60%' } },
                                xaxis: { categories: stageBreakdown.map((s) => s.label) },
                                colors: CHART_COLORS,
                                legend: { show: false },
                                dataLabels: { enabled: false },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineFlag} title="No stages yet" text="Your pipeline will fill in once you apply to a job." />
                    )}
                </ChartCard>

                <ChartCard title="Application status" subtitle="Breakdown by outcome" icon={HiOutlineShieldCheck} delay={0.1}>
                    {hasData(statusBreakdown, 'value') ? (
                        <ApexChart
                            type="donut"
                            height={260}
                            series={statusSeries}
                            options={{
                                labels: statusBreakdown.map((s) => s.label),
                                colors: CHART_COLORS,
                                legend: { position: 'bottom' },
                                dataLabels: { enabled: false },
                                plotOptions: { pie: { donut: { size: '65%' } } },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineDocumentText} title="No applications yet" text="Your status breakdown appears after your first application." />
                    )}
                </ChartCard>

                <ChartCard title="Application scores" subtitle="Score per job, oldest first" icon={HiOutlineStar} delay={0.15}>
                    {hasData(applicationScores, 'score') ? (
                        <ApexChart
                            type="bar"
                            height={260}
                            series={scoreSeries}
                            options={{
                                chart: { toolbar: { show: false } },
                                plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
                                xaxis: { categories: applicationScores.map((a) => a.job) },
                                yaxis: { min: 0, max: 100 },
                                colors: [VIOLET],
                                dataLabels: { enabled: false },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineStar} title="No scores yet" text="Scores show up after your assessments are graded." />
                    )}
                </ChartCard>

                <ChartCard title="Assessment trend" subtitle="Your results over time" icon={HiOutlineAcademicCap} delay={0.2} className="lg:col-span-2">
                    {hasData(assessmentTrend, 'percentage') ? (
                        <ApexChart
                            type="line"
                            height={260}
                            series={trendSeries}
                            options={{
                                chart: { toolbar: { show: false } },
                                xaxis: { categories: assessmentTrend.map((a) => shortDate(a.date)) },
                                yaxis: { min: 0, max: 100 },
                                colors: [CYAN],
                                stroke: { curve: 'smooth', width: 3 },
                                markers: { size: 4 },
                                dataLabels: { enabled: false },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineAcademicCap} title="No assessments yet" text="Complete an assessment to start tracking your trend." />
                    )}
                </ChartCard>
            </div>

            {/* ═══ AI Reviews ═══ */}
            <section>
                <SectionHeader icon={HiOutlineSparkles} tone="bg-violet-500/10 text-violet-500" title="AI interview reviews" subtitle="Feedback from your AI interviews" />
                {aiReviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {aiReviews.map((review, i) => (
                            <motion.div
                                key={`${review.job}-${review.date}-${i}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="min-w-0"
                            >
                                <ReviewCard review={review} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={HiOutlineSparkles} title="No AI reviews yet" text="Reviews appear here once your AI interviews are evaluated." />
                )}
            </section>

            {/* ═══ Lists ═══ */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <ChartCard
                    title="Upcoming interviews"
                    subtitle={`${upcomingInterviews.length} scheduled`}
                    icon={HiOutlineVideoCamera}
                    delay={0}
                >
                    {upcomingInterviews.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingInterviews.map((iv, i) => (
                                <motion.div
                                    key={iv.room_id || i}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex min-w-0 items-center gap-3 rounded-xl bg-secondary/30 p-3"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                                        <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{iv.title}</p>
                                        <p className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                                            <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" /> <span className="truncate">{iv.job}</span>
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                            <HiOutlineClock className="h-3 w-3 shrink-0" aria-hidden="true" /> {iv.time}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/candidate/interview/${iv.room_id}`}
                                        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-600"
                                    >
                                        <HiOutlineVideoCamera className="h-3.5 w-3.5" aria-hidden="true" /> Join
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={HiOutlineVideoCamera}
                            title="No upcoming interviews"
                            text="Scheduled interviews will show up here."
                            action={<Link href="/jobs" className={linkButton}><HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> Browse jobs</Link>}
                        />
                    )}
                </ChartCard>

                <ChartCard
                    title="Recent applications"
                    subtitle="Latest submissions"
                    icon={HiOutlineBriefcase}
                    delay={0.05}
                    action={<Link href="/candidate/applications" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/10">View all <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
                >
                    {recentApplications.length > 0 ? (
                        <div className="space-y-3">
                            {recentApplications.slice(0, 5).map((app, i) => {
                                const StageIcon = stageIcon(app.stage);
                                return (
                                    <motion.div
                                        key={app.application_id ?? i}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex min-w-0 items-center gap-3 rounded-xl bg-secondary/30 p-3"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                            <StageIcon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{app.job_title}</p>
                                            <p className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                                                <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                                                <span className="truncate">{app.organization}</span>
                                                <span className="text-muted-foreground/40">&middot;</span>
                                                <HiOutlineCalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
                                                <span className="shrink-0">{new Date(app.applied_date).toLocaleDateString()}</span>
                                            </p>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                <StageBadge stage={app.stage} />
                                                {app.score != null && (
                                                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                                        <HiOutlineStar className="h-3 w-3" aria-hidden="true" /> {app.score}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            icon={HiOutlineDocumentText}
                            title="No applications yet"
                            text="Jobs you apply to will be listed here."
                            action={<Link href="/jobs" className={linkButton}><HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" /> Explore jobs</Link>}
                        />
                    )}
                </ChartCard>

                <ChartCard title="Recent activity" subtitle="Everything happening with your apps" icon={HiOutlineFire} delay={0.1}>
                    {activity.length > 0 ? (
                        <div className="space-y-1">
                            {activity.slice(0, 6).map((item, i) => (
                                <ActivityRow key={`${item.time}-${i}`} item={item} index={i} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={HiOutlineClock}
                            title="No activity yet"
                            text="Start by applying to jobs."
                            action={<Link href="/jobs" className={linkButton}><HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" /> Browse jobs</Link>}
                        />
                    )}
                </ChartCard>
            </div>
        </div>
    );
}