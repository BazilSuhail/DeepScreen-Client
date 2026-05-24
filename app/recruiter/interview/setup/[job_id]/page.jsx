'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import { base, fadeUp } from '@/constants/motion';
import SetupInterviewConfig from '@/components/interview/SetupInterviewConfig';
import PageHeader from '@/components/ui/PageHeader';
import { badge, cardPadded } from '@/components/ui/styles';
import {
  HiOutlineCog6Tooth,
  HiOutlineBuildingOffice2,
  HiOutlineBriefcase,
  HiOutlineLightBulb,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import InterviewSetupSkeleton from '@/components/skeletons/recruiter/InterviewSetupSkeleton';
import { ErrorState, SectionHeading } from '@/components/interview/InterviewStates';

const TIPS = [
  'Set a clear interview title that candidates will recognize.',
  'Adjust duration based on the role seniority and complexity.',
  'Add specific instructions so candidates know what to expect.',
  'Set link expiry to balance security with scheduling flexibility.',
];

const chip = `${badge} bg-emerald-50 text-emerald-800 dark:bg-white/10 dark:text-muted-foreground`;

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

  if (loading) return <InterviewSetupSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        back={{ href: '/recruiter/interview', label: 'Live interviews' }}
        icon={HiOutlineCog6Tooth}
        eyebrow="Interview setup"
        title={job?.job_title || 'Interview setup'}
        description="Set duration, camera, mic, and instructions for this job."
        meta={
          job && (
            <>
              <span className={chip}>
                <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" />
                Job template
              </span>
              {job.organization && (
                <span className={chip}>
                  <HiOutlineBuildingOffice2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.organization}
                </span>
              )}
            </>
          )
        }
      />

      {error && <ErrorState title="Job details unavailable" message={error} onRetry={retry} />}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8 2xl:col-span-9">
          <SetupInterviewConfig job_id={job_id} />
        </div>

        <motion.aside
          {...fadeUp}
          transition={{ ...base, delay: 0.08 }}
          className={`${cardPadded} space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:self-start 2xl:col-span-3`}
        >
          <SectionHeading icon={HiOutlineLightBulb} title="Configuration tips" />
          <ul className="space-y-3 text-sm text-muted-foreground">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5">
                <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
          <p className="border-t border-emerald-100 pt-3 text-xs text-muted-foreground dark:border-white/10">
            Saved configuration applies to all future sessions for this job.
          </p>
        </motion.aside>
      </div>
    </div>
  );
}
