'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function CandidateDetailsPage() {
  const { id: interviewId, sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/ai-interviews/session/${sessionId}/`);
      setSession(data);
    } catch (err) {
      setError(err.message || 'Failed to load candidate details');
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

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/recruiter/ai-interview/${interviewId}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Results
          </Link>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error || 'Candidate details not found'}
          </div>
        </div>
      </div>
    );
  }

  const passed = session.recommended_for_next_round;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href={`/recruiter/ai-interview/${interviewId}`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Results
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{session.candidate_name || 'Candidate'}</h1>
              <p className="text-gray-600 mt-1">{session.candidate_email}</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {session.overall_score ? `${session.overall_score}/100` : '--'}
              </div>
              <div className={`flex items-center gap-2 justify-end ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? (
                  <>
                    <HiOutlineCheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Passed</span>
                  </>
                ) : (
                  <>
                    <HiOutlineXCircle className="w-6 h-6" />
                    <span className="font-semibold">Not Passed</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interview Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Interview Title</p>
            <p className="font-semibold text-gray-900">{session.interview_title || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className={`font-semibold capitalize ${
              session.status === 'completed' || session.status === 'evaluated'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}>
              {session.status}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="font-semibold text-gray-900">{session.duration_taken_minutes || '--'} minutes</p>
          </div>
        </motion.div>

        {/* Timestamps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Started At</p>
            <p className="font-semibold text-gray-900">
              {session.started_at ? new Date(session.started_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Completed At</p>
            <p className="font-semibold text-gray-900">
              {session.completed_at ? new Date(session.completed_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </motion.div>

        {/* Criteria Scores */}
        {session.detailed_criteria_scores && Object.keys(session.detailed_criteria_scores).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Evaluation Criteria Scores</h2>
            <div className="space-y-5">
              {Object.entries(session.detailed_criteria_scores).map(([criterion, score]) => (
                <div key={criterion}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900 capitalize">
                      {criterion.replace(/_/g, ' ')}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 100) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        {session.overall_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback</h2>
            <p className="text-gray-700 leading-relaxed">{session.overall_feedback}</p>
          </motion.div>
        )}

        {/* Interview Transcript */}
        {session.interview_data && session.interview_data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview Transcript & Answers</h2>
            <div className="space-y-8">
              {session.interview_data.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="border-l-4 border-blue-500 pl-6 pb-6 border-b border-gray-200"
                >
                  {/* Question with Score */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        <span className="text-blue-600">Q{idx + 1}:</span> {item.question}
                      </h3>
                    </div>
                    {item.score !== undefined && (
                      <div className="ml-4 flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-blue-600">{item.score}/100</div>
                        <div className="text-xs text-gray-500 mt-1">Question Score</div>
                      </div>
                    )}
                  </div>

                  {/* Answer */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Candidate's Answer:</p>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {item.answer ? (
                          item.answer
                        ) : (
                          <span className="text-gray-400 italic">No answer provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Score Bar */}
                  {item.score !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(item.score, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-2 rounded-full ${
                            item.score >= 75 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-lg border border-blue-200 p-6"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-3">Recruiter Notes</h3>
          <textarea
            placeholder="Add notes about this candidate's interview..."
            className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Save Notes
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => {
              const data = session;
              const json = JSON.stringify(data, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${session.candidate_name}-interview.json`;
              a.click();
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            Download Interview Data
          </button>
          <Link
            href={`/recruiter/ai-interview/${interviewId}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Back to All Results
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
