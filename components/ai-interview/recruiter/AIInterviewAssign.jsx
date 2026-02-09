'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';

export default function AIInterviewAssign({ interviewId, jobId }) {
    const [assignmentMethod, setAssignmentMethod] = useState('stage');
    const [fromStage, setFromStage] = useState('coding_passed');
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const stages = [
        { value: 'shortlisted', label: 'Shortlisted Candidates' },
        { value: 'coding_passed', label: 'Assessment Passed' },
        { value: 'applied', label: 'All Applied' },
    ];

    const handleAssign = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            const payload = assignmentMethod === 'stage'
                ? { from_stage: fromStage }
                : { candidate_ids: selectedCandidates };

            const response = await api.post(`/ai-interviews/${interviewId}/assign/`, payload);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setSelectedCandidates([]);
        } catch (err) {
            setError(err.message || 'Failed to assign interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg"
        >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Interview to Candidates</h3>

            {/* Alert Messages */}
            {success && (
                <div className="p-4 mb-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
                    Interview assigned successfully!
                </div>
            )}

            {error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                    {error}
                </div>
            )}

            {/* Assignment Method Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => {
                        setAssignmentMethod('stage');
                        setSelectedCandidates([]);
                    }}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        assignmentMethod === 'stage'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                >
                    By Stage
                </button>
                <button
                    onClick={() => {
                        setAssignmentMethod('candidates');
                        setFromStage('');
                    }}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        assignmentMethod === 'candidates'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Select Candidates
                </button>
            </div>

            {/* Stage Selection */}
            {assignmentMethod === 'stage' && (
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Candidate Stage
                    </label>
                    <div className="space-y-2">
                        {stages.map((stage) => (
                            <motion.label
                                key={stage.value}
                                className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                                whileHover={{ x: 4 }}
                            >
                                <input
                                    type="radio"
                                    name="stage"
                                    value={stage.value}
                                    checked={fromStage === stage.value}
                                    onChange={(e) => setFromStage(e.target.value)}
                                    className="w-5 h-5 text-blue-600"
                                />
                                <span className="ml-3 text-gray-800 font-medium">{stage.label}</span>
                                <span className="ml-auto text-sm text-gray-500">
                                    All candidates at this stage will be assigned
                                </span>
                            </motion.label>
                        ))}
                    </div>
                </div>
            )}

            {/* Candidate Selection */}
            {assignmentMethod === 'candidates' && (
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                        Note: Individual candidate selection coming soon. For now, use stage-based assignment.
                    </p>
                </div>
            )}

            {/* Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAssign}
                disabled={loading || (!fromStage && !selectedCandidates.length)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? 'Assigning...' : 'Assign Interview'}
            </motion.button>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> You can assign the same interview to multiple candidate stages.
                    Each assignment creates new pending interview sessions.
                </p>
            </div>
        </motion.div>
    );
}
