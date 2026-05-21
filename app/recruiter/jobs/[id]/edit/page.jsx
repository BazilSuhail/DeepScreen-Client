'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import JobCreateForm from '@/components/jobs/JobCreateForm';
import { SelectField } from '@/components/forms/FormFields';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    HiOutlineChevronRight,
    HiOutlineArrowPath,
    HiOutlineFlag,
} from 'react-icons/hi2';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const linkButton = 'inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

const STATUS_OPTIONS = ['open', 'draft', 'paused', 'closed', 'filled'].map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id;

    const [organizations, setOrganizations] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!jobId) return;
        Promise.all([
            api.get('/organizations/'),
            api.get(`/jobs/${jobId}/`),
        ])
            .then(([orgs, jobData]) => {
                setOrganizations(orgs);
                setJob(jobData);
            })
            .catch(() => setError('We could not load this job. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [jobId, attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    if (loading) return <PageSkeleton stats={0} cards={2} />;

    if (error && !job) return (
        <div className="mx-auto w-full min-w-0 space-y-6 px-4 pb-16 md:px-8">
            <Link href="/recruiter/jobs" title="Back to your job postings" className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-500">
                <HiOutlineChevronRight className="h-3 w-3 rotate-180" aria-hidden="true" /> My Jobs
            </Link>
            <div className="flex flex-col items-start gap-2">
                <FormError title="Job unavailable" message={error} />
                <button type="button" onClick={retry} title="Try loading this job again" className={linkButton}>
                    <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                </button>
            </div>
        </div>
    );

    if (!job) return null;

    const values = {
        job_title: job.job_title || '',
        organization: job.organization || '',
        department: job.department || '',
        location: job.location || '',
        job_type: job.job_type || 'Full-time',
        experience_level: job.experience_level || 'Mid-level',
        salary_range: job.salary_range || '',
        job_description: job.job_description || '',
        responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
        requirements: job.requirements?.length ? job.requirements : [''],
        key_skills: job.key_skills?.length ? job.key_skills : [''],
        interview_pipeline: job.interview_pipeline?.length ? job.interview_pipeline : ['shortlist'],
        status: job.status || 'open',
    };

    const currentStatus = status ?? values.status;

    const save = async (data) => {
        setSaving(true);
        try {
            await api.put(`/jobs/${jobId}/`, data);
            router.push('/recruiter/jobs');
        } finally {
            setSaving(false);
        }
    };

    const statusControl = (
        <SelectField
            id="job-status"
            label="Status"
            icon={HiOutlineFlag}
            options={STATUS_OPTIONS}
            value={currentStatus}
            onChange={e => setStatus(e.target.value)}
        />
    );

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/recruiter/jobs" title="Back to your job postings" className="transition-colors hover:text-emerald-500">My Jobs</Link>
                <HiOutlineChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="font-semibold text-foreground">Edit Job</span>
            </nav>

            <JobCreateForm
                mode="edit"
                orgs={organizations}
                initialValues={values}
                statusControl={statusControl}
                onSubmit={(data) => save({ ...data, status: currentStatus })}
                submitting={saving}
                primaryLabel="Save changes"
                title={job.job_title}
                onDiscard={() => router.back()}
            />
        </div>
    );
}
