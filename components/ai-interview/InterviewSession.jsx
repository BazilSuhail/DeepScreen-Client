'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestionCard from './QuestionCard';
import SpeechRecorder from './SpeechRecorder';
import { api } from '@/utils/api';

export default function InterviewSession({ sessionId, interview, onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await api.get(`/ai-interviews/session/${sessionId}/`);
                setSessionData(data);
                setAnswers(new Array(interview.number_of_questions).fill(''));
            } catch (error) {
                console.error('Error fetching session:', error);
            }
        };

        if (sessionId && interview) {
            fetchSession();
        }
    }, [sessionId, interview]);

    const startInterview = async () => {
        try {
            setLoading(true);
            await api.post(`/ai-interviews/session/${sessionId}/start/`, {});
            setSessionStarted(true);
        } catch (error) {
            console.error('Error starting interview:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);

        try {
            await api.post(`/ai-interviews/session/${sessionId}/answer/`, {
                question_index: currentQuestion,
                answer: answer,
            });

            if (currentQuestion < interview.number_of_questions - 1) {
                setCurrentQuestion(currentQuestion + 1);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    const completeInterview = async () => {
        try {
            setLoading(true);
            await api.post(`/ai-interviews/session/${sessionId}/complete/`, {});
            onComplete();
        } catch (error) {
            console.error('Error completing interview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!interview) {
        return <div className="text-center py-12">Loading interview...</div>;
    }

    if (!sessionStarted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-blue-300 text-center"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{interview.title}</h2>
                <p className="text-gray-600 mb-4">{interview.description}</p>
                <p className="text-lg font-semibold text-gray-700 mb-6">
                    {interview.number_of_questions} questions • ~{interview.duration_minutes} minutes
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startInterview}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg shadow-lg disabled:bg-gray-400"
                >
                    {loading ? 'Starting...' : 'Start Interview'}
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / interview.number_of_questions) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Question */}
            <QuestionCard
                question={interview.questions?.[currentQuestion] || `Question ${currentQuestion + 1}`}
                index={currentQuestion}
                totalQuestions={interview.number_of_questions}
                onSpeak={(text) => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'en-GB';
                    window.speechSynthesis.speak(utterance);
                }}
            />

            {/* Speech Recorder */}
            <SpeechRecorder
                onAnswer={handleAnswer}
                disabled={false}
            />

            {/* Navigation */}
            <div className="flex gap-4 pt-6">
                <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 font-semibold"
                >
                    Previous
                </button>

                <div className="flex-1"></div>

                {currentQuestion === interview.number_of_questions - 1 ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={completeInterview}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg disabled:bg-gray-400"
                    >
                        {loading ? 'Submitting...' : 'Complete Interview'}
                    </motion.button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        disabled={!answers[currentQuestion]}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 font-semibold"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
