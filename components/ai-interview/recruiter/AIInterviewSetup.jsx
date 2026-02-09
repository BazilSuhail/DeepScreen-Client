'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import InterviewAlreadyExistsModal from '../modals/InterviewAlreadyExistsModal';

export default function AIInterviewSetup({ interviewId = null, jobs = [] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [interview, setInterview] = useState({
        job: '',
        title: '',
        description: '',
        system_prompt: '',
        context_for_ai: '',
        evaluation_criteria: { technical_depth: 0.4, problem_solving: 0.3, communication: 0.3 },
        number_of_questions: 5,
        duration_minutes: 20,
        passing_score: 65,
        questions: [],
    });

    useEffect(() => {
        if (interviewId) {
            fetchInterview();
        }
    }, [interviewId]);

    const fetchInterview = async () => {
        try {
            const data = await api.get(`/ai-interviews/${interviewId}/`);
            console.log('Fetched interview data:', data);
            setInterview(data);
        } catch (error) {
            console.error('Error fetching interview:', error);
        }
    };

    const handleChange = (field, value) => {
        setInterview({
            ...interview,
            [field]: value,
        });
    };

    const handleEvaluationChange = (criteria, value) => {
        setInterview({
            ...interview,
            evaluation_criteria: {
                ...interview.evaluation_criteria,
                [criteria]: parseFloat(value),
            },
        });
    };

    const handleAddQuestion = () => {
        setInterview({
            ...interview,
            questions: [...interview.questions, ''],
        });
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...interview.questions];
        newQuestions[index] = value;
        setInterview({
            ...interview,
            questions: newQuestions,
        });
    };

    const handleRemoveQuestion = (index) => {
        setInterview({
            ...interview,
            questions: interview.questions.filter((_, i) => i !== index),
        });
    };

    const [showAlreadyExistsModal, setShowAlreadyExistsModal] = useState(false);
    const [existingInterviewId, setExistingInterviewId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (interviewId) {
                await api.put(`/ai-interviews/${interviewId}/`, interview);
            } else {
                await api.post('/ai-interviews/', interview);
            }

            router.push('/recruiter/ai-interview');
            router.refresh();
        } catch (error) {
            if (error.status === 409 || (error.errors && error.errors.error === 'An AI interview already exists for this job')) {
                setExistingInterviewId(error.errors?.interview_id);
                setShowAlreadyExistsModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-lg"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {interviewId ? 'Edit Interview' : 'Create New Interview'}
            </h2>

            {/* Job Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job <span className="text-red-600">*</span>
                </label>
                <select
                    required
                    value={interview.job}
                    onChange={(e) => handleChange('job', e.target.value)}
                    disabled={!!interviewId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                    <option value="">Select a job</option>
                    {jobs.map((job) => (
                        <option key={job.job_id} value={job.job_id}>
                            {job.job_title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title <span className="text-red-600">*</span>
                    </label>
                    <input
                        required
                        type="text"
                        value={interview.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Senior Backend Engineer Interview"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Passing Score <span className="text-red-600">*</span>
                    </label>
                    <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={interview.passing_score}
                        onChange={(e) => handleChange('passing_score', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={interview.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="What is this interview about?"
                />
            </div>

            {/* System Prompt */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    System Prompt <span className="text-red-600">*</span>
                </label>
                <textarea
                    required
                    value={interview.system_prompt}
                    onChange={(e) => handleChange('system_prompt', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                    rows="4"
                    placeholder="You are evaluating a candidate for..."
                />
            </div>

            {/* Context */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AI Context
                </label>
                <textarea
                    value={interview.context_for_ai}
                    onChange={(e) => handleChange('context_for_ai', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Focus on system design, scalability, LLM knowledge..."
                />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Questions
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={interview.number_of_questions}
                        onChange={(e) => handleChange('number_of_questions', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (minutes)
                    </label>
                    <input
                        type="number"
                        min="5"
                        value={interview.duration_minutes}
                        onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Questions Pool */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                        Question Pool
                    </label>
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                        Add Question
                    </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {interview.questions.map((question, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => handleQuestionChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder={`Question ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(index)}
                                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Evaluation Criteria */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Evaluation Criteria Weights
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(interview.evaluation_criteria).map(([criteria, weight]) => (
                        <div key={criteria}>
                            <label className="block text-xs text-gray-600 mb-2 capitalize">
                                {criteria.replace('_', ' ')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={weight}
                                onChange={(e) => handleEvaluationChange(criteria, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg disabled:bg-gray-400"
            >
                {loading ? 'Saving...' : interviewId ? 'Update Interview' : 'Create Interview'}
            </motion.button>

            <InterviewAlreadyExistsModal
                isOpen={showAlreadyExistsModal}
                onClose={() => setShowAlreadyExistsModal(false)}
                interviewId={existingInterviewId}
            />
        </motion.form>
    );
}
