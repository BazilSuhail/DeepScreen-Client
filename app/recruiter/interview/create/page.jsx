'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import ScheduleInterview from '@/components/interview/ScheduleInterview';
import Link from 'next/link';
import { HiOutlineChevronLeft } from 'react-icons/hi';

export default function CreateInterviewPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            // Fetching applications to choose from
            const data = await api.get('/applications/');
            // Transform data if needed (assuming recruiter gets all apps for their jobs)
            const formatted = data.map(app => ({
                application_id: app.application_id,
                user: app.user,
                user_email: app.user_email || 'Candidate',
                job_title: app.job_title || 'Job'
            }));
            setApplications(formatted);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh p-6">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/recruiter/interview"
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-8 transition-all"
                >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                    Back to Interviews
                </Link>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <ScheduleInterview applications={applications} />
                )}
            </div>
        </div>
    );
}
