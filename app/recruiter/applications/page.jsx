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
} from 'react-icons/hi2';
import { api } from '@/utils/api';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
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

    // Banner data is only shown once the roles have loaded, so the loading state never shows stale or zero counts.
    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <DashboardBanner
                loading={loading}
                icon={HiOutlineBriefcase}
                badge={loading || error ? undefined : { label: roleCount > 0 ? `${roleCount} open ${roleCount === 1 ? 'role' : 'roles'}` : 'No roles yet', icon: HiOutlineSignal }}
                title="Applications"
                subtitle={loading
                    ? 'Loading your roles...'
                    : error
                        ? 'Manage your roles and applicants.'
                        : roleCount === 0
                            ? 'Post a role to start receiving applications.'
                            : `${totalApplicants.toLocaleString()} ${totalApplicants === 1 ? 'applicant' : 'applicants'} across your roles`}
                aside={loading ? (
                    <div className="flex gap-2">
                        <BannerBlock className="h-11 w-36 rounded-xl" />
                    </div>
                ) : !error && roleCount > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Link href="/recruiter/jobs/create" className={`${primaryButton} w-full sm:w-auto`}>
                            <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                            Post a role
                        </Link>
                    </div>
                ) : null}
                footer={loading || error ? null : nextStep}
            />

            {loading && <PageSkeleton stats={3} cards={2} banner={false} />}

            {!loading && error && <ErrorAlert message={error} onRetry={retry} />}

            {!loading && roleCount > 0 && (
                <>
                    <RoleStats stats={stats} />

                    <ul aria-label="Your roles" className="flex flex-col gap-3">
                        {roles.map((job, index) => <RoleRow key={job.job_id ?? index} job={job} />)}
                    </ul>
                </>
            )}

            {!loading && roleCount === 0 && !error && (
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
