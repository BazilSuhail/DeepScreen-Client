'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar,
  HiOutlineCommandLine, HiOutlineSpeakerWave, HiOutlineVideoCamera,
  HiOutlineCog6Tooth, HiOutlineBuildingOffice2,
  HiOutlineArrowRight, HiOutlineChevronRight, HiOutlinePlus,
  HiOutlineDocumentText, HiOutlineCalendar,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import Link from 'next/link';

const navLinks = [
  { label: 'Jobs', icon: HiOutlineBriefcase, path: 'jobs', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20' },
  { label: 'Assessments', icon: HiOutlineCommandLine, path: 'assesments', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20' },
  { label: 'AI Interviews', icon: HiOutlineSpeakerWave, path: 'ai-interviews', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' },
  { label: 'Live Interviews', icon: HiOutlineVideoCamera, path: 'interviews', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20' },
  { label: 'Analytics', icon: HiOutlineChartBar, path: 'analytics', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20' },
  { label: 'Team', icon: HiOutlineUsers, path: 'team', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' },
];

function Skeleton() {
  return (
    <div className="space-y-6 px-12">
      <div className="h-36 bg-muted rounded-[15px] animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-[15px] animate-pulse" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-64 bg-muted rounded-[15px] animate-pulse" />
        <div className="h-64 bg-muted rounded-[15px] animate-pulse" />
      </div>
    </div>
  );
}

export default function OrganizationDashboardPage() {
  const { slug } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const [dash, cfg] = await Promise.all([
          api.get(`/organizations/${slug}/dashboard/`).catch(() => null),
          api.get(`/organizations/${slug}/configs/`).catch(() => null),
        ]);
        if (!cancelled) {
          if (dash) { setDashboard(dash); setConfigs(cfg); }
          else {
            const orgData = await api.get(`/organizations/${slug}/`);
            setDashboard({ organization: orgData, overview: { total_jobs: 0, total_applications: 0, applications_by_status: {}, applications_by_stage: {} }, jobs: [] });
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Skeleton />;
  if (!dashboard) return <div className="text-center py-20 text-destructive">Failed to load organization</div>;

  const { organization: org, overview, jobs } = dashboard;
  const totalConfigs = (configs?.assessments?.length || 0) + (configs?.ai_interviews?.length || 0) + (configs?.interview_configs?.length || 0);

  return (
    <div className="space-y-8 px-8">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-[15px] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
          <div className="flex items-start gap-6 relative z-10">
          <div className="w-20 h-20 rounded-[15px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center text-emerald-500 shadow-lg border border-emerald-500/10 shrink-0">
            <HiOutlineBuildingOffice2 className="w-10 h-10" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground truncate">{org.name}</h1>
              {org.is_verified && (
                <span className="bg-emerald-500 text-white p-1 rounded-full shrink-0" title="Verified">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-muted-foreground">{org.industry}</span>
            </div>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">{org.description || 'No description.'}</p>
          </div>

        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: overview.total_jobs, icon: HiOutlineBriefcase, color: 'from-blue-500/10 to-blue-600/5 text-blue-500' },
          { label: 'Applications', value: overview.total_applications, icon: HiOutlineDocumentText, color: 'from-purple-500/10 to-purple-600/5 text-purple-500' },
          { label: 'Active Configs', value: totalConfigs, icon: HiOutlineCog6Tooth, color: 'from-amber-500/10 to-amber-600/5 text-amber-500' },
          { label: 'Hired', value: org.total_hired_count, icon: HiOutlineClipboardDocumentList, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-[15px] p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[15px] bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-6 gap-3">
        {navLinks.map((link, i) => (
          <motion.div key={link.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
            <Link href={`/organizations/${slug}/${link.path}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-[15px] bg-card border border-border ${link.color} transition-all group`}>
              <link.icon className="w-6 h-6" />
              <span className="text-[11px] font-bold text-center leading-tight">{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Jobs + Configs Sidebar */}
      <div className="grid grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Jobs</h2>
            <Link href={`/organizations/${slug}/jobs`}
              className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
              View All <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-card border border-border rounded-[15px] p-12 text-center">
              <HiOutlineBriefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No jobs yet.</p>
              <Link href={`/organizations/${slug}/jobs/create`}
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-[15px] transition-all text-sm">
                <HiOutlinePlus className="w-4 h-4" /> Create Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job, i) => (
                <motion.div key={job.job_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-[15px] p-5 hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">{job.job_title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : job.status === 'closed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {job.department && <span>{job.department}</span>}
                        {job.location && <span>&middot; {job.location}</span>}
                        {job.job_type && <span>&middot; {job.job_type}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-foreground">{job.applications_count}</div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Applicants</div>
                    </div>
                  </div>

                  {/* Pipeline summary */}
                  {job.interview_pipeline?.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      {job.interview_pipeline.map((stage, si) => (
                        <React.Fragment key={stage}>
                          <span className="px-2.5 py-1 rounded-[15px] bg-muted text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stage}</span>
                          {si < job.interview_pipeline.length - 1 && <HiOutlineChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Module linked indicators */}
                  <div className="flex gap-2 mt-3">
                    {job.assessment && <span className="flex items-center gap-1 px-2 py-1 rounded-[15px] bg-purple-500/10 text-purple-500 text-[10px] font-semibold"><HiOutlineCommandLine className="w-3 h-3" /> Assessment</span>}
                    {job.ai_interviews?.length > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-[15px] bg-amber-500/10 text-amber-500 text-[10px] font-semibold"><HiOutlineSpeakerWave className="w-3 h-3" /> AI</span>}
                    {job.interview_config && <span className="flex items-center gap-1 px-2 py-1 rounded-[15px] bg-rose-500/10 text-rose-500 text-[10px] font-semibold"><HiOutlineVideoCamera className="w-3 h-3" /> Live</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Configs & Stats Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Configurations</h2>

          {!configs ? (
            <div className="bg-card border border-border rounded-[15px] p-6 text-center">
              <HiOutlineCog6Tooth className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Loading configs...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Assessments', count: configs.assessments?.length || 0, icon: HiOutlineCommandLine, path: 'assesments', color: 'text-purple-500 bg-purple-500/10' },
                { label: 'AI Interviews', count: configs.ai_interviews?.length || 0, icon: HiOutlineSpeakerWave, path: 'ai-interviews', color: 'text-amber-500 bg-amber-500/10' },
                { label: 'Interview Configs', count: configs.interview_configs?.length || 0, icon: HiOutlineVideoCamera, path: 'interviews', color: 'text-rose-500 bg-rose-500/10' },
              ].map((cfg) => (
                <Link key={cfg.label} href={`/organizations/${slug}/${cfg.path}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-[15px] hover:border-emerald-500/20 transition-all group">
                  <div className={`w-10 h-10 rounded-[15px] ${cfg.color} flex items-center justify-center shrink-0`}>
                    <cfg.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">{cfg.label}</div>
                    <div className="text-xs text-muted-foreground">{cfg.count} {cfg.count === 1 ? 'config' : 'configs'}</div>
                  </div>
                  <HiOutlineChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Owner info */}
          <div className="bg-card border border-border rounded-[15px] p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Organization Owner</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradiente-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {org.owner?.email?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground truncate">{org.owner?.email?.split('@')[0] || 'Owner'}</div>
                <div className="text-xs text-muted-foreground">{org.owner?.email || ''}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><HiOutlineUsers className="w-3.5 h-3.5" /> {org.members_count} members</span>
              <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" /> {new Date(org.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
