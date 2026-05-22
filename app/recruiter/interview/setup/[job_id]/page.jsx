'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import SetupInterviewConfig from '@/components/interview/SetupInterviewConfig';
import {
  HiOutlineArrowLeft,
  HiOutlineCog6Tooth,
  HiOutlineBuildingOffice2,
  HiOutlineLightBulb,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import { ErrorState, FormSkeleton } from '@/components/interview/InterviewStates';
import { btnSecondary, card } from '@/components/interview/interviewStyles';

const TIPS = [
  'Set a clear interview title that candidates will recognize.',
  'Adjust duration based on the role seniority and complexity.',
  'Add specific instructions so candidates know what to expect.',
  'Set link expiry to balance security with scheduling flexibility.',
];

export default function JobInterviewSetupPage({ params }) {
  const { job_id } = use(params);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get(`/jobs/${job_id}/`);
        if (!active) return;
        setJob(data);
      } catch {
        if (!active) return;
        setError('We could not load this job. The configuration below still works, but the job details may be missing.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [job_id, attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const subtitle = job ? (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      <HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{job.job_title || 'Untitled job'}</span>
      {job.organization && <span aria-hidden="true">·</span>}
      {job.organization && <span>{job.organization}</span>}
    </span>
  ) : (
    'Set duration, camera, mic, and instructions for this job.'
  );

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {/* Banner first, in loading and loaded states. The back link is the only action here, so it sits in aside. */}
      <DashboardBanner
        loading={loading}
        icon={HiOutlineCog6Tooth}
        title="Interview setup"
        subtitle={subtitle}
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

      {error && <ErrorState title="Job details unavailable" message={error} onRetry={retry} />}

      {loading && <FormSkeleton />}

      {!loading && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="min-w-0 lg:col-span-3">
            <SetupInterviewConfig job_id={job_id} />
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className={`${card} space-y-4 p-5`}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-950 dark:text-foreground">
                <HiOutlineLightBulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Configuration tips
              </h2>
              <ul className="space-y-3 text-sm text-emerald-800/80 dark:text-muted-foreground">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="border-t border-emerald-100 pt-3 text-xs text-emerald-800/80 dark:border-white/10 dark:text-muted-foreground">
                Saved configuration applies to all future sessions for this job.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
