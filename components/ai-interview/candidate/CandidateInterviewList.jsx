'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiDocumentCheck } from 'react-icons/hi2';
import { CgChevronDoubleRightO } from 'react-icons/cg';

export default function CandidateInterviewList({ interviews, loading, error }) {
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

    if (interviews.length === 0) {
        return (
            <div className="text-center py-12">
                <HiDocumentCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending interviews</p>
            </div>
        );
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        evaluated: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((interview, index) => (
                <motion.div
                    key={interview.session_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{interview.interview_title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[interview.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {interview.status.replace('_', ' ')}
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                        Duration: ~20 minutes
                    </p>

                    <Link
                        href={`/candidate/ai-interview/${interview.session_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                        {interview.status === 'pending' ? 'Start Interview' : 'View Results'}
                        <CgChevronDoubleRightO />
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
