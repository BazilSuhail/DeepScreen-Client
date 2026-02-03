'use client';

import { useEffect, useState } from 'react';
import CandidateInterviewList from '@/components/ai-interview/CandidateInterviewList';
import { api } from '@/utils/api';

export default function CandidateAIInterviewPage() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const data = await api.get('/ai-interviews/my/');
            setInterviews(data);
        } catch (err) {
            setError(err.message || 'Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Interviews</h1>
                    <p className="text-gray-600 mt-2">Take your AI interviews to progress in the hiring process</p>
                </div>

                <CandidateInterviewList
                    interviews={interviews}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
}
