'use client';

import { useEffect, useState } from 'react';
import AIInterviewList from '@/components/ai-interview/recruiter/AIInterviewList';
import { api } from '@/utils/api';

export default function RecruiterAIInterviewPage() {
    const [interviews, setInterviews] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interviewsData, jobsData] = await Promise.all([
                api.get('/ai-interviews/'),
                api.get('/jobs/'),
            ]);
            setInterviews(interviewsData);
            setJobs(jobsData);
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <AIInterviewList
                    interviews={interviews}
                    jobs={jobs}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
}
