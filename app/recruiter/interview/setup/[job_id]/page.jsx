'use client';

import { use, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import SetupInterviewConfig from '@/components/interview/SetupInterviewConfig';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineChevronLeft,
  HiOutlineCog6Tooth,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineVideoCamera,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

export default function JobInterviewSetupPage({ params }) {
  const { job_id } = use(params);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await api.get(`/jobs/${job_id}/`);
        setJob(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [job_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-8 pb-12">
      <Link
        href="/recruiter/interview"
        className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors font-bold text-xs uppercase tracking-widest group"
      >
        <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <HiOutlineCog6Tooth className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Interview Configuration</h1>
            {job && (
              <div className="flex items-center gap-2 mt-1.5">
                <HiOutlineBuildingOffice2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">{job.job_title}</span>
                {job.organization && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-sm text-muted-foreground">{job.organization}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {job && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
              <HiOutlineClock className="w-3.5 h-3.5" />
              {job.job_type || 'Full-time'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
              <HiOutlineVideoCamera className="w-3.5 h-3.5" />
              Live
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <SetupInterviewConfig job_id={job_id} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 sticky top-10">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <HiOutlineShieldCheck className="w-4 h-4 text-emerald-500" />
              Configuration Tips
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Set a clear interview title that candidates will recognize.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Adjust duration based on the role seniority and complexity.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Add specific instructions so candidates know what to expect.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Set link expiry to balance security with scheduling flexibility.
              </li>
            </ul>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs">
                <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground">Saved configuration applies to all future sessions for this job.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
