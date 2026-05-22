'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import JobCreateForm from '@/components/jobs/JobCreateForm';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiOutlineBriefcase,
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineSparkles,
  HiOutlinePlusCircle,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const primaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
const secondaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/20 ${focusRing}`;

export default function CreateJobPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const publishIntent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/organizations/')
      .then((data) => {
        if (!cancelled) setOrganizations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError('We could not load your organizations. Check your connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Records which button submitted the form. Only the Publish button sets data-publish.
  useEffect(() => {
    if (loading) return;
    const form = document.getElementById('job-form');
    if (!form) return;
    const record = (e) => {
      publishIntent.current = e.submitter?.dataset.publish === 'true';
    };
    form.addEventListener('submit', record, true);
    return () => form.removeEventListener('submit', record, true);
  }, [loading]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  // Saves the form exactly as before; when Publish was clicked, publishes the saved job afterwards.
  const createJob = async (data) => {
    const publish = publishIntent.current;
    setSaving(true);
    setNotice(null);
    try {
      const job = await api.post('/jobs/', data);
      const jobId = job?.job_id;
      if (!publish) {
        router.push('/recruiter/jobs');
        return;
      }
      try {
        if (!jobId) throw new Error('Missing job id');
        await api.post(`/jobs/${jobId}/publish/`);
      } catch {
        setNotice({
          tone: 'error',
          text: 'The job was saved, but it could not be published. Try again.',
          draftHref: jobId ? `/recruiter/jobs/${jobId}/edit` : null,
        });
        return;
      }
      setNotice({ tone: 'success', text: 'Job published. Taking you to your postings...' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.push('/recruiter/jobs');
    } finally {
      setSaving(false);
    }
  };

  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineBriefcase}
      badge={loading ? undefined : { label: 'New posting', icon: HiOutlinePlusCircle }}
      title="Create a job"
      subtitle="Describe the role, its requirements and pay so the right candidates apply."
      footer={loading ? null : (
        <span className="flex items-start gap-2">
          <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <span>Tip: specific requirements and key skills give candidates a clearer picture of the role.</span>
        </span>
      )}
      aside={loading ? (
        <div className="flex flex-wrap gap-2">
          <BannerBlock className="h-11 w-36 rounded-xl" />
          <BannerBlock className="h-11 w-36 rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Link href="/recruiter/jobs" title="Back to your job postings" className={secondaryButton}>
            <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" /> My Jobs
          </Link>
          <Link href="/recruiter/jobs/create/ai" title="Set up this job with the AI assistant" className={primaryButton}>
            <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Start with AI
          </Link>
          <button
            type="submit"
            form="job-form"
            disabled={saving}
            title="Save the job without publishing it"
            className={secondaryButton}
          >
            <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" /> Save draft
          </button>
          <button
            type="submit"
            form="job-form"
            data-publish="true"
            disabled={saving}
            title="Save the job and make it visible to candidates"
            className={primaryButton}
          >
            <HiOutlineRocketLaunch className="h-4 w-4" aria-hidden="true" /> Publish job
          </button>
        </div>
      )}
    />
  );

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {banner}

      {loading && <PageSkeleton stats={0} cards={2} banner={false} />}

      {!loading && error && (
        <div className="flex flex-col items-start gap-2">
          <FormError title="Organizations unavailable" message={error} />
          <button type="button" onClick={retry} title="Try loading organizations again" className={secondaryButton}>
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      {!loading && (
        <>
          {notice && (notice.tone === 'error' ? (
            <div role="alert" className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              <span>{notice.text}</span>
              {notice.draftHref && (
                <Link href={notice.draftHref} className="font-semibold underline underline-offset-4">Open the saved job</Link>
              )}
            </div>
          ) : (
            <output className="block rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
              {notice.text}
            </output>
          ))}

          <section className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6 dark:border-emerald-500/25 dark:bg-emerald-500/5">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold text-emerald-950 dark:text-white">Set up with AI</h2>
                <p className="text-sm leading-relaxed text-emerald-800/80 dark:text-slate-400">
                  Chat with an assistant and it fills in the job for you, checking required fields as you go.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4">
            <hr className="m-0 h-px flex-1 border-0 bg-emerald-100 dark:bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800/70 dark:text-slate-400">Or fill it in yourself</span>
            <hr className="m-0 h-px flex-1 border-0 bg-emerald-100 dark:bg-white/10" />
          </div>

          <JobCreateForm
            mode="create"
            title="Create job"
            primaryLabel="Post job"
            orgs={organizations}
            onSubmit={createJob}
          />
        </>
      )}
    </div>
  );
}
