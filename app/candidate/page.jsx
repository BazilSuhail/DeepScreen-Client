'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import { base, fadeUp, stagger } from '@/constants/motion';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import ProfileStrengthCard from '@/components/dashboard/ProfileStrengthCard';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import ReviewCard from '@/components/dashboard/ReviewCard';
import CandidateDashboardSkeleton from '@/components/skeletons/candidate/CandidateDashboardSkeleton';
import { badge, card, focusRing, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';
import {
    HiOutlineAcademicCap,
    HiOutlineArrowRight,
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
    HiOutlineRocketLaunch,
    HiOutlineShieldCheck,
    HiOutlineSparkles,
    HiOutlineStar,
    HiOutlineVideoCamera,
    HiOutlineArrowTrendingUp,
    HiOutlineBuildingOffice2,
} from 'react-icons/hi2';

const STAT_ICON_MAP = {
    HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineStar,
    HiOutlineBriefcase, HiOutlineVideoCamera, HiOutlineAcademicCap, HiOutlineClock,
};
const STAT_FALLBACK_ICONS = [HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlinePaperAirplane];

const TEAL = 'bg-teal-500/10 text-teal-700 dark:text-teal-300';
const EMERALD_TONE = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
const AMBER = 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
const RED = 'bg-red-500/10 text-red-700 dark:text-red-300';

const STAGE_STYLES = {
    Applied: TEAL,
    Shortlisted: EMERALD_TONE,
    'Coding Pending': AMBER,
    'Coding Passed': EMERALD_TONE,
    'Ai Interview Pending': AMBER,
    'Ai Interview Passed': EMERALD_TONE,
    'Real Interview Scheduled': TEAL,
    Offered: TEAL,
    Hired: EMERALD_TONE,
    Rejected: RED,
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
    success: EMERALD_TONE,
    offer: TEAL,
    interview: TEAL,
    ai: TEAL,
    assessment: EMERALD_TONE,
    rejection: RED,
    pending: AMBER,
    application: EMERALD_TONE,
};

// Shortcuts shown under "Next steps" after the profile checklist items.
const QUICK_ACTIONS = [
    { href: '/candidate/resumes', label: 'Keep your resume current', icon: HiOutlineDocumentText },
    { href: '/candidate/assessments', label: 'Check your assessments', icon: HiOutlineAcademicCap },
    { href: '/candidate/ai-interview', label: 'Review AI interviews', icon: HiOutlineSparkles },
    { href: '/jobs', label: 'Browse open roles', icon: HiOutlineMagnifyingGlass },
];

const list = (value) => (Array.isArray(value) ? value : []);

const EMERALD = '#10b981';
const TEAL_HEX = '#14b8a6';

const hasData = (rows, key) => Array.isArray(rows) && rows.some((r) => Number(r[key]) > 0);
const firstName = (name) => (name || '').split(' ')[0];
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

const viewAllLink = `inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-white/5 ${focusRing}`;

// Section card: icon tile + title + helper, optional right-side action.
function Panel({ icon: Icon, title, helper, action, index = 0, className = '', children }) {
    return (
        <motion.section
            {...fadeUp}
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            className={`min-w-0 p-5 lg:p-6 ${card} ${className}`}
        >
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold">{title}</h2>
                        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
                    </div>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </motion.section>
    );
}

function StageBadge({ stage }) {
    return (
        <span className={`${badge} shrink-0 font-semibold ${STAGE_STYLES[stage] || 'bg-muted text-muted-foreground'}`}>
            {stage}
        </span>
    );
}

const exploreAction = (label = 'Browse jobs') => (
    <Link href="/jobs" className={secondaryButton}>
        <HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" /> {label}
    </Link>
);

export default function CandidateDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [today] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

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

    const d = data || {};
    const user = d.user || {};
    const stats = list(d.stats);
    const stageBreakdown = list(d.stageBreakdown);
    const statusBreakdown = list(d.statusBreakdown);
    const weeklyActivity = list(d.weeklyActivity);
    const applicationScores = list(d.applicationScores);
    const assessmentTrend = list(d.assessmentTrend);
    const aiReviews = list(d.aiReviews);
    const recentApplications = list(d.recentApplications);
    const upcomingInterviews = list(d.upcomingInterviews);
    const activity = list(d.activity);
    const summary = d.summary || {};
    const strengthItems = list(summary.strengthChecklist);
    const openItems = strengthItems.filter((item) => !item.done);
    const name = firstName(user.name);

    const weeklySeries = [{ name: 'Applicants', data: weeklyActivity.map((w) => w.applicants) }];
    const stageSeries = [{ name: 'Candidates', data: stageBreakdown.map((s) => s.value) }];
    const statusSeries = statusBreakdown.map((s) => s.value);
    const scoreSeries = [{ name: 'Score', data: applicationScores.map((a) => a.score) }];
    const trendSeries = [{ name: 'Score', data: assessmentTrend.map((a) => a.percentage) }];

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 2xl:px-10">
            <DashboardBanner
                loading={loading}
                date={loading ? undefined : today}
                title={loading ? 'Your dashboard' : name ? `Welcome back, ${name}` : 'Welcome back'}
                subtitle={loading || !user.email ? null : (
                    <span className="flex min-w-0 items-center gap-2">
                        <HiOutlineEnvelope className="h-4 w-4 shrink-0" aria-hidden="true" /> {user.email}
                    </span>
                )}
                actions={[
                    { label: 'Browse jobs', href: '/jobs', icon: HiOutlineMagnifyingGlass },
                    { label: 'My applications', href: '/candidate/applications', icon: HiOutlineBriefcase },
                ]}
                aside={loading ? <BannerBlock className="h-40 w-full rounded-lg lg:w-72" /> : <ProfileStrengthCard items={strengthItems} />}
            />

            {error && <ErrorState message="We could not load your dashboard. Check your connection and try again." onRetry={retry} />}

            {loading && <CandidateDashboardSkeleton banner={false} />}

            {!loading && data && (<>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[...stats, { label: 'Assessments', value: d.assessments?.total ?? 0, icon: 'HiOutlineAcademicCap' }].map((stat, i) => (
                        <StatCard
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                            icon={STAT_ICON_MAP[stat.icon] || STAT_FALLBACK_ICONS[i] || HiOutlineDocumentText}
                            tone={i % 2 ? 'amber' : 'emerald'}
                            delay={Math.min(i, 8) * stagger}
                        />
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-12">
                    {/* Main column */}
                    <div className="min-w-0 space-y-6 xl:col-span-8">
                        <Panel
                            icon={HiOutlineFlag}
                            title="Application pipeline"
                            helper="Where your applications sit and how they ended"
                            action={<Link href="/candidate/applications" className={viewAllLink}>View all <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
                        >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="min-w-0">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">By stage</p>
                                    {hasData(stageBreakdown, 'value') ? (
                                        <ApexChart
                                            type="bar"
                                            height={240}
                                            series={stageSeries}
                                            options={{
                                                chart: { toolbar: { show: false } },
                                                plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true, barHeight: '60%' } },
                                                xaxis: { categories: stageBreakdown.map((s) => s.label) },
                                                colors: CHART_COLORS,
                                                legend: { show: false },
                                                dataLabels: { enabled: false },
                                            }}
                                        />
                                    ) : (
                                        <EmptyState icon={HiOutlineFlag} title="No stages yet" text="Your pipeline will fill in once you apply to a job." />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">By outcome</p>
                                    {hasData(statusBreakdown, 'value') ? (
                                        <ApexChart
                                            type="donut"
                                            height={240}
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
                                </div>
                            </div>
                        </Panel>

                        <Panel
                            icon={HiOutlineBriefcase}
                            title="Recent applications"
                            helper="Your latest submissions"
                            index={1}
                            action={<Link href="/candidate/applications" className={viewAllLink}>View all <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
                        >
                            {recentApplications.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {recentApplications.slice(0, 5).map((app, i) => {
                                        const StageIcon = stageIcon(app.stage);
                                        return (
                                            <li key={app.application_id ?? i} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                                                <span className={`${iconTile} h-10 w-10 ${STAGE_STYLES[app.stage] || 'bg-muted text-muted-foreground'}`}>
                                                    <StageIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">{app.job_title}</p>
                                                    <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                                        <span className="flex min-w-0 items-center gap-1">
                                                            <HiOutlineBuildingOffice2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                            <span className="truncate">{app.organization}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                            {new Date(app.applied_date).toLocaleDateString()}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                                                    {app.score != null && (
                                                        <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                                                            <HiOutlineStar className="h-3.5 w-3.5" aria-hidden="true" /> {app.score}%
                                                        </span>
                                                    )}
                                                    <StageBadge stage={app.stage} />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <EmptyState icon={HiOutlineDocumentText} title="No applications yet" text="Jobs you apply to will be listed here." action={exploreAction('Explore jobs')} />
                            )}
                        </Panel>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Panel icon={HiOutlineChartBar} title="Weekly applications" helper="Applicants per day" index={2}>
                                {hasData(weeklyActivity, 'applicants') ? (
                                    <ApexChart
                                        type="area"
                                        height={240}
                                        series={weeklySeries}
                                        options={{
                                            chart: { toolbar: { show: false } },
                                            xaxis: { categories: weeklyActivity.map((w) => w.label) },
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
                            </Panel>
                            <Panel icon={HiOutlineStar} title="Application scores" helper="Score per job, oldest first" index={3}>
                                {hasData(applicationScores, 'score') ? (
                                    <ApexChart
                                        type="bar"
                                        height={240}
                                        series={scoreSeries}
                                        options={{
                                            chart: { toolbar: { show: false } },
                                            plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
                                            xaxis: { categories: applicationScores.map((a) => a.job) },
                                            yaxis: { min: 0, max: 100 },
                                            colors: [TEAL_HEX],
                                            dataLabels: { enabled: false },
                                        }}
                                    />
                                ) : (
                                    <EmptyState icon={HiOutlineStar} title="No scores yet" text="Scores show up after your assessments are graded." />
                                )}
                            </Panel>
                        </div>

                        <Panel icon={HiOutlineArrowTrendingUp} title="Assessment trend" helper="Your results over time" index={4}>
                            {hasData(assessmentTrend, 'percentage') ? (
                                <ApexChart
                                    type="line"
                                    height={240}
                                    series={trendSeries}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        xaxis: { categories: assessmentTrend.map((a) => shortDate(a.date)) },
                                        yaxis: { min: 0, max: 100 },
                                        colors: [TEAL_HEX],
                                        stroke: { curve: 'smooth', width: 3 },
                                        markers: { size: 4 },
                                        dataLabels: { enabled: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineAcademicCap} title="No assessments yet" text="Complete an assessment to start tracking your trend." />
                            )}
                        </Panel>
                    </div>

                    {/* Side column */}
                    <div className="min-w-0 space-y-6 xl:col-span-4">
                        <Panel
                            icon={HiOutlineVideoCamera}
                            title="Upcoming interviews"
                            helper={`${upcomingInterviews.length} scheduled`}
                            index={1}
                        >
                            {upcomingInterviews.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {upcomingInterviews.map((iv, i) => (
                                        <li key={iv.room_id || i} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                                            <span className={`${iconTile} h-10 w-10 ${TEAL}`}>
                                                <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">{iv.title}</p>
                                                <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                                                    <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{iv.job}</span>
                                                </p>
                                                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                    <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {iv.time}
                                                </p>
                                            </div>
                                            {/* Link straight into the room when the dashboard sends the join token; otherwise fall back to the interviews list. */}
                                            <Link
                                                href={iv.access_token ? `/interview/join/${iv.access_token}` : '/candidate/interview'}
                                                className={`${iv.access_token ? primaryButton : secondaryButton} shrink-0 px-3`}
                                            >
                                                <HiOutlineVideoCamera className="h-4 w-4" aria-hidden="true" /> {iv.access_token ? 'Join' : 'Open interviews'}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState icon={HiOutlineVideoCamera} title="No upcoming interviews" text="Scheduled interviews will show up here." action={exploreAction()} />
                            )}
                        </Panel>

                        <Panel icon={HiOutlineRocketLaunch} title="Next steps" helper="Recommended actions for you" index={2}>
                            <ul className="space-y-2">
                                {[...openItems.map((item) => ({ href: item.href, label: item.label, icon: HiOutlineSparkles, todo: true })), ...QUICK_ACTIONS].map((a) => {
                                    const ActionIcon = a.icon;
                                    return (
                                        <li key={`${a.href}-${a.label}`}>
                                            <Link
                                                href={a.href}
                                                className={`group flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${a.todo
                                                    ? 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/15'
                                                    : 'border-emerald-100 hover:bg-emerald-50 dark:border-white/10 dark:hover:bg-white/5'}`}
                                            >
                                                <ActionIcon className={`h-4 w-4 shrink-0 ${a.todo ? '' : 'text-emerald-600 dark:text-emerald-400'}`} aria-hidden="true" />
                                                <span className="min-w-0 flex-1 truncate">{a.label}</span>
                                                <HiOutlineArrowRight className="h-4 w-4 shrink-0 transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Panel>

                        <Panel icon={HiOutlineFire} title="Recent activity" helper="Everything happening with your applications" index={3}>
                            {activity.length > 0 ? (
                                <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border">
                                    {activity.slice(0, 6).map((item, i) => {
                                        const Icon = ACTIVITY_ICONS[item.type] || HiOutlineClock;
                                        return (
                                            <li key={`${item.time}-${i}`} className="relative flex min-w-0 items-start gap-3">
                                                <span className={`${iconTile} relative h-8 w-8 bg-card`}>
                                                    <span className={`${iconTile} h-8 w-8 ${ACTIVITY_COLORS[item.type] || 'bg-muted text-muted-foreground'}`}>
                                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="break-words text-sm leading-relaxed">{item.text}</p>
                                                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <HiOutlineClock className="h-3 w-3" aria-hidden="true" /> {item.time}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <EmptyState icon={HiOutlineClock} title="No activity yet" text="Start by applying to jobs." action={exploreAction()} />
                            )}
                        </Panel>
                    </div>
                </div>

                {/* AI reviews */}
                <Panel icon={HiOutlineSparkles} title="AI interview reviews" helper="Feedback from your AI interviews" index={5}>
                    {aiReviews.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {aiReviews.map((review, i) => (
                                <motion.div
                                    key={`${review.job}-${review.date}-${i}`}
                                    {...fadeUp}
                                    transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                                    className="min-w-0"
                                >
                                    <ReviewCard review={review} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={HiOutlineSparkles} title="No AI reviews yet" text="Reviews appear here once your AI interviews are evaluated." />
                    )}
                </Panel>
            </>)}
        </div>
    );
}
