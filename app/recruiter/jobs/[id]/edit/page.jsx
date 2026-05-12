'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import JobForm from '@/components/jobs/JobForm';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineChevronRight } from 'react-icons/hi2';

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id;

    const [organizations, setOrganizations] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            .catch(() => setError('Failed to load job details'))
            .finally(() => setLoading(false));
    }, [jobId]);

    if (loading) return (
        <div className="space-y-6 px-12 py-8">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="h-[600px] bg-muted rounded-[2rem] animate-pulse" />
        </div>
    );

    if (error) return (
        <div className="px-12 py-8">
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold">{error}</div>
        </div>
    );

    if (!job) return null;

    const initialData = {
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

    return (
        <div className="space-y-6 px-12 py-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/recruiter/jobs" className="hover:text-emerald-500 transition-colors">My Jobs</Link>
                <HiOutlineChevronRight className="w-3 h-3" />
                <span className="text-foreground font-semibold">Edit Job</span>
            </div>

            <JobForm
                initialData={initialData}
                organizations={organizations}
                submitLabel="Save Changes"
                mode="edit"
                onSubmit={async (data) => {
                    await api.put(`/jobs/${jobId}/`, data);
                    router.push('/recruiter/jobs');
                }}
            />
        </div>
    );
}
