'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import JobCreateForm from '@/components/jobs/JobCreateForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineBriefcase,
  HiOutlineArrowPath,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import PageHeader from '@/components/ui/PageHeader';
import ErrorState from '@/components/dashboard/ErrorState';
import JobFormSkeleton from '@/components/skeletons/recruiter/JobFormSkeleton';
import { base, fadeUp } from '@/constants/motion';
import { card, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';

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
      const job = await api.post('/jobs/', { ...data, status: publish ? 'open' : 'draft' });
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

  if (loading) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <JobFormSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        back={{ href: '/recruiter/jobs', label: 'Jobs' }}
        icon={HiOutlineBriefcase}
        eyebrow="New posting"
        title="Create a job"
        description="Describe the role, its requirements and pay so the right candidates apply."
        meta={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <HiOutlineLightBulb className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            Specific requirements and key skills give candidates a clearer picture of the role.
          </span>
        }
        actions={
          <>
            <button type="submit" form="job-form" disabled={saving} title="Save the job without publishing it" className={secondaryButton}>
              {saving ? (
                <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
              )}
              Save draft
            </button>
            <button
              type="submit"
              form="job-form"
              data-publish="true"
              disabled={saving}
              title="Save the job and make it visible to candidates"
              className={primaryButton}
            >
              {saving ? (
                <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <HiOutlineRocketLaunch className="h-4 w-4" aria-hidden="true" />
              )}
              Publish job
            </button>
          </>
        }
      />

      {error && <ErrorState title="Organizations unavailable" message={error} onRetry={retry} />}

      {notice && (notice.tone === 'error' ? (
        <div role="alert" className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{notice.text}</span>
          {notice.draftHref && (
            <Link href={notice.draftHref} className="font-semibold underline underline-offset-4">Open the saved job</Link>
          )}
        </div>
      ) : (
        <output className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          <HiOutlineCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> {notice.text}
        </output>
      ))}

      <motion.section
        {...fadeUp}
        transition={base}
        className={`${card} flex flex-col gap-4 border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-emerald-500/5`}
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
            <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold">Set up with AI</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chat with an assistant and it fills in the job for you, checking required fields as you go.
            </p>
          </div>
        </div>
        <Link href="/recruiter/jobs/create/ai" title="Set up this job with the AI assistant" className={`${secondaryButton} shrink-0`}>
          <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Start with AI
          <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.section>

      <div className="flex items-center gap-4">
        <hr className="m-0 h-px flex-1 border-0 bg-emerald-100 dark:bg-white/10" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Or fill it in yourself</span>
        <hr className="m-0 h-px flex-1 border-0 bg-emerald-100 dark:bg-white/10" />
      </div>

      <JobCreateForm
        mode="create"
        title="Create job"
        orgs={organizations}
        onSubmit={createJob}
      />
    </div>
  );
}
