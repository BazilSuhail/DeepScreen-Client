'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineBriefcase, HiOutlinePlus, HiOutlineMapPin,
  HiOutlineBuildingOffice2, HiOutlineArrowRight, HiOutlineUsers,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import OrgSubpageBanner, { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';
import OrgSubpageSkeleton from '@/components/organizations/OrgSubpageSkeleton';

export default function OrgJobsPage() {
  const { slug } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/organizations/${slug}/dashboard/`)
      .then(setDashboard)
      .catch(() => {
        setError(true);
        api.get(`/organizations/${slug}/`).then((orgData) => {
          setDashboard({ organization: orgData, jobs: [] });
          setError(false);
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <OrgSubpageSkeleton variant="list" />;

  if (error) {
    return (
      <div className={ORG_PAGE_CLASS}>
        <OrgSubpageBanner slug={slug} current="jobs" icon={HiOutlineBriefcase} title="Jobs" subtitle="Jobs could not be loaded" />
        <FormError title="Jobs unavailable" message="We could not load your job postings. Refresh the page to try again." />
      </div>
    );
  }

  const jobs = dashboard?.jobs || [];
  const openJobs = jobs.filter((job) => job.status === 'open').length;
  const applicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
  const industry = dashboard?.organization?.industry;
  const industryBadge = industry ? { label: industry, icon: HiOutlineBuildingOffice2 } : undefined;

  return (
    <div className={ORG_PAGE_CLASS}>
      <OrgSubpageBanner
        slug={slug}
        current="jobs"
        icon={HiOutlineBriefcase}
        badge={industryBadge}
        title="Jobs"
        subtitle={`${jobs.length} total ${jobs.length === 1 ? 'position' : 'positions'} · ${applicants} ${applicants === 1 ? 'applicant' : 'applicants'}`}
        footer="Post a job, then invite candidates to apply."
        emptyText="No jobs posted yet. Create one to start receiving applications."
        stats={jobs.length ? [
          { label: 'Open positions', value: openJobs, icon: HiOutlineCheckCircle, hint: 'Jobs currently accepting applications' },
          { label: 'Applicants', value: applicants, icon: HiOutlineUsers, hint: 'Applications across all postings' },
          { label: 'Total positions', value: jobs.length, icon: HiOutlineBriefcase, hint: 'All job postings, open or closed' },
        ] : null}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No Jobs Posted"
          text="Create a job posting to start receiving applications."
          action={
            <Link href={`/organizations/${slug}/jobs/create`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500">
              <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create Job
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {jobs.map((job, i) => {
            const isOpen = job.status === 'open';
            return (
              <motion.li key={job.job_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/30 lg:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="min-w-0 break-words font-semibold text-foreground">{job.job_title}</h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${isOpen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {job.department && <span className="flex items-center gap-1"><HiOutlineBuildingOffice2 className="h-3.5 w-3.5" aria-hidden="true" />{job.department}</span>}
                      {job.location && <span className="flex items-center gap-1"><HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" />{job.location}</span>}
                      {job.job_type && <span>{job.job_type}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{job.applications_count}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Applicants</span>
                      </div>
                      <HiOutlineArrowRight className="h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
