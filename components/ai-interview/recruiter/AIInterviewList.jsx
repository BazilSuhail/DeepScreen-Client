'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineChevronRight } from 'react-icons/hi';
import Link from 'next/link';

export default function AIInterviewList({ interviews, loading, error, jobs }) {
    const [filter, setFilter] = useState('all');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                Error loading interviews: {error}
            </div>
        );
    }

    const filtered = filter === 'active' ? interviews.filter(i => i.is_active) : interviews;

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Interviews</h2>
                    <p className="text-gray-500">Create and manage interviews for your jobs</p>
                </div>
                <Link
                    href="/recruiter/ai-interview/create"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Create Interview
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        filter === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Active
                </button>
            </div>

            {/* Interviews Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No interviews found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((interview, index) => (
                        <motion.div
                            key={interview.interview_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-800 flex-1">{interview.title}</h3>
                                {interview.is_active ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                                Job: <span className="font-semibold">{interview.job_title}</span>
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                                <div>
                                    <p className="text-xs text-gray-500">Questions</p>
                                    <p className="font-semibold">{interview.number_of_questions}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Duration</p>
                                    <p className="font-semibold">{interview.duration_minutes}m</p>
                                </div>
                            </div>

                            <Link
                                href={`/recruiter/ai-interview/${interview.interview_id}`}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                Manage
                                <HiOutlineChevronRight />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
