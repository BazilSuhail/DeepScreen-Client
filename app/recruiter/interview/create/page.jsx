'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import ScheduleInterview from '@/components/interview/ScheduleInterview';
import Link from 'next/link';
import {
  HiOutlineChevronLeft,
  HiOutlineVideoCamera,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';

export default function CreateInterviewPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchApplications(), fetchJobs()]).finally(() => setLoading(false));
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.get('/applications/');
      const formatted = data.map(app => ({
        application_id: app.application_id,
        job_id: app.job,
        user: app.user,
        user_email: app.candidate_details?.email || 'Candidate',
        job_title: app.job_details?.job_title || 'Job',
        organization: app.job_details?.organization
      }));
      setApplications(formatted);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await api.get('/applications/my-jobs/');
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
          <HiOutlineVideoCamera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  const uniqueJobs = [...new Set(applications.map(a => a.job_title))];

  return (
    <div className="w-full px-4 md:px-6 space-y-8 pb-12">
      <Link
        href="/recruiter/interview"
        className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors font-bold text-xs uppercase tracking-widest group"
      >
        <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Interviews
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <HiOutlineVideoCamera className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Schedule Interview</h1>
            <p className="text-sm text-muted-foreground mt-1">Set up a live interview session for a candidate application.</p>
          </div>
        </div>

        {applications.length > 0 && (
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg border border-border"
            >
              <HiOutlineUserGroup className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">{applications.length}</span>
              <span className="text-xs text-muted-foreground">applications</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg border border-border"
            >
              <HiOutlineBriefcase className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">{uniqueJobs.length}</span>
              <span className="text-xs text-muted-foreground">jobs</span>
            </motion.div>
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto text-muted-foreground/40">
            <HiOutlineCalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground/60">No applications available</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            You need candidate applications before scheduling interviews. Post a job and wait for applicants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <ScheduleInterview applications={applications} recruiterJobs={jobs} />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 sticky top-10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HiOutlineInformationCircle className="w-4 h-4 text-emerald-500" />
                Before You Start
              </h3>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Select the job application to link this interview to.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Set the scheduled time and link expiry for the candidate.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Configure hardware requirements (camera, mic, screen share).
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Add instructions so the candidate knows what to expect.
                </li>
              </ul>

              {uniqueJobs.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {applications.length} candidate{applications.length !== 1 ? 's' : ''} across {uniqueJobs.length} job{uniqueJobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
