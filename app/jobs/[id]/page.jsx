'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineBuildingOffice2,
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineCpuChip,
  HiOutlineListBullet,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineXCircle,
  HiOutlineArrowUpTray,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineGlobeAlt
} from 'react-icons/hi2';

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
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchData();
  }, [jobId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading position details...</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-100 dark:bg-slate-950">
      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
        <HiOutlineXCircle className="w-10 h-10 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Position Not Found</h1>
      <Link href="/jobs" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
        Back to Opportunities
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      <div className="px-6 lg:px-12 xl:px-24 pt-24 lg:pt-28 pb-16">
        {/* Back + Apply header */}
        <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors group"
          >
            <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Link>
          <Link
            href={`/jobs/${jobId}/apply`}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2.5 active:scale-95"
          >
            <HiOutlineArrowUpTray className="w-4 h-4" />
            Apply Now
          </Link>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-sm font-semibold flex items-center gap-3">
                <HiOutlineXCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Title Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{job.job_title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{job.organization_details?.name || 'Unknown Organization'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-500 font-semibold text-xs">{job.department || 'General'}</span>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <HiOutlineMapPin className="w-4 h-4 text-emerald-500" />
                  {job.location || 'Remote / Anywhere'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <HiOutlineCurrencyDollar className="w-4 h-4 text-emerald-500" />
                  {job.salary_range || 'Competitive'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <HiOutlineClock className="w-4 h-4 text-emerald-500" />
                  {job.job_type || 'N/A'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <HiOutlineCalendarDays className="w-4 h-4 text-emerald-500" />
                  {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US') : 'Recently'}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Experience', val: job.experience_level || 'Not Specified', icon: HiOutlineAcademicCap, color: 'bg-emerald-500/10 text-emerald-500' },
                { label: 'Type', val: job.job_type, icon: HiOutlineClock, color: 'bg-blue-500/10 text-blue-500' },
                { label: 'Location', val: job.location || 'Remote', icon: HiOutlineMapPin, color: 'bg-purple-500/10 text-purple-500' },
                { label: 'Salary', val: job.salary_range || 'Competitive', icon: HiOutlineCurrencyDollar, color: 'bg-amber-500/10 text-amber-500' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-emerald-500/30 transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="font-bold text-sm mt-0.5 text-slate-800 dark:text-slate-200">{stat.val}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <HiOutlineListBullet className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Job Description</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium whitespace-pre-wrap">
                {job.job_description || 'No description provided.'}
              </div>
            </section>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <HiOutlineCpuChip className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Key Responsibilities</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {job.responsibilities.map((resp, i) => (
                    <div key={i} className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/20 transition-all group">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 mt-0.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{resp}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <HiOutlineShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Requirements</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <ul className="space-y-4">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 mt-0.5">
                          <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{req}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {job.organization_details?.logo_url ? (
                    <Image src={job.organization_details.logo_url} alt="" width={64} height={64} className="object-contain p-2" unoptimized />
                  ) : (
                    <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{job.organization_details?.name || 'Organization'}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Verified Organization</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <HiOutlineGlobeAlt className="w-3 h-3" />
                      {job.organization_details?.industry || 'Technology'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <HiOutlineUserGroup className="w-3 h-3" />
                      {job.organization_details?.team_size || '50-100'} members
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/jobs/${jobId}/apply`}
                className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <HiOutlineArrowUpTray className="w-4 h-4" />
                Apply Now
              </Link>
            </div>

            {job.interview_pipeline?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <HiOutlineListBullet className="w-4 h-4" />
                  Recruitment Roadmap
                </h4>
                <div className="space-y-6 relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                  {job.interview_pipeline.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                        <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{step.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
