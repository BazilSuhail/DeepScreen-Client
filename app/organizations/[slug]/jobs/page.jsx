'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineBriefcase, HiOutlinePlus, HiOutlineMapPin, HiOutlineTag,
  HiOutlineBuildingOffice2, HiOutlineUsers, HiOutlineCheckCircle,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { card, iconTile, primaryButton } from '@/components/ui/styles';
import { ORG_PAGE, Chip, OrgSubpageHeader, StatTile, industryBadge, itemMotion } from '@/components/organizations/orgUi';
import OrgJobsSkeleton from '@/components/skeletons/organizations/OrgJobsSkeleton';

export default function OrgJobsPage() {
  const { slug } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { user } = useAuth();
  // Jobs are created from the recruiter workspace; staff can only view them here.
  const canCreate = user?.role === 'RECRUITER';

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
  }, [slug, attempt]);

  if (loading) return <OrgJobsSkeleton />;

  if (error) {
    return (
      <div className={ORG_PAGE}>
        <OrgSubpageHeader slug={slug} current="jobs" title="Jobs" />
        <ErrorState title="Jobs unavailable" message="We could not load your job postings."
          onRetry={() => { setLoading(true); setError(false); setAttempt((n) => n + 1); }}
        />
      </div>
    );
  }

  const jobs = dashboard?.jobs || [];
  const openJobs = jobs.filter((job) => job.status === 'open').length;
  const applicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);

  return (
    <div className={ORG_PAGE}>
      <OrgSubpageHeader
        slug={slug}
        current="jobs"
        title="Jobs"
        description={`${jobs.length} total ${jobs.length === 1 ? 'position' : 'positions'} · ${applicants} ${applicants === 1 ? 'applicant' : 'applicants'}. Post a job, then invite candidates to apply.`}
        meta={industryBadge(dashboard?.organization?.industry)}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No jobs posted"
          text={canCreate ? 'Create a job posting to start receiving applications.' : 'Recruiters in your organization post jobs here.'}
          action={canCreate && (
            <Link href="/recruiter/jobs/create" className={primaryButton}>
              <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create job
            </Link>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile i={0} label="Open positions" value={openJobs} icon={HiOutlineCheckCircle} hint="Jobs currently accepting applications" />
            <StatTile i={1} label="Applicants" value={applicants} icon={HiOutlineUsers} tone="teal" hint="Applications across all postings" />
            <StatTile i={2} label="Total positions" value={jobs.length} icon={HiOutlineBriefcase} tone="amber" hint="All job postings, open or closed" />
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {jobs.map((job, i) => {
              const isOpen = job.status === 'open';
              return (
                <motion.li key={job.job_id} {...itemMotion(i)} className={`${card} flex flex-col gap-4 p-5`}>
                  <div className="flex items-start gap-3">
                    <span className={`${iconTile} h-10 w-10 ${isOpen ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3 className="break-words font-semibold">{job.job_title}</h3>
                      <Chip tone={isOpen ? 'emerald' : 'muted'}><span className="capitalize">{job.status}</span></Chip>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {job.department && <li className="flex items-center gap-1.5"><HiOutlineBuildingOffice2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{job.department}</span></li>}
                    {job.location && <li className="flex items-center gap-1.5"><HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{job.location}</span></li>}
                    {job.job_type && <li className="flex items-center gap-1.5"><HiOutlineTag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{job.job_type}</span></li>}
                  </ul>
                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
                    <HiOutlineUsers className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                    <span className="text-lg font-semibold tabular-nums">{job.applications_count ?? 0}</span>
                    <span className="text-xs text-muted-foreground">{job.applications_count === 1 ? 'applicant' : 'applicants'}</span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
