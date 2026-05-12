'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineBriefcase, HiOutlinePlus, HiOutlineMapPin,
  HiOutlineBuildingOffice2, HiOutlineArrowRight,
} from 'react-icons/hi2';

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

  if (loading) return (
    <div className="space-y-4 px-12 py-8">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
    </div>
  );

  if (error) return <div className="text-center py-20 text-destructive">Failed to load jobs</div>;

  const jobs = dashboard?.jobs || [];

  return (
    <div className="space-y-6 px-12 py-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href={`/organizations/${slug}`} className="hover:text-emerald-500 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Jobs</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground mt-1">{jobs.length} total positions</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineBriefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Jobs Posted</h2>
          <p className="text-muted-foreground mb-6">Create a job posting to start receiving applications.</p>
          <Link href={`/organizations/${slug}/jobs/create`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20">
            <HiOutlinePlus className="w-5 h-5" /> Create Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job, i) => (
            <motion.div key={job.job_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center text-blue-500 shrink-0">
                    <HiOutlineBriefcase className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{job.job_title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {job.department && <span className="flex items-center gap-1"><HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />{job.department}</span>}
                      {job.location && <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{job.location}</span>}
                      {job.job_type && <span>{job.job_type}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>{job.status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-lg font-black text-foreground">{job.applications_count}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Applicants</div>
                      <HiOutlineArrowRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
