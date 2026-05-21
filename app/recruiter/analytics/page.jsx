'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import {
    HiOutlineChartBar,
    HiOutlineUsers,
    HiOutlineLightBulb,
    HiOutlineArrowPath,
    HiOutlineBriefcase,
    HiOutlineTrophy,
    HiOutlineStar,
    HiOutlineCalendarDays,
    HiOutlineFunnel,
    HiOutlineChartPie,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import ChartCard from '@/components/dashboard/ChartCard';
import ApexChart, { CHART_COLORS } from '@/components/dashboard/ApexChart';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const EMERALD = CHART_COLORS[0];

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

const jobMetrics = [
    { key: 'apps', label: 'Applications', icon: HiOutlineUsers },
    { key: 'assessments', label: 'Assessments', icon: HiOutlineFunnel },
    { key: 'interviews', label: 'Interviews', icon: HiOutlineCalendarDays },
    { key: 'hires', label: 'Hires', icon: HiOutlineTrophy },
    { key: 'score', label: 'Avg score', icon: HiOutlineStar },
];

export default function RecruiterAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Bumping `attempt` re-runs the fetch effect, which is how Retry works.
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/accounts/recruiter/dashboard/');
                setData(res);
                setError('');
            } catch (err) {
                console.error(err);
                setError('We could not load your analytics. Check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    if (loading) return <PageSkeleton stats={0} cards={3} />;

    if (!data) {
        return (
            <div className="mx-auto w-full min-w-0 space-y-6 px-4 pb-20 md:px-8">
                <div className="flex flex-col items-start gap-2">
                    <FormError title="Something went wrong" message={error} />
                    <button type="button" onClick={retry} title="Try loading analytics again" className={linkButton}>
                        <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const funnel = data.funnel || {};
    const summary = data.summary || {};
    const weekly = data.weeklyActivity || [];
    const statusBreakdown = data.statusBreakdown || [];
    const scoreDistribution = data.scoreDistribution || [];
    const jobs = data.jobPerformance || [];

    const funnelStages = [
        { label: 'Applications', value: funnel.applications || 0 },
        { label: 'Assessments', value: funnel.assessments || 0 },
        { label: 'AI interviews', value: funnel.ai_interviews || 0 },
        { label: 'Real interviews', value: funnel.real_interviews || 0 },
        { label: 'Offers', value: funnel.offers || 0 },
    ];
    const funnelHasData = funnelStages.some((s) => s.value > 0);
    const funnelMax = Math.max(funnel.max || 0, ...funnelStages.map((s) => s.value), 1);

    const weeklyHasData = weekly.some((d) => d.applicants || d.assessments || d.interviews);
    const statusHasData = statusBreakdown.some((s) => s.value > 0);
    const scoreHasData = scoreDistribution.some((s) => s.value > 0);
    const jobsHasData = jobs.some((j) => j.apps > 0 || j.hires > 0);

    const nextStep = !funnel.applications
        ? 'Next step: publish a job to start collecting applications.'
        : summary.inAssessment > 0
            ? `Next step: review the ${summary.inAssessment} candidates currently in assessment.`
            : 'Next step: move shortlisted candidates into interviews.';

    const candidateCount = summary.totalCandidates || 0;

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-20 md:px-8">
            {/* ═══ Banner ═══ */}
            <DashboardBanner
                icon={HiOutlineChartBar}
                badge={{ label: `${candidateCount} ${candidateCount === 1 ? 'candidate' : 'candidates'}`, icon: HiOutlineUsers }}
                title="Analytics"
                subtitle={`${funnel.applications || 0} applications · ${funnel.offers || 0} offers · ${funnel.conversion || 0}% conversion`}
                footer={
                    <span className="flex items-start gap-2">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span>{nextStep}</span>
                    </span>
                }
            />

            {/* ═══ Charts ═══ */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Hiring funnel" subtitle="How many candidates reach each stage" icon={HiOutlineFunnel} delay={0}>
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
                </ChartCard>

                <ChartCard title="Weekly activity" subtitle="Last 7 days, by type" icon={HiOutlineCalendarDays} delay={0.05} className="lg:col-span-2">
                    {weeklyHasData ? (
                        <ApexChart
                            type="area"
                            height={260}
                            series={[
                                { name: 'Applicants', data: weekly.map((d) => d.applicants) },
                                { name: 'Assessments', data: weekly.map((d) => d.assessments) },
                                { name: 'Interviews', data: weekly.map((d) => d.interviews) },
                            ]}
                            options={{
                                chart: { toolbar: { show: false } },
                                xaxis: { categories: weekly.map((d) => d.label) },
                                yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                colors: [CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[4]],
                                stroke: { curve: 'smooth', width: 2 },
                                fill: { type: 'solid', opacity: 0.2 },
                                legend: { position: 'top', horizontalAlign: 'left' },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineCalendarDays} title="No activity this week" text="Applications, assessments and interviews from the last 7 days will show up here." />
                    )}
                </ChartCard>

                <ChartCard title="Application status" subtitle="Breakdown by outcome" icon={HiOutlineChartPie} delay={0.1}>
                    {statusHasData ? (
                        <ApexChart
                            type="donut"
                            height={260}
                            series={statusBreakdown.map((s) => s.value)}
                            options={{
                                labels: statusBreakdown.map((s) => s.label),
                                colors: CHART_COLORS,
                                legend: { position: 'bottom' },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineChartPie} title="No applications yet" text="Status shares appear once candidates apply to your jobs." />
                    )}
                </ChartCard>

                <ChartCard title="Score distribution" subtitle="Evaluated assessment scores (%)" icon={HiOutlineStar} delay={0.15}>
                    {scoreHasData ? (
                        <ApexChart
                            type="bar"
                            height={260}
                            series={[{ name: 'Submissions', data: scoreDistribution.map((s) => s.value) }]}
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
                </ChartCard>

                <ChartCard title="Job performance" subtitle="Applications and hires per job" icon={HiOutlineBriefcase} delay={0.2} className="lg:col-span-2">
                    {jobsHasData ? (
                        <ApexChart
                            type="bar"
                            height={280}
                            series={[
                                { name: 'Applications', data: jobs.map((j) => j.apps) },
                                { name: 'Hires', data: jobs.map((j) => j.hires) },
                            ]}
                            options={{
                                plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
                                xaxis: { categories: jobs.map((j) => j.title), labels: { trim: true, maxHeight: 90 } },
                                yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => Math.round(v) } },
                                colors: [CHART_COLORS[0], CHART_COLORS[2]],
                                legend: { position: 'top', horizontalAlign: 'left' },
                            }}
                        />
                    ) : (
                        <EmptyState icon={HiOutlineBriefcase} title="No job activity yet" text="Once candidates apply to a job, its applications and hires will be compared here." />
                    )}
                </ChartCard>
            </div>

            {/* ═══ Job performance table ═══ */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Job breakdown</h2>
                    <p className="text-xs text-muted-foreground/60">Pipeline numbers for your five most recent jobs</p>
                </div>

                {jobs.length === 0 ? (
                    <EmptyState icon={HiOutlineBriefcase} title="No jobs yet" text="Post a job to see its pipeline numbers here." />
                ) : (
                    <div className="space-y-3">
                        <div className="hidden grid-cols-[2fr_repeat(5,1fr)] gap-4 px-5 sm:grid">
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> Job
                            </span>
                            {jobMetrics.map((m) => (
                                <span key={m.key} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    <m.icon className="h-3.5 w-3.5" aria-hidden="true" /> {m.label}
                                </span>
                            ))}
                        </div>

                        {jobs.map((job) => (
                            <div
                                key={job.title + job.apps}
                                className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[2fr_repeat(5,1fr)] sm:items-center sm:gap-4 sm:px-5"
                            >
                                <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <p className="min-w-0 truncate text-sm font-semibold">{job.title}</p>
                                </div>
                                {jobMetrics.map((m) => {
                                    const raw = job[m.key] || 0;
                                    const value = m.key === 'score' ? (raw > 0 ? `${raw}%` : '—') : raw;
                                    return (
                                        <div key={m.key} className="min-w-0">
                                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:hidden">
                                                <m.icon className="h-3.5 w-3.5" aria-hidden="true" /> {m.label}
                                            </p>
                                            <p className="text-sm font-semibold">{value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
