'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import {
    HiOutlineChartBar,
    HiOutlineUsers,
    HiOutlineLightBulb,
    HiOutlineArrowTrendingUp,
    HiOutlinePaperAirplane,
    HiOutlineBriefcase,
    HiOutlineTrophy,
    HiOutlineStar,
    HiOutlineCalendarDays,
    HiOutlineFunnel,
    HiOutlineChartPie,
    HiOutlinePlus,
    HiOutlineDocumentText,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import AnalyticsSkeleton from '@/components/skeletons/recruiter/AnalyticsSkeleton';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import { base, fadeUp, stagger } from '@/constants/motion';
import { card, iconTile } from '@/components/ui/styles';

const EMERALD = '#10b981';
const TEAL = '#14b8a6';
const AMBER = '#f59e0b';

const jobMetrics = [
    { key: 'apps', label: 'Applications', icon: HiOutlineUsers },
    { key: 'assessments', label: 'Assessments', icon: HiOutlineFunnel },
    { key: 'interviews', label: 'Interviews', icon: HiOutlineCalendarDays },
    { key: 'hires', label: 'Hires', icon: HiOutlineTrophy },
    { key: 'score', label: 'Avg score', icon: HiOutlineStar },
];

const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Card shell used by every chart panel on this page.
function Panel({ title, subtitle, icon: Icon, delay = 0, className = '', children }) {
    return (
        <motion.section
            {...fadeUp}
            transition={{ ...base, delay }}
            className={`${card} min-w-0 p-5 lg:p-6 ${className}`}
        >
            <div className="mb-5 flex min-w-0 items-center gap-3">
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
            {children}
        </motion.section>
    );
}

function Kpi({ label, value, icon: Icon, index }) {
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
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        </motion.div>
    );
}

export default function RecruiterAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Bumping `attempt` re-runs the fetch effect, which is how Retry works.
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                const res = await api.get('/accounts/recruiter/dashboard/');
                if (!cancelled) {
                    setData(res);
                    setError('');
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setError('We could not load your analytics. Check your connection and try again.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => {
            cancelled = true;
        };
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const funnel = data?.funnel || {};
    const summary = data?.summary || {};
    const weekly = arr(data?.weeklyActivity);
    const statusBreakdown = arr(data?.statusBreakdown);
    const scoreDistribution = arr(data?.scoreDistribution);
    const jobs = arr(data?.jobPerformance);

    const funnelStages = [
        { label: 'Applications', value: num(funnel.applications) },
        { label: 'Assessments', value: num(funnel.assessments) },
        { label: 'AI interviews', value: num(funnel.ai_interviews) },
        { label: 'Real interviews', value: num(funnel.real_interviews) },
        { label: 'Offers', value: num(funnel.offers) },
    ];
    const funnelHasData = funnelStages.some((s) => s.value > 0);
    const funnelMax = Math.max(num(funnel.max), ...funnelStages.map((s) => s.value), 1);

    const weeklyHasData = weekly.some((d) => d.applicants || d.assessments || d.interviews);
    const statusHasData = statusBreakdown.some((s) => s.value > 0);
    const scoreHasData = scoreDistribution.some((s) => s.value > 0);
    const jobsHasData = jobs.some((j) => j.apps > 0 || j.hires > 0);

    const nextStep = !funnel.applications
        ? 'Next step: publish a job to start collecting applications.'
        : summary.inAssessment > 0
            ? `Next step: review the ${summary.inAssessment} candidates currently in assessment.`
            : 'Next step: move shortlisted candidates into interviews.';

    const candidateCount = num(summary.totalCandidates);
    const loaded = !loading && !!data;

    if (loading) {
        return (
            <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
                <AnalyticsSkeleton />
            </div>
        );
    }

    const kpis = [
        { label: 'Candidates', value: candidateCount.toLocaleString(), icon: HiOutlineUsers },
        { label: 'Applications', value: num(funnel.applications).toLocaleString(), icon: HiOutlineDocumentText },
        { label: 'Offers', value: num(funnel.offers).toLocaleString(), icon: HiOutlinePaperAirplane },
        { label: 'Conversion', value: `${num(funnel.conversion)}%`, icon: HiOutlineArrowTrendingUp },
    ];

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 2xl:px-10">
            <DashboardBanner
                compact
                icon={HiOutlineChartBar}
                badge={loaded ? { label: `${candidateCount.toLocaleString()} ${candidateCount === 1 ? 'candidate' : 'candidates'}`, icon: HiOutlineUsers } : null}
                title="Analytics"
                subtitle="How candidates move through your hiring pipeline."
                actions={[
                    { label: 'Post job', href: '/recruiter/jobs/create', icon: HiOutlinePlus },
                    { label: 'Applications', href: '/recruiter/applications', icon: HiOutlineDocumentText },
                ]}
            />

            {!data && <ErrorState title="Something went wrong" message={error} onRetry={retry} />}

            {loaded && (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {kpis.map((k, i) => (
                            <Kpi key={k.label} {...k} index={i} />
                        ))}
                    </div>

                    <p className="flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <span>{nextStep}</span>
                    </p>
                    {/* ═══ Charts ═══ */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-6">
                        <Panel title="Hiring funnel" subtitle="How many candidates reach each stage" icon={HiOutlineFunnel} delay={0.05} className="xl:col-span-2">
                            {funnelHasData ? (
                                <ApexChart
                                    type="bar"
                                    height={260}
                                    series={[{ name: 'Candidates', data: funnelStages.map((s) => s.value) }]}
                                    options={{
                                        plotOptions: { bar: { horizontal: true, borderRadius: 6, distributed: true, barHeight: '60%' } },
                                        xaxis: { categories: funnelStages.map((s) => s.label), min: 0, max: funnelMax, forceNiceScale: true },
                                        colors: CHART_COLORS,
                                        legend: { show: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineFunnel} title="No candidates in the funnel" text="Stage counts appear here once candidates apply to a job." />
                            )}
                        </Panel>

                        <Panel title="Weekly activity" subtitle="Last 7 days, by type" icon={HiOutlineCalendarDays} delay={0} className="order-first lg:col-span-2 xl:col-span-4">
                            {weeklyHasData ? (
                                <ApexChart
                                    type="area"
                                    height={260}
                                    series={[
                                        { name: 'Applicants', data: weekly.map((d) => num(d.applicants)) },
                                        { name: 'Assessments', data: weekly.map((d) => num(d.assessments)) },
                                        { name: 'Interviews', data: weekly.map((d) => num(d.interviews)) },
                                    ]}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        xaxis: { categories: weekly.map((d) => d.label) },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [EMERALD, TEAL, AMBER],
                                        stroke: { curve: 'smooth', width: 2 },
                                        fill: { type: 'solid', opacity: 0.2 },
                                        legend: { position: 'top', horizontalAlign: 'left' },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineCalendarDays} title="No activity this week" text="Applications, assessments and interviews from the last 7 days will show up here." />
                            )}
                        </Panel>

                        <Panel title="Application status" subtitle="Breakdown by outcome" icon={HiOutlineChartPie} delay={0.1} className="xl:col-span-2">
                            {statusHasData ? (
                                <ApexChart
                                    type="donut"
                                    height={260}
                                    series={statusBreakdown.map((s) => num(s.value))}
                                    options={{
                                        labels: statusBreakdown.map((s) => s.label),
                                        colors: CHART_COLORS,
                                        legend: { position: 'bottom' },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineChartPie} title="No applications yet" text="Status shares appear once candidates apply to your jobs." />
                            )}
                        </Panel>

                        <Panel title="Score distribution" subtitle="Evaluated assessment scores (%)" icon={HiOutlineStar} delay={0.15} className="xl:col-span-2">
                            {scoreHasData ? (
                                <ApexChart
                                    type="bar"
                                    height={260}
                                    series={[{ name: 'Submissions', data: scoreDistribution.map((s) => num(s.value)) }]}
                                    options={{
                                        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
                                        xaxis: { categories: scoreDistribution.map((s) => s.label) },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [EMERALD],
                                        legend: { show: false },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineStar} title="No scores yet" text="Scores appear once coding assessments are evaluated." />
                            )}
                        </Panel>

                        <Panel title="Job performance" subtitle="Applications and hires per job" icon={HiOutlineBriefcase} delay={0.2} className="lg:col-span-2 xl:col-span-2">
                            {jobsHasData ? (
                                <ApexChart
                                    type="bar"
                                    height={280}
                                    series={[
                                        { name: 'Applications', data: jobs.map((j) => num(j.apps)) },
                                        { name: 'Hires', data: jobs.map((j) => num(j.hires)) },
                                    ]}
                                    options={{
                                        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
                                        xaxis: { categories: jobs.map((j) => j.title), labels: { trim: true, maxHeight: 90 } },
                                        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                        colors: [EMERALD, TEAL],
                                        legend: { position: 'top', horizontalAlign: 'left' },
                                    }}
                                />
                            ) : (
                                <EmptyState icon={HiOutlineBriefcase} title="No job activity yet" text="Once candidates apply to a job, its applications and hires will be compared here." />
                            )}
                        </Panel>
                    </div>

                    {/* ═══ Job performance table ═══ */}
                    <section className="space-y-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold">Job breakdown</h2>
                                <p className="text-xs text-muted-foreground">Pipeline numbers for your five most recent jobs</p>
                            </div>
                        </div>

                        {jobs.length === 0 ? (
                            <EmptyState icon={HiOutlineBriefcase} title="No jobs yet" text="Post a job to see its pipeline numbers here." />
                        ) : (
                            <div className={`${card} divide-y divide-emerald-100 overflow-hidden dark:divide-white/10`}>
                                <div className="hidden grid-cols-[2fr_repeat(5,1fr)] gap-4 bg-muted/50 px-5 py-3 sm:grid">
                                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                        <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> Job
                                    </span>
                                    {jobMetrics.map((m) => (
                                        <span key={m.key} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                            <m.icon className="h-3.5 w-3.5" aria-hidden="true" /> {m.label}
                                        </span>
                                    ))}
                                </div>

                                {jobs.map((job, idx) => (
                                    <div
                                        key={`${job.title}-${idx}`}
                                        className="grid grid-cols-2 gap-3 p-4 transition-colors hover:bg-emerald-50/50 sm:grid-cols-[2fr_repeat(5,1fr)] sm:items-center sm:gap-4 sm:px-5 dark:hover:bg-white/5"
                                    >
                                        <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                                            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                                <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                            <p className="min-w-0 truncate text-sm font-semibold">{job.title}</p>
                                        </div>
                                        {jobMetrics.map((m) => {
                                            const raw = num(job[m.key]);
                                            const value = m.key === 'score' ? (raw > 0 ? `${raw}%` : '—') : raw;
                                            return (
                                                <div key={m.key} className="min-w-0">
                                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:hidden">
                                                        <m.icon className="h-3.5 w-3.5" aria-hidden="true" /> {m.label}
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums">{value}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
