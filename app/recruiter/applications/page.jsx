'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    HiOutlineBriefcase,
    HiOutlineChevronRight,
    HiOutlineUserGroup,
    HiOutlineSparkles,
    HiOutlineCalendarDays,
    HiOutlineBuildingOffice,
    HiOutlineDocumentText,
    HiOutlinePlus,
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

export default function RecruiterApplicationsPage() {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Bumping `attempt` re-runs the fetch effect, which is how Retry works.
    const [attempt, setAttempt] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const data = await api.get('/applications/my-jobs/');
                setMyJobs(data);
                setError('');
            } catch (err) {
                setError('We could not load your roles. Check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyJobs();
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const totalApplications = myJobs.reduce((sum, j) => sum + (j.total_applications || 0), 0);
    const shortlistedJobs = myJobs.filter(j => j.is_shortlisted).length;

    if (loading) return <PageSkeleton stats={3} cards={3} />;

    const nextStep = myJobs.length === 0
        ? 'Next step: post your first job to start receiving applications.'
        : shortlistedJobs < myJobs.length
            ? 'Next step: open a role and run the AI shortlist to rank its applicants.'
            : 'Next step: review the ranked candidates in each role and message the strongest ones.';

    const stats = [
        { label: 'Active Roles', value: myJobs.length, icon: HiOutlineBriefcase, tone: 'bg-blue-500/10 text-blue-500' },
        { label: 'Total Applications', value: totalApplications, icon: HiOutlineUserGroup, tone: 'bg-violet-500/10 text-violet-500' },
        { label: 'AI Analyzed', value: shortlistedJobs, icon: HiOutlineSparkles, tone: 'bg-amber-500/10 text-amber-500' },
    ];

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-20 md:px-8">
            {/* ═══ Banner ═══ */}
            <DashboardBanner
                icon={HiOutlineDocumentText}
                badge={{ label: `${myJobs.length} open ${myJobs.length === 1 ? 'role' : 'roles'}`, icon: HiOutlineBriefcase }}
                title="My Open Roles"
                subtitle={myJobs.length === 0
                    ? 'Post a job to start receiving applications'
                    : `${totalApplications.toLocaleString()} ${totalApplications === 1 ? 'applicant' : 'applicants'} across your roles`}
                footer={
                    <span className="flex items-start gap-2">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span>{nextStep}</span>
                    </span>
                }
            />

            {/* ═══ Stats ═══ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            title={stat.label}
                            className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-5 lg:p-6"
                        >
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                                <StatIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
                                <p className="truncate text-xs font-semibold text-muted-foreground">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-red-300">Something went wrong</p>
                        <p className="mt-0.5 break-words text-xs text-red-300/70">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={retry}
                        title="Try loading your roles again"
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
                    >
                        <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
                    </button>
                </div>
            )}

            {/* ═══ Roles ═══ */}
            <section className="space-y-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold tracking-tight">Roles</h2>
                        <p className="text-xs text-muted-foreground/60">Open a role to see its applicants and pipeline</p>
                    </div>
                </div>

                {myJobs.length === 0 ? (
                    !error && (
                        <EmptyState
                            icon={HiOutlineDocumentText}
                            title="No jobs posted yet"
                            text="Post a job first to start receiving applications."
                            action={
                                <button
                                    type="button"
                                    onClick={() => router.push('/recruiter/jobs/create')}
                                    title="Create your first job"
                                    className={linkButton}
                                >
                                    <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create your first job
                                </button>
                            }
                        />
                    )
                ) : (
                    <div className="grid gap-4">
                        {myJobs.map((job, i) => (
                            <motion.button
                                key={job.job_id}
                                type="button"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => router.push(`/recruiter/applications/${job.job_id}`)}
                                title="Open applicants for this role"
                                className="group flex w-full min-w-0 items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-emerald-500/30 lg:p-6"
                            >
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-105">
                                        <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-emerald-500">
                                            {job.job_title}
                                        </h3>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <HiOutlineUserGroup className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                <span className="font-semibold">{job.total_applications}</span> Applicants
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <HiOutlineBuildingOffice className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                {job.location || 'Remote'}
                                            </span>
                                            {job.posted_date && (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                    {new Date(job.posted_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            {job.is_shortlisted && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                                                    <HiOutlineSparkles className="h-3 w-3" aria-hidden="true" />
                                                    AI Analyzed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-500 sm:inline-flex capitalize">
                                        {job.status}
                                    </span>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all group-hover:bg-emerald-500 group-hover:text-white">
                                        <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
