'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import {
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineCheckBadge,
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineListBullet,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineArrowUpTray,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineGlobeAlt,
  HiOutlineBriefcase,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowLeft,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';
import JobDetailReveal from '@/components/jobs/JobDetailReveal';
import JobDetailSkeleton from '@/components/skeletons/jobs/JobDetailSkeleton';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { badge, cardPadded, iconTile, primaryButton } from '@/components/ui/styles';

const PAGE = 'space-y-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28 2xl:px-10';
const BACK = { href: '/jobs', label: 'Jobs' };
const DASH = <span className="text-muted-foreground">—</span>;

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
    </div>
  );
}

function BulletList({ items, icon: Icon }) {
  return (
    <ul className="divide-y divide-emerald-100 dark:divide-white/10">
      {items.map((text, i) => (
        <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{text}</p>
        </li>
      ))}
    </ul>
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

  if (loading) return <JobDetailSkeleton />;

  if (!job) return (
    <div className={PAGE}>
      <PageHeader back={BACK} icon={HiOutlineBriefcase} eyebrow="Job board" title="Position not found" />
      {error && <ErrorState title={error} message="The job may have been closed or removed." />}
      <EmptyState
        icon={HiOutlineMagnifyingGlass}
        title="We couldn't find this position"
        text="Browse the job board for other open roles."
        action={
          <Link href="/jobs" className={primaryButton}>
            <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to jobs
          </Link>
        }
      />
    </div>
  );

  const org = job.organization_details;
  const posted = job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const chips = [
    job.location && { key: 'location', icon: HiOutlineMapPin, text: job.location },
    job.job_type && { key: 'type', icon: HiOutlineBriefcase, text: job.job_type },
    job.salary_range && { key: 'salary', icon: HiOutlineCurrencyDollar, text: job.salary_range },
    posted && { key: 'posted', icon: HiOutlineCalendarDays, text: `Posted ${posted}` },
  ].filter(Boolean);
  const facts = [
    { label: 'Experience', val: job.experience_level, icon: HiOutlineAcademicCap },
    { label: 'Type', val: job.job_type, icon: HiOutlineClock },
    { label: 'Location', val: job.location, icon: HiOutlineMapPin },
    { label: 'Salary', val: job.salary_range, icon: HiOutlineCurrencyDollar },
    { label: 'Department', val: job.department, icon: HiOutlineSquares2X2 },
  ];
  const applyHref = `/jobs/${jobId}/apply`;

  return (
    <div className={PAGE}>
      <PageHeader
        back={BACK}
        icon={HiOutlineBuildingOffice2}
        eyebrow={org?.name || 'Job opening'}
        title={job.job_title || 'Untitled role'}
        description={job.department || undefined}
        meta={chips.map(({ key, icon: Icon, text }) => (
          <span key={key} className={`${badge} border border-emerald-100 bg-emerald-50/60 text-foreground/80 dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground`}>
            <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {text}
          </span>
        ))}
        actions={
          <Link href={applyHref} className={primaryButton}>
            <HiOutlineArrowUpTray className="h-4 w-4" aria-hidden="true" />
            Apply now
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main column */}
        <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">
          <JobDetailReveal index={1}>
            <section className={`${cardPadded} space-y-4`}>
              <SectionHeading icon={HiOutlineDocumentText}>Job description</SectionHeading>
              {job.job_description ? (
                <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.job_description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description provided.</p>
              )}
            </section>
          </JobDetailReveal>

          {job.responsibilities?.length > 0 && (
            <JobDetailReveal index={2}>
              <section className={`${cardPadded} space-y-4`}>
                <SectionHeading icon={HiOutlineSparkles}>Key responsibilities</SectionHeading>
                <BulletList items={job.responsibilities} icon={HiOutlineCheckCircle} />
              </section>
            </JobDetailReveal>
          )}

          {job.requirements?.length > 0 && (
            <JobDetailReveal index={3}>
              <section className={`${cardPadded} space-y-4`}>
                <SectionHeading icon={HiOutlineCheckBadge}>Requirements</SectionHeading>
                <BulletList items={job.requirements} icon={HiOutlineCheckBadge} />
              </section>
            </JobDetailReveal>
          )}
        </div>

        {/* Aside: apply, quick facts, organization, process */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:col-span-4 lg:self-start 2xl:col-span-3">
          <JobDetailReveal index={2} className="space-y-6">
            <div className={`${cardPadded} space-y-3`}>
              <Link href={applyHref} className={`${primaryButton} w-full`}>
                <HiOutlineArrowUpTray className="h-4 w-4" aria-hidden="true" />
                Apply now
              </Link>
              <p className="text-xs leading-relaxed text-muted-foreground">Pick one of your resumes and submit. You can track it under My Applications.</p>
            </div>

            <div className={cardPadded}>
              <dl className="space-y-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3">
                    <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                      <fact.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fact.label}</dt>
                      <dd className="mt-0.5 break-words text-sm font-semibold text-foreground">{fact.val || DASH}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div className={`${cardPadded} space-y-4`}>
              <div className="flex items-center gap-3">
                <span className={`${iconTile} h-12 w-12 bg-emerald-600 text-white`}>
                  <HiOutlineBuildingOffice2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-foreground">{org?.name || DASH}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Hiring organization</p>
                </div>
              </div>
              {(org?.industry || org?.team_size) && (
                <ul className="space-y-2 border-t border-border pt-4">
                  {org?.industry && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HiOutlineGlobeAlt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      {org.industry}
                    </li>
                  )}
                  {org?.team_size && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HiOutlineUserGroup className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      {org.team_size} members
                    </li>
                  )}
                </ul>
              )}
            </div>

            {job.interview_pipeline?.length > 0 && (
              <div className={`${cardPadded} space-y-5`}>
                <SectionHeading icon={HiOutlineListBullet}>Hiring process</SectionHeading>
                <ol className="relative space-y-4">
                  <span className="absolute bottom-3 left-[11px] top-3 w-px bg-emerald-200 dark:bg-white/10" aria-hidden="true" />
                  {job.interview_pipeline.map((step, i) => (
                    <li key={i} className="relative flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white ring-4 ring-card">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium capitalize text-foreground">{String(step).replaceAll('_', ' ')}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </JobDetailReveal>
        </aside>
      </div>
    </div>
  );
}
