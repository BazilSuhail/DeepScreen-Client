'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2';

export default function RecruiterChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [error, setError] = useState('');

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
      setSelectedJob(jobs.find(j => j.job_id === jobId));
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  };


  if (!user || user.role !== 'RECRUITER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="glass p-8 rounded-3xl text-center border border-emerald-500/10">
          <p className="text-muted-foreground font-medium">Recruiter access only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pb-20">
      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {!selectedJob ? (
            <motion.div
              key="jobs-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-12">
                <h1 className="text-5xl font-black tracking-tight text-gradient mb-3">
                  Recruitment Inbox
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                  Manage conversations for your active job postings
                </p>
              </div>

              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass h-24 rounded-[2rem] animate-pulse"></div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center border border-emerald-500/10">
                  <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">💼</div>
                  <h3 className="text-xl font-bold mb-2">No active jobs</h3>
                  <p className="text-muted-foreground">Post a job to start seeing applicant messages.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {jobs.map((job) => (
                    <motion.button
                      key={job.job_id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fetchApplications(job.job_id)}
                      className="group glass p-8 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <HiOutlineBriefcase className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                            {job.job_title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-600/70">
                              <HiOutlineUserGroup className="w-4 h-4" />
                              {job.shortlisted_count} Shortlisted
                            </span>
                            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground uppercase font-black">
                              {job.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <HiOutlineChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="apps-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-emerald-600 font-bold mb-8 hover:gap-3 transition-all"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
                Back to Jobs
              </button>

              <div className="mb-12">
                <h2 className="text-4xl font-black tracking-tight text-foreground mb-2">
                  {selectedJob.job_title}
                </h2>
                <p className="text-muted-foreground font-medium">
                  Shortlisted candidates available for chat
                </p>
              </div>

              {appLoading ? (
                <div className="grid gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="glass h-24 rounded-[2rem] animate-pulse"></div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center border border-emerald-500/10">
                  <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">👥</div>
                  <h3 className="text-xl font-bold mb-2">No shortlisted candidates</h3>
                  <p className="text-muted-foreground">Shortlist applicants from the job management portal to start chatting.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {applications.map((app) => (
                    <motion.button
                      key={app.application_id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => router.push(`/chats/${app.application_id}`)}
                      className="group glass p-8 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-600 font-bold text-lg">
                          {app.candidate_name[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                            {app.candidate_name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {app.candidate_email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {app.unread_count > 0 ? (
                          <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-emerald-600/30">
                            {app.unread_count} New
                          </div>
                        ) : app.chat_room_exists ? (
                          <HiOutlineChatBubbleBottomCenterText className="w-6 h-6 text-emerald-600/50" />
                        ) : null}
                        <HiOutlineChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
