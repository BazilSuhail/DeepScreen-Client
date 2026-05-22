'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import {
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineBuildingOffice2,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCheckBadge,
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineListBullet,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineArrowUpTray,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineGlobeAlt,
  HiOutlineBriefcase,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2';
import JobDetailReveal from '@/components/jobs/JobDetailReveal';
import JobDetailSkeleton from '@/components/jobs/JobDetailSkeleton';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const CARD = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';
const APPLY_BTN = `inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400 ${FOCUS_RING}`;
const ICON_TILE = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg';
const TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
};

function SectionHeading({ icon: Icon, tone, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${ICON_TILE} ${TONES[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-bold text-foreground">{children}</h2>
    </div>
  );
}

export default function JobDetails({ params }) {
  const { id: jobId } = use(params);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobData = await api.get(`/jobs/${jobId}/`);
        setJob(jobData);
      } catch {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchData();
  }, [jobId]);

  const backLink = (
    <Link
      href="/jobs"
      className={`group inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${FOCUS_RING}`}
    >
      <HiOutlineArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
      Back to Jobs
    </Link>
  );

  if (loading) return (
    <div className="min-h-screen mx-auto max-w-350 bg-background font-sans text-foreground">
      <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 pt-24 md:px-8 lg:pt-28">
        {backLink}
        <output className="block text-sm font-semibold text-muted-foreground">Loading position details...</output>
        <JobDetailSkeleton />
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen mx-auto max-w-350 bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-[60vh] w-full min-w-0 flex-col items-center justify-center gap-6 px-4 pb-16 pt-24 text-center md:px-8 lg:pt-28">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <HiOutlineMagnifyingGlass className="h-10 w-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Position Not Found</h1>
          {error && (
            <p role="alert" className="text-sm font-semibold text-muted-foreground">{error}</p>
          )}
        </div>
        <Link
          href="/jobs"
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 dark:bg-emerald-500 dark:hover:bg-emerald-400 ${FOCUS_RING}`}
        >
          <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Opportunities
        </Link>
      </div>
    </div>
  );

  const orgName = job.organization_details?.name;
  const chips = [
    { key: 'location', icon: HiOutlineMapPin, text: job.location || 'Remote / Anywhere' },
    { key: 'type', icon: HiOutlineBriefcase, text: job.job_type || 'N/A' },
    { key: 'salary', icon: HiOutlineCurrencyDollar, text: job.salary_range || 'Competitive' },
    { key: 'posted', icon: HiOutlineCalendarDays, text: job.created_at ? new Date(job.created_at).toLocaleDateString('en-US') : 'Recently' },
    ...(job.experience_level ? [{ key: 'experience', icon: HiOutlineAcademicCap, text: job.experience_level }] : [])
  ];
  const facts = [
    { label: 'Experience', val: job.experience_level || 'Not Specified', icon: HiOutlineAcademicCap, tone: 'emerald' },
    { label: 'Type', val: job.job_type, icon: HiOutlineClock, tone: 'blue' },
    { label: 'Location', val: job.location || 'Remote', icon: HiOutlineMapPin, tone: 'violet' },
    { label: 'Salary', val: job.salary_range || 'Competitive', icon: HiOutlineCurrencyDollar, tone: 'amber' }
  ];

  return (
    <div className="min-h-screen max-w-350 mx-auto bg-background font-sans text-foreground">
      <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 pt-24 md:px-8 lg:pt-28">
        {error && (
          <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <HiOutlineXCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
        {backLink}
        <JobDetailReveal index={0}>
          <header className={`${CARD} p-6 md:p-8`}>
            <div className="flex items-start gap-4 md:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 md:h-16 md:w-16">
                <HiOutlineBuildingOffice2 className="h-7 w-7 md:h-8 md:w-8" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{job.job_title}</h1>
                <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">{orgName || 'Unknown Organization'}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{job.department || 'General'}</p>
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2.5">
              {chips.map(({ key, icon: Icon, text }) => (
                <li
                  key={key}
                  className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-foreground/80 dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </header>
        </JobDetailReveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <JobDetailReveal index={2}>
              <section className="space-y-4">
                <SectionHeading icon={HiOutlineDocumentText} tone="emerald">Job Description</SectionHeading>
                <div className={`${CARD} whitespace-pre-wrap p-6 font-medium leading-relaxed text-muted-foreground md:p-8`}>
                  {job.job_description || 'No description provided.'}
                </div>
              </section>
            </JobDetailReveal>

            {job.responsibilities?.length > 0 && (
              <JobDetailReveal index={3}>
                <section className="space-y-4">
                  <SectionHeading icon={HiOutlineSparkles} tone="blue">Key Responsibilities</SectionHeading>
                  <div className={`${CARD} p-6 md:p-8`}>
                    <ul className="divide-y divide-emerald-100 dark:divide-white/10">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                          <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">{resp}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </JobDetailReveal>
            )}

            {job.requirements?.length > 0 && (
              <JobDetailReveal index={4}>
                <section className="space-y-4">
                  <SectionHeading icon={HiOutlineCheckBadge} tone="violet">Requirements</SectionHeading>
                  <div className={`${CARD} p-6 md:p-8`}>
                    <ul className="divide-y divide-emerald-100 dark:divide-white/10">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                          <HiOutlineCheckBadge className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">{req}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </JobDetailReveal>
            )}
          </div>

          {/* Side column: first on phone so the apply action leads */}
          <aside className="order-first min-w-0 space-y-6 lg:order-none lg:sticky lg:top-24 lg:self-start">
            <JobDetailReveal index={1} className="space-y-6">
              <div className={`${CARD} p-6`}>
                <Link href={`/jobs/${jobId}/apply`} className={APPLY_BTN}>
                  <HiOutlineArrowUpTray className="h-4 w-4" aria-hidden="true" />
                  Apply Now
                </Link>
              </div>

              <div className={`${CARD} p-6`}>
                <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-3 dark:bg-white/5">
                      <span className={`${ICON_TILE} ${TONES[fact.tone]}`}>
                        <fact.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{fact.label}</dt>
                        <dd className="mt-0.5 break-words text-sm font-bold text-foreground">{fact.val}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              <div className={`${CARD} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20">
                    <HiOutlineBuildingOffice2 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-foreground">{orgName || 'Organization'}</h2>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Verified Organization</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <HiOutlineGlobeAlt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {job.organization_details?.industry || 'Technology'}
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <HiOutlineUserGroup className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {job.organization_details?.team_size || '50-100'} members
                  </li>
                </ul>
              </div>

              {job.interview_pipeline?.length > 0 && (
                <div className={`${CARD} p-6`}>
                  <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <HiOutlineListBullet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    Recruitment Roadmap
                  </h3>
                  <div className="relative">
                    <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-emerald-100 dark:bg-white/10" aria-hidden="true" />
                    <ol className="relative space-y-5">
                      {job.interview_pipeline.map((step, i) => (
                        <li key={i} className="relative z-10 flex items-center gap-4">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-white shadow-md shadow-emerald-500/20 dark:border-card">
                            <HiOutlineCheckCircle className="h-3 w-3" aria-hidden="true" />
                          </span>
                          <span className="text-xs font-bold capitalize text-foreground">{step.replace('_', ' ')}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </JobDetailReveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
