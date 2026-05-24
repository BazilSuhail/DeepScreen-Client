'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import { base, fadeUp } from '@/constants/motion';
import ScheduleInterview from '@/components/interview/ScheduleInterview';
import PageHeader from '@/components/ui/PageHeader';
import { cardPadded, primaryButton } from '@/components/ui/styles';
import {
  HiOutlineCalendarDays,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import InterviewCreateSkeleton from '@/components/skeletons/recruiter/InterviewCreateSkeleton';
import { EmptyState, ErrorState, SectionHeading, StatTile } from '@/components/interview/InterviewStates';

const CHECKLIST = [
  'Pick the job and the candidates to interview.',
  'Set the first start time and the gap between interviews.',
  'Preview the slots, then confirm. Each candidate gets the next slot in order.',
  'Hardware, instructions and session length come from the job template.',
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

  if (loading) return <InterviewCreateSkeleton />;

  const jobCount = new Set(applications.map((a) => a.job_id ?? a.job_title)).size;

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        back={{ href: '/recruiter/interview', label: 'Live interviews' }}
        icon={HiOutlineCalendarDays}
        eyebrow="Live interviews"
        title="Schedule interview"
        description="Pick the candidates for a job, then set the first start time and the gap between interviews."
      />

      {error && <ErrorState message={error} onRetry={retry} />}

      {applications.length === 0 ? (
        !error && (
          <EmptyState
            icon={HiOutlineUserGroup}
            title="No applications to schedule"
            text="Candidates need to apply to one of your jobs before you can schedule an interview."
            action={
              <Link href="/recruiter/jobs" className={primaryButton}>
                <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                View jobs
              </Link>
            }
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile index={0} icon={HiOutlineUserGroup} value={applications.length} label="Applications" hint="Ready to schedule" />
            <StatTile index={1} icon={HiOutlineBriefcase} value={jobCount} label="Jobs" hint="With applicants" />
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8 2xl:col-span-9">
              <ScheduleInterview applications={applications} recruiterJobs={jobs} />
            </div>

            <motion.aside
              {...fadeUp}
              transition={{ ...base, delay: 0.08 }}
              className={`${cardPadded} space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:self-start 2xl:col-span-3`}
            >
              <SectionHeading icon={HiOutlineInformationCircle} title="Before you start" />
              <ul className="space-y-3 text-sm text-muted-foreground">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.aside>
          </div>
        </>
      )}
    </div>
  );
}
