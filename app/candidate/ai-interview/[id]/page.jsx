'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import InterviewSession from '@/components/ai-interview/InterviewSession';
import { motion } from 'framer-motion';

export default function CandidateTakeInterviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const sessionData = await api.get(`/ai-interviews/session/${id}/`);
            setSession(sessionData);
            
            // For now, we'll construct interview object from session
            // In a real app, you'd fetch the full interview details
            const interviewData = {
                ...sessionData,
                number_of_questions: 5, // Default, should come from interview
                duration_minutes: 20,
                questions: [
                    'Tell me about your most challenging project and how you solved it',
                    'How do you approach system design problems?',
                    'Describe your experience with distributed systems',
                    'What is your approach to debugging complex issues?',
                    'How do you stay updated with new technologies?'
                ]
            };
            setInterview(interviewData);
        } catch (err) {
            setError(err.message || 'Failed to load interview');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        setCompleted(true);
        setTimeout(() => {
            router.push('/candidate/ai-interview');
            router.refresh();
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600 mb-4">{error || 'Interview not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="mb-6 text-6xl">🎉</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Interview Completed!</h2>
                    <p className="text-gray-600 mb-6">Your responses have been submitted for evaluation.</p>
                    <p className="text-sm text-gray-500">Redirecting...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                <InterviewSession
                    sessionId={id}
                    interview={interview}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
