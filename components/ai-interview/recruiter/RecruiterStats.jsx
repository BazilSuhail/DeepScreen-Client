import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChevronDown, HiOutlineExternalLink } from 'react-icons/hi';
import { api } from '@/utils/api';
import Link from 'next/link';

export default function RecruiterStats({ interviewId }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sessionsData] = await Promise.all([
          api.get(`/ai-interviews/${interviewId}/stats/`),
          api.get(`/ai-interviews/${interviewId}/sessions/`),
        ]);
        setStats(statsData);
        setSessions(sessionsData);
      } catch (err) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) fetchData();
  }, [interviewId]);

  const toggleSessionExpand = (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error Loading Results</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <StatCard label="Total Candidates" value={stats.total_candidates} color="blue" />
        <StatCard label="Completed" value={stats.completed} color="green" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Passed" value={stats.passed_count} color="emerald" />
        <StatCard label="Not Passed" value={stats.failed_count} color="red" />
      </motion.div>

      {/* Score Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Score Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Average Score</p>
            <p className="text-3xl font-bold text-blue-600">{stats.average_score.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Highest Score</p>
            <p className="text-3xl font-bold text-green-600">{stats.highest_score}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Lowest Score</p>
            <p className="text-3xl font-bold text-red-600">{stats.lowest_score}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Passing Score</p>
            <p className="text-3xl font-bold text-purple-600">{stats.passing_score}</p>
          </div>
        </div>
      </motion.div>

      {/* Candidate Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Interview Sessions ({sessions?.total || 0})</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {sessions?.sessions && sessions.sessions.length > 0 ? (
            sessions.sessions.map((session) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition"
              >
                {/* Session Header */}
                <button
                  onClick={() => toggleSessionExpand(session.session_id)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">{session.candidate_name}</h4>
                    <p className="text-sm text-gray-500">{session.candidate_email}</p>
                  </div>

                  <div className="flex items-center gap-4 mr-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{session.score || '--'}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        session.status === 'completed' || session.status === 'evaluated'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {session.status}
                    </div>

                    <div className={`text-sm font-semibold ${session.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {session.passed ? '✓ Passed' : '✗ Failed'}
                    </div>

                    <Link
                      href={`/recruiter/ai-interview/${interviewId}/candidate/${session.session_id}`}
                      className="ml-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      title="View Full Details"
                    >
                      <HiOutlineExternalLink className="w-5 h-5" />
                    </Link>
                  </div>

                  <HiOutlineChevronDown
                    className={`text-gray-400 transition-transform ${
                      expandedSessions[session.session_id] ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedSessions[session.session_id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200 space-y-4"
                  >
                    {/* Duration */}
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{session.duration_minutes} minutes</p>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Started</p>
                        <p className="font-semibold text-gray-900">
                          {session.started_at ? new Date(session.started_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="font-semibold text-gray-900">
                          {session.completed_at ? new Date(session.completed_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Criteria Scores */}
                    {session.criteria_scores && Object.keys(session.criteria_scores).length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">Criteria Scores</p>
                        <div className="space-y-2">
                          {Object.entries(session.criteria_scores).map(([criterion, score]) => (
                            <div key={criterion} className="flex justify-between items-center">
                              <span className="text-gray-600 capitalize">{criterion.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${(score / 100) * 100}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-gray-900 w-12 text-right">{score}/100</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {session.feedback && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Feedback</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{session.feedback}</p>
                      </div>
                    )}

                    {/* Interview Transcript */}
                    {session.interview_data && session.interview_data.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">Interview Transcript</p>
                        <div className="space-y-4">
                          {session.interview_data.map((item, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-900 flex-1">
                                  Question {idx + 1}: {item.question}
                                </p>
                                {item.score !== undefined && (
                                  <div className="ml-4 flex-shrink-0 text-right">
                                    <div className="text-lg font-bold text-blue-600">{item.score}/100</div>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                                {item.answer || <span className="text-gray-400">No answer provided</span>}
                              </p>
                              {item.score !== undefined && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      item.score >= 75 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(item.score, 100)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No interview sessions yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Export Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button
          onClick={() => {
            const data = { stats, sessions };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview-results-${interviewId}.json`;
            a.click();
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Download Results as JSON
        </button>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`border rounded-lg p-4 text-center ${colorClasses[color]}`}
    >
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}
