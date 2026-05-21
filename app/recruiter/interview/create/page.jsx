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
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

export default function CreateInterviewPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

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
      setError('We could not load candidate applications. Check your connection and try again.');
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await api.get('/applications/my-jobs/');
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('We could not load candidate applications. Check your connection and try again.');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([fetchApplications(), fetchJobs()]);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  const uniqueJobs = [...new Set(applications.map(a => a.job_title))];

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <Link
        href="/recruiter/interview"
        title="Return to the live interviews dashboard"
        className="group flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-emerald-500"
      >
        <HiOutlineChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        Back to Interviews
      </Link>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <HiOutlineVideoCamera className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">Schedule Interview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Set up a live interview session for a candidate application.</p>
          </div>
        </div>

        {applications.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              title="Candidate applications available to schedule"
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2"
            >
              <HiOutlineUserGroup className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span className="text-sm font-semibold">{applications.length}</span>
              <span className="text-xs text-muted-foreground">applications</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              title="Jobs those applications are for"
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2"
            >
              <HiOutlineBriefcase className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span className="text-sm font-semibold">{uniqueJobs.length}</span>
              <span className="text-xs text-muted-foreground">jobs</span>
            </motion.div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex flex-col items-start gap-2">
          <FormError title="Something went wrong" message={error} />
          <button
            type="button"
            onClick={retry}
            title="Try loading applications again"
            className={linkButton}
          >
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      {applications.length === 0 ? (
        !error && (
          <EmptyState
            icon={HiOutlineCalendarDays}
            title="No applications available"
            text="You need candidate applications before scheduling interviews. Post a job and wait for applicants."
            action={<Link href="/recruiter/jobs" className={linkButton}><HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View jobs</Link>}
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="min-w-0 lg:col-span-3">
            <ScheduleInterview applications={applications} recruiterJobs={jobs} />
          </div>

          <aside className="space-y-4">
            <div className="sticky top-10 space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <HiOutlineInformationCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                Before You Start
              </h2>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2" title="The interview is linked to this application">
                  <HiOutlineCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  Select the job application to link this interview to.
                </li>
                <li className="flex items-start gap-2" title="The time the candidate can join and when the link stops working">
                  <HiOutlineCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  Set the scheduled time and link expiry for the candidate.
                </li>
                <li className="flex items-start gap-2" title="Devices the candidate must have ready">
                  <HiOutlineCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  Configure hardware requirements (camera, mic, screen share).
                </li>
                <li className="flex items-start gap-2" title="Shown to the candidate before the session">
                  <HiOutlineCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  Add instructions so the candidate knows what to expect.
                </li>
              </ul>

              {uniqueJobs.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HiOutlineUserGroup className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    {applications.length} candidate{applications.length !== 1 ? 's' : ''} across {uniqueJobs.length} job{uniqueJobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
