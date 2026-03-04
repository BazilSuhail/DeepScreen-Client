'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import {
  decryptPrivateKey,
  hexToUint8Array,
  restorePrivateKeyLocally,
  stretchPassword,
} from '@/components/authentication/crypto';
import ChatThread from '@/components/chats/ChatThread';

export default function RecruiterChatPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [error, setError] = useState('');
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [decryptingKey, setDecryptingKey] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/recruiter/jobs/');
      setJobs(response.jobs || []);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    setAppLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/recruiter/applications/', {
        params: { job_id: jobId },
      });
      setApplications(response.applications || []);
      setSelectedJob(jobId);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  };

  const handleDecryptPrivateKey = async (e) => {
    e.preventDefault();
    setDecryptingKey(true);
    setError('');
    try {
      // Try local restore first
      const localKey = await restorePrivateKeyLocally();
      if (localKey) {
        setDecryptedPrivateKey(localKey);
        setShowPasswordPrompt(false);
        setPasswordInput('');
        return;
      }

      // Otherwise, decrypt using password and encryption_salt from server
      if (!user.encryption_salt || !user.encrypted_private_key) {
        setError('E2EE keys not set up. Please contact support.');
        return;
      }

      const aesKey = await stretchPassword(passwordInput, user.encryption_salt);
      const privateKey = await decryptPrivateKey(user.encrypted_private_key, aesKey);
      setDecryptedPrivateKey(privateKey);
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } catch (err) {
      setError('Failed to decrypt private key. Check your password.');
      console.error(err);
    } finally {
      setDecryptingKey(false);
    }
  };

  if (!user || user.role !== 'RECRUITER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl text-center">
          <p className="text-muted-foreground">You must be a recruiter to access this page.</p>
        </div>
      </div>
    );
  }

  if (selectedRoom && decryptedPrivateKey) {
    return (
      <ChatThread
        room={selectedRoom}
        userRole="RECRUITER"
        privateKey={decryptedPrivateKey}
        onBack={() => {
          setSelectedRoom(null);
          fetchApplications(selectedJob); // Refresh apps to update read counts
        }}
      />
    );
  }

  if (selectedJob && applications.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Header with back button */}
          <button
            onClick={() => {
              setSelectedJob(null);
              setApplications([]);
            }}
            className="mb-6 px-4 py-2 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all"
          >
            ← Back to Jobs
          </button>

          {/* Password/Decrypt Prompt */}
          {!decryptedPrivateKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 glass p-6 rounded-3xl border border-emerald-500/20"
            >
              <h2 className="text-lg font-semibold text-emerald-600 mb-4">Unlock Your Messages</h2>
              {showPasswordPrompt ? (
                <form onSubmit={handleDecryptPrivateKey} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={decryptingKey}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {decryptingKey ? 'Unlocking...' : 'Unlock'}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowPasswordPrompt(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  Unlock Messages with Password
                </button>
              )}
            </motion.div>
          )}

          {/* Applications List */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">
            Applicants
          </h1>

          {appLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⚙️</div>
              <p className="text-muted-foreground mt-4">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-8 rounded-3xl text-center border border-emerald-500/10"
            >
              <p className="text-muted-foreground text-lg">No applications yet</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <motion.button
                  key={app.application_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (!decryptedPrivateKey) {
                      setShowPasswordPrompt(true);
                    } else {
                      setSelectedRoom({
                        ...app,
                        candidate_id: app.candidate_id,
                        recruiter_id: user.user_id,
                      });
                    }
                  }}
                  disabled={!decryptedPrivateKey}
                  className="glass p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                        {app.candidate_email}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stage: <span className="text-emerald-600 font-medium">{app.current_stage}</span>
                      </p>
                    </div>
                    {app.chat_room_exists && (
                      <div className="text-xs font-semibold text-emerald-600">💬 Active</div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Your Jobs
          </h1>
          <p className="text-muted-foreground">Select a job to view applicant conversations</p>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⚙️</div>
            <p className="text-muted-foreground mt-4">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-8 rounded-3xl text-center border border-emerald-500/10"
          >
            <p className="text-muted-foreground text-lg">No jobs posted yet</p>
            <p className="text-sm text-muted-foreground mt-2">Create a job to start receiving applications</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <motion.button
                key={job.job_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => fetchApplications(job.job_id)}
                className="glass p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                      {job.job_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Status: <span className="text-emerald-600 font-medium capitalize">{job.status}</span>
                    </p>
                  </div>
                  <div className="bg-emerald-600/20 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {job.application_count} applications
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Posted: {new Date(job.posted_date).toLocaleDateString()}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
