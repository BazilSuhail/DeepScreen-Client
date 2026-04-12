'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import JobForm from '@/components/jobs/JobForm';
import { useRouter, useParams } from 'next/navigation';

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
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    if (error) return (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold w-full px-4 md:px-6 pt-8">{error}</div>
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
    );
}
