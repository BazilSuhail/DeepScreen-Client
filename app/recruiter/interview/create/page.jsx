'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import ScheduleInterview from '@/components/interview/ScheduleInterview';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import { EmptyState, ErrorState, FormSkeleton, StatTile } from '@/components/interview/InterviewStates';
import { btnPrimary, btnSecondary, card } from '@/components/interview/interviewStyles';

const CHECKLIST = [
  'Select the job application to link this interview to.',
  'Set the scheduled time and link expiry for the candidate.',
  'Configure hardware requirements (camera, mic, screen share).',
  'Add instructions so the candidate knows what to expect.',
];

const toApplication = (app) => ({
  application_id: app.application_id,
  job_id: app.job,
  user: app.user,
  user_email: app.candidate_details?.email || 'Candidate',
  job_title: app.job_details?.job_title || 'Job',
  organization: app.job_details?.organization,
});

export default function CreateInterviewPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [appsResult, jobsResult] = await Promise.allSettled([
          api.get('/applications/'),
          api.get('/applications/my-jobs/'),
        ]);
        if (!active) return;

        let failed = false;
        if (appsResult.status === 'fulfilled' && Array.isArray(appsResult.value)) {
          setApplications(appsResult.value.map(toApplication));
        } else {
          failed = true;
          console.error('Error fetching applications:', appsResult.reason);
        }
        if (jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value)) {
          setJobs(jobsResult.value);
        } else {
          failed = true;
          console.error('Error fetching jobs:', jobsResult.reason);
        }
        setError(failed ? 'We could not load candidate applications. Check your connection and try again.' : '');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const jobCount = new Set(applications.map((a) => a.job_id ?? a.job_title)).size;

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {/* Banner first, in loading and loaded states. The back link is the only action here, so it sits in aside. */}
      <DashboardBanner
        loading={loading}
        icon={HiOutlineCalendarDays}
        title="Schedule interview"
        subtitle="Pick a candidate application, then set the time, link expiry and requirements."
        aside={
          loading ? (
            <div className="flex flex-wrap gap-2">
              <BannerBlock className="h-11 w-44 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Link href="/recruiter/interview" className={btnSecondary}>
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to live interviews
              </Link>
            </div>
          )
        }
      />

      {error && <ErrorState message={error} onRetry={retry} />}

      {loading && <FormSkeleton stats={2} />}

      {!loading &&
        (applications.length === 0 ? (
          !error && (
            <EmptyState
              icon={HiOutlineUserGroup}
              title="No applications to schedule"
              text="Candidates need to apply to one of your jobs before you can schedule an interview."
              action={
                <Link href="/recruiter/jobs" className={btnPrimary}>
                  <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                  View jobs
                </Link>
              }
            />
          )
        ) : (
          <>
            <div className="grid max-w-md grid-cols-2 gap-3">
              <StatTile icon={HiOutlineUserGroup} value={applications.length} label="Applications" />
              <StatTile icon={HiOutlineBriefcase} value={jobCount} label="Jobs" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <div className="min-w-0 lg:col-span-3">
                <ScheduleInterview applications={applications} recruiterJobs={jobs} />
              </div>

              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className={`${card} space-y-4 p-5`}>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-950 dark:text-foreground">
                    <HiOutlineInformationCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    Before you start
                  </h2>
                  <ul className="space-y-3 text-sm text-emerald-800/80 dark:text-muted-foreground">
                    {CHECKLIST.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </>
        ))}
    </div>
  );
}
