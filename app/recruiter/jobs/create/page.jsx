'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import JobForm from '@/components/jobs/JobForm';
import { useRouter } from 'next/navigation';

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

    if (loading) return null;

    return (
        <JobForm
            organizations={organizations}
            submitLabel="Post Job"
            mode="create"
            onSubmit={async (data) => {
                await api.post('/jobs/', data);
                router.push('/recruiter/jobs');
            }}
        />
    );
}
