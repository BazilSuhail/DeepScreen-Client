'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineChartBar, HiOutlineBriefcase, HiOutlineDocumentText,
   HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import { BiTrendingUp } from 'react-icons/bi';

const stageColors = {
  applied: 'border-l-blue-500', shortlisted: 'border-l-cyan-500',
  coding_pending: 'border-l-purple-500', coding_passed: 'border-l-purple-400',
  ai_interview_pending: 'border-l-amber-500', ai_interview_passed: 'border-l-amber-400',
  real_interview_scheduled: 'border-l-rose-500',
  offered: 'border-l-emerald-500', hired: 'border-l-emerald-600', rejected: 'border-l-red-500',
};

const statusColors = {
  applied: 'bg-blue-500', in_progress: 'bg-amber-500', rejected: 'bg-red-500',
  offered: 'bg-purple-500', hired: 'bg-emerald-500',
};

export default function OrgAnalyticsPage() {
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
          setDashboard({ organization: orgData, overview: {}, jobs: [] });
          setError(false);
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="space-y-4 px-12">
      <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
    </div>
  );

  if (error) return <div className="text-center py-20 text-destructive">Failed to load analytics</div>;

  const ov = dashboard?.overview || {};
  const orgData = dashboard?.organization || {};
  const total = Object.values(ov.applications_by_status || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Link href={`/organizations/${slug}`} className="hover:text-emerald-500 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Analytics</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground">Hiring Analytics</h1>
      <p className="text-muted-foreground mt-1">{orgData.name} &mdash; Overall hiring performance</p>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: ov.total_jobs, icon: HiOutlineBriefcase, color: 'from-blue-500/10 to-blue-600/5 text-blue-500' },
          { label: 'Applications', value: ov.total_applications, icon: HiOutlineDocumentText, color: 'from-purple-500/10 to-purple-600/5 text-purple-500' },
          { label: 'Hired', value: orgData.total_hired_count, icon: HiOutlineClipboardDocumentList, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
          { label: 'Active Jobs', value: orgData.active_jobs_count, icon: BiTrendingUp, color: 'from-cyan-500/10 to-cyan-600/5 text-cyan-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-[2rem] p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Applications by Status</h2>
          <div className="space-y-4">
            {Object.entries(ov.applications_by_status || {}).map(([status, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-foreground capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${statusColors[status] || 'bg-muted-foreground'}`} />
                  </div>
                </div>
              );
            })}
            {Object.keys(ov.applications_by_status || {}).length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No data yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-[2rem] p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Pipeline Stages</h2>
          <div className="space-y-3">
            {Object.entries(ov.applications_by_stage || {}).map(([stage, count]) => (
              <div key={stage} className={`pl-4 border-l-2 ${stageColors[stage] || 'border-l-muted-foreground'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground capitalize">{stage.replace(/_/g, ' ')}</span>
                  <span className="text-lg font-black text-foreground">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(ov.applications_by_stage || {}).length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No pipeline data yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
