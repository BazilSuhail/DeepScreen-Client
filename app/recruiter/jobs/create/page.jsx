'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import JobCreateForm from '@/components/jobs/JobCreateForm';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiOutlineBriefcase,
  HiOutlineChevronRight,
  HiOutlineArrowPath,
  HiOutlineSparkles,
  HiOutlinePlusCircle,
  HiOutlineLightBulb,
} from 'react-icons/hi2';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const linkButton = 'inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

export default function CreateJobPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrganizations = () => api.get('/organizations/')
        .then(data => setOrganizations(data))
        .catch(() => setError('We could not load your organizations. Check your connection and try again.'))
        .finally(() => setLoading(false));

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const retry = () => {
        setLoading(true);
        setError('');
        fetchOrganizations();
    };

    if (loading) return <PageSkeleton stats={0} cards={2} />;

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/recruiter/jobs" title="Back to your job postings" className="transition-colors hover:text-emerald-500">My Jobs</Link>
                <HiOutlineChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="font-semibold text-foreground">Create Job</span>
            </nav>

            <DashboardBanner
                icon={HiOutlineBriefcase}
                badge={{ label: 'New posting', icon: HiOutlinePlusCircle }}
                title="Create a job"
                subtitle="Describe the role, its requirements and pay so the right candidates apply."
                footer={
                    <span className="flex items-start gap-2">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span>Tip: specific requirements and key skills give candidates a clearer picture of the role.</span>
                    </span>
                }
            />

            {error && (
                <div className="flex flex-col items-start gap-2">
                    <FormError title="Organizations unavailable" message={error} />
                    <button type="button" onClick={retry} title="Try loading organizations again" className={linkButton}>
                        <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                    </button>
                </div>
            )}

            <section className="flex flex-col gap-4 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-5 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6">
                <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                        <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-1">
                        <h2 className="text-base font-semibold text-foreground">Set up with AI</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Chat with an assistant and it fills in the job for you, checking required fields as you go.
                        </p>
                    </div>
                </div>
                <Link
                    href="/recruiter/jobs/create/ai"
                    title="Set up this job with the AI assistant"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                >
                    <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Start with AI
                </Link>
            </section>

            <div role="separator" className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Or fill it in yourself</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <JobCreateForm
                mode="create"
                title="Create job"
                primaryLabel="Post job"
                orgs={organizations}
                onSubmit={async (data) => {
                    await api.post('/jobs/', data);
                    router.push('/recruiter/jobs');
                }}
            />
        </div>
    );
}
