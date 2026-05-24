'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HiOutlineBriefcase,
    HiOutlineUserGroup,
    HiOutlineSparkles,
    HiOutlinePlus,
    HiOutlineSignal,
    HiOutlineInboxStack,
    HiOutlineLightBulb,
} from 'react-icons/hi2';
import { api } from '@/utils/api';
import PageHeader from '@/components/ui/PageHeader';
import { iconTile } from '@/components/ui/styles';
import ApplicationsListSkeleton from '@/components/skeletons/recruiter/ApplicationsListSkeleton';
import { EmptyState, ErrorAlert, primaryButton } from '@/components/applications/ui';
import RoleStats from '@/components/applications/RoleStats';
import RoleRow from '@/components/applications/RoleRow';

const LOAD_ERROR = 'We could not load your roles. Check your connection and try again.';

export default function RecruiterApplicationsPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Bumping `attempt` re-runs the fetch effect, which is how Retry works.
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        api.get('/applications/my-jobs/')
            .then((data) => {
                if (!active) return;
                setRoles(Array.isArray(data) ? data : []);
                setError('');
            })
            .catch(() => {
                if (active) setError(LOAD_ERROR);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const roleCount = roles.length;
    const totalApplicants = roles.reduce((sum, job) => sum + (Number(job.total_applications) || 0), 0);
    const analyzedRoles = roles.filter((job) => job.is_shortlisted).length;

    const nextStep = roleCount === 0
        ? null
        : analyzedRoles < roleCount
            ? 'Next step: open a role and run the AI shortlist to rank its applicants.'
            : 'Next step: review the ranked candidates in each role and message the strongest ones.';

    const stats = [
        { label: 'Open roles', value: roleCount, icon: HiOutlineBriefcase, hint: 'Roles on your account' },
        { label: 'Total applicants', value: totalApplicants.toLocaleString(), icon: HiOutlineUserGroup, hint: 'Across all roles' },
        { label: 'AI-analyzed roles', value: analyzedRoles, icon: HiOutlineSparkles, hint: `${analyzedRoles} of ${roleCount} ranked` },
    ];

    if (loading) {
        return (
            <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
                <ApplicationsListSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
            <PageHeader
                icon={HiOutlineInboxStack}
                eyebrow="Recruiter"
                title="Applications"
                description={error
                    ? 'Manage your roles and applicants.'
                    : roleCount === 0
                        ? 'Post a role to start receiving applications.'
                        : `${totalApplicants.toLocaleString()} ${totalApplicants === 1 ? 'applicant' : 'applicants'} across your roles`}
                meta={!error && roleCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <HiOutlineSignal className="h-3.5 w-3.5" aria-hidden="true" />
                        {roleCount} open {roleCount === 1 ? 'role' : 'roles'}
                    </span>
                )}
                actions={!error && roleCount > 0 && (
                    <Link href="/recruiter/jobs/create" className={`${primaryButton} w-full sm:w-auto`}>
                        <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                        Post a role
                    </Link>
                )}
            />

            {error && <ErrorAlert message={error} onRetry={retry} />}

            {roleCount > 0 && (
                <>
                    <RoleStats stats={stats} />

                    {nextStep && (
                        <p className="flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            <span>{nextStep}</span>
                        </p>
                    )}

                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold">Your roles</h2>
                                <p className="text-xs text-muted-foreground">Open a role to review and rank its applicants</p>
                            </div>
                        </div>
                        <ul aria-label="Your roles" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {roles.map((job, index) => <RoleRow key={job.job_id ?? index} job={job} />)}
                        </ul>
                    </section>
                </>
            )}

            {roleCount === 0 && !error && (
                <EmptyState
                    icon={HiOutlineInboxStack}
                    title="No roles yet"
                    text="Post your first role to start receiving applications."
                    action={
                        <Link href="/recruiter/jobs/create" className={`${primaryButton} w-full sm:w-auto`}>
                            <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                            Post a role
                        </Link>
                    }
                />
            )}
        </div>
    );
}
