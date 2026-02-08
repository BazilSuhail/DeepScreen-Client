'use client';

import { useEffect, useState } from 'react';
import AIInterviewSetup from '@/components/ai-interview/AIInterviewSetup';
import { api } from '@/utils/api';
import Link from 'next/link';
import { HiOutlineChevronLeft } from 'react-icons/hi';

export default function CreateAIInterviewPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await api.get('/jobs/'); 
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/recruiter/ai-interview"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
                >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                    Back to Interviews
                </Link>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <AIInterviewSetup jobs={jobs} />
                )}
            </div>
        </div>
    );
}
