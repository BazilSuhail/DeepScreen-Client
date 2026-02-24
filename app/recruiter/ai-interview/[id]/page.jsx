'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/utils/api';
import Link from 'next/link';
import AIInterviewAssign from '@/components/ai-interview/recruiter/AIInterviewAssign';
import RecruiterStats from '@/components/ai-interview/recruiter/RecruiterStats';
import { motion } from 'framer-motion';
import { BsChevronCompactRight } from 'react-icons/bs';
import { BiChevronRight } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';

export default function AIInterviewDetailPage() {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const interviewData = await api.get(`/ai-interviews/${id}/`);
            setInterview(interviewData);
        } catch (err) {
            setError(err.message || 'Failed to load interview');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !interview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/recruiter/ai-interview"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
                    >
                        <BsChevronCompactRight className="w-5 h-5" />
                        Back to Interviews
                    </Link>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error || 'Interview not found'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Button */}
                <Link
                    href="/recruiter/ai-interview"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                    <BiChevronRight className="w-5 h-5" />
                    Back to Interviews
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-lg"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{interview.title}</h1>
                        <p className="text-gray-600 mt-1">Job: {interview.job_title}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/recruiter/ai-interview/${id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            <AiOutlineEdit className="w-5 h-5" />
                            Edit
                        </Link>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    {['details', 'assign', 'results'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-semibold border-b-2 transition-colors capitalize ${activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Overview */}
                        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Overview</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Questions</p>
                                    <p className="font-semibold text-gray-800">{interview.number_of_questions}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Duration</p>
                                    <p className="font-semibold text-gray-800">{interview.duration_minutes} minutes</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Passing Score</p>
                                    <p className="font-semibold text-gray-800">{interview.passing_score}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${interview.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {interview.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Evaluation Criteria */}
                        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Evaluation Criteria</h3>
                            <div className="space-y-3">
                                {Object.entries(interview.evaluation_criteria || {}).map(([criteria, weight]) => (
                                    <div key={criteria}>
                                        <p className="text-sm text-gray-600 capitalize mb-1">
                                            {criteria.replace('_', ' ')}
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${weight * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{(weight * 100).toFixed(0)}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {interview.description && (
                            <div className="md:col-span-2 p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
                                <h3 className="font-bold text-lg text-gray-800 mb-3">Description</h3>
                                <p className="text-gray-700">{interview.description}</p>
                            </div>
                        )}

                        {/* System Prompt */}
                        <div className="md:col-span-2 p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
                            <h3 className="font-bold text-lg text-gray-800 mb-3">System Prompt</h3>
                            <p className="text-gray-700 font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                {interview.system_prompt}
                            </p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'assign' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AIInterviewAssign
                            interviewId={interview.interview_id}
                            jobId={interview.job}
                        />
                    </motion.div>
                )}

                {activeTab === 'results' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <RecruiterStats interviewId={interview.interview_id} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
