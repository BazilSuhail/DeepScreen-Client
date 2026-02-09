'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationCircle, HiOutlineArrowRight, HiOutlineX } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

export default function InterviewAlreadyExistsModal({ isOpen, onClose, interviewId }) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleViewInterview = () => {
        router.push(`/recruiter/ai-interview/${interviewId}/edit`);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>

                    <div className="p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-amber-50 rounded-full">
                                <HiOutlineExclamationCircle className="w-12 h-12 text-amber-500" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Interview Already Exists
                            </h3>
                            <p className="text-gray-600 mb-8">
                                An AI interview has already been created for this job. You can edit the existing interview or choose a different job.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleViewInterview}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                            >
                                View Existing Interview
                                <HiOutlineArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Pick Another Job
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
