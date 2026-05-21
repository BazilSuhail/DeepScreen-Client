'use client';

import { use, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import SetupInterviewConfig from '@/components/interview/SetupInterviewConfig';
import Link from 'next/link';
import {
  HiOutlineChevronLeft,
  HiOutlineCog6Tooth,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineVideoCamera,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineLightBulb,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

export default function JobInterviewSetupPage({ params }) {
  const { job_id } = use(params);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/jobs/${job_id}/`);
        setJob(data);
      } catch {
        setError('We could not load this job. The configuration below still works, but the job details may be missing.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [job_id, attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  const tips = [
    'Set a clear interview title that candidates will recognize.',
    'Adjust duration based on the role seniority and complexity.',
    'Add specific instructions so candidates know what to expect.',
    'Set link expiry to balance security with scheduling flexibility.',
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <Link
        href="/recruiter/interview"
        title="Return to the live interviews dashboard"
        className="group flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-emerald-500"
      >
        <HiOutlineChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <HiOutlineCog6Tooth className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">Interview Configuration</h1>
            {job && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <HiOutlineBuildingOffice2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium text-muted-foreground">{job.job_title}</span>
                {job.organization && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{job.organization}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {job && (
          <div className="flex flex-wrap items-center gap-3">
            <span title="Job type" className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground">
              <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
              {job.job_type || 'Full-time'}
            </span>
            <span title="Sessions for this job are live" className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground">
              <HiOutlineVideoCamera className="h-3.5 w-3.5" aria-hidden="true" />
              Live
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex flex-col items-start gap-2">
          <FormError title="Job details unavailable" message={error} />
          <button
            type="button"
            onClick={retry}
            title="Try loading the job details again"
            className={linkButton}
          >
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="min-w-0 lg:col-span-3">
          <SetupInterviewConfig job_id={job_id} />
        </div>

        <aside className="space-y-4">
          <div className="sticky top-10 space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <HiOutlineShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              Configuration Tips
            </h2>
            <ul className="space-y-3 text-xs text-muted-foreground">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <HiOutlineLightBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2 text-xs">
                <HiOutlineCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                <span className="text-muted-foreground">Saved configuration applies to all future sessions for this job.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
