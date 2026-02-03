import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import api from '@/utils/api';

export default function CandidateResults({ sessionId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api.get(`/ai-interviews/session/${sessionId}/results/`);
        setResults(data);
      } catch (err) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Results</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const passed = results.recommended_for_next_round;
  const percentage = Math.round((results.overall_score / 100) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete! 🎉</h1>
          <p className="text-gray-600">{results.interview_title}</p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`bg-white rounded-lg shadow-lg p-8 text-center ${
            passed ? 'border-4 border-green-500' : 'border-4 border-red-500'
          }`}
        >
          <div className="mb-6">
            {passed ? (
              <HiOutlineCheckCircle className="mx-auto text-6xl text-green-500" />
            ) : (
              <HiOutlineXCircle className="mx-auto text-6xl text-red-500" />
            )}
          </div>

          <h2 className="text-5xl font-bold text-gray-900 mb-2">
            {results.overall_score.toFixed(1)}
            <span className="text-2xl text-gray-500">/100</span>
          </h2>

          <p className={`text-xl font-semibold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? '✓ You Passed!' : '✗ Not Passed'}
          </p>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-4 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
            />
          </div>

          <p className="text-gray-600">
            Passing Score Required: {results.overall_score >= 65 ? 'Achieved ✓' : 'Not Achieved ✗'}
          </p>
        </motion.div>

        {/* Criteria Breakdown */}
        {results.detailed_criteria_scores && Object.keys(results.detailed_criteria_scores).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(results.detailed_criteria_scores).map(([criterion, score]) => (
                <div key={criterion}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700 capitalize">
                      {criterion.replace(/_/g, ' ')}
                    </span>
                    <span className="text-lg font-bold text-blue-600">{score}/100</span>
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
        {results.overall_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Feedback</h3>
            <p className="text-gray-700 leading-relaxed">{results.overall_feedback}</p>
          </motion.div>
        )}

        {/* Interview Data */}
        {results.interview_data && results.interview_data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Answers</h3>
            <div className="space-y-6">
              {results.interview_data.map((item, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Question {idx + 1}: {item.question}
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {item.answer || <span className="text-gray-400">No answer provided</span>}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Duration */}
        {results.duration_taken_minutes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 rounded-lg p-4 text-center"
          >
            <p className="text-gray-600">
              Interview Duration: <span className="font-bold text-blue-600">{results.duration_taken_minutes} minutes</span>
            </p>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">What's Next?</h3>
          {passed ? (
            <p className="text-gray-700">
              Great job! Your interview has been submitted for review. The hiring team will review your responses and may
              contact you about next steps. Keep an eye on your email for updates!
            </p>
          ) : (
            <p className="text-gray-700">
              Thank you for your effort. While you didn't meet the passing score this time, don't hesitate to apply for
              other positions in the future. Best of luck!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
