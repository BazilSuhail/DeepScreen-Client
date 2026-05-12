'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import JobForm from '@/components/jobs/JobForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineBriefcase, HiOutlineChevronRight } from 'react-icons/hi2';

export default function CreateJobPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/organizations/')
            .then(data => setOrganizations(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="space-y-6 px-12 py-8">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="h-[600px] bg-muted rounded-[2rem] animate-pulse" />
        </div>
    );

    return (
        <div className="space-y-6 px-12 py-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/recruiter/jobs" className="hover:text-emerald-500 transition-colors">My Jobs</Link>
                <HiOutlineChevronRight className="w-3 h-3" />
                <span className="text-foreground font-semibold">Create Job</span>
            </div>

            <JobForm
                organizations={organizations}
                submitLabel="Post Job"
                mode="create"
                onSubmit={async (data) => {
                    await api.post('/jobs/', data);
                    router.push('/recruiter/jobs');
                }}
            />
        </div>
    );
}
