'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import {
  HiOutlineChartBar, HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineClipboardDocumentList, HiOutlineCheckBadge, HiOutlineBuildingOffice2,
} from 'react-icons/hi2';
import { BiTrendingUp } from 'react-icons/bi';
import ApexChart from '@/components/dashboard/ApexChart';
import ChartCard from '@/components/dashboard/ChartCard';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import OrgSubpageBanner, { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';
import OrgSubpageSkeleton from '@/components/organizations/OrgSubpageSkeleton';

const STATUS_HEX = {
  applied: '#3b82f6', in_progress: '#f59e0b', rejected: '#ef4444',
  offered: '#a855f7', hired: '#10b981',
};

const labelOf = (key) => {
  const text = key.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
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

  if (loading) return <OrgSubpageSkeleton stats={4} variant="charts" />;

  const ov = dashboard?.overview || {};
  const orgData = dashboard?.organization || {};
  const statusCounts = ov.applications_by_status || {};
  const stageCounts = ov.applications_by_stage || {};
  const statusEntries = Object.entries(statusCounts);
  const stageEntries = Object.entries(stageCounts);
  const statusTotal = statusEntries.reduce((sum, [, count]) => sum + count, 0);
  const applications = ov.total_applications ?? statusTotal;
  const hired = orgData.total_hired_count ?? 0;
  const hireRate = applications > 0 ? Math.round((hired / applications) * 100) : 0;
  const hasActivity = (ov.total_jobs || 0) > 0 || applications > 0;
  const industryBadge = orgData.industry ? { label: orgData.industry, icon: HiOutlineBuildingOffice2 } : undefined;

  if (error) {
    return (
      <div className={ORG_PAGE_CLASS}>
        <OrgSubpageBanner slug={slug} current="analytics" icon={HiOutlineChartBar} title="Hiring Analytics" subtitle="Analytics could not be loaded" />
        <FormError title="Analytics unavailable" message="We could not load your hiring data. Refresh the page to try again." />
      </div>
    );
  }

  return (
    <div className={ORG_PAGE_CLASS}>
      <OrgSubpageBanner
        slug={slug}
        current="analytics"
        icon={HiOutlineChartBar}
        badge={industryBadge}
        title="Hiring Analytics"
        subtitle={`${orgData.name || 'Your organization'} · ${applications} applications across ${ov.total_jobs ?? 0} jobs`}
        footer="Check which stages candidates drop out of, then improve the job posts that stall."
        emptyText="No hiring activity yet. Post a job to start tracking applications."
        stats={hasActivity ? [
          { label: 'Applications', value: applications, icon: HiOutlineDocumentText, hint: 'Applications received across all jobs' },
          { label: 'Hired', value: hired, icon: HiOutlineCheckBadge, hint: 'Candidates marked as hired' },
          { label: 'Hire rate', value: `${hireRate}%`, icon: BiTrendingUp, hint: 'Hires divided by applications' },
        ] : null}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total jobs" value={ov.total_jobs ?? 0} icon={HiOutlineBriefcase} tone="blue" />
        <StatCard label="Applications" value={applications} icon={HiOutlineDocumentText} tone="purple" delay={0.06} />
        <StatCard label="Hired" value={hired} icon={HiOutlineClipboardDocumentList} tone="emerald" delay={0.12} />
        <StatCard label="Active jobs" value={orgData.active_jobs_count ?? 0} icon={BiTrendingUp} tone="cyan" delay={0.18} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Applications by status" subtitle="Share of all applications" icon={HiOutlineChartBar}>
          {statusTotal > 0 ? (
            <div className="space-y-5">
              <ApexChart
                type="donut"
                height={240}
                series={statusEntries.map(([, count]) => count)}
                options={{
                  labels: statusEntries.map(([status]) => labelOf(status)),
                  colors: statusEntries.map(([status]) => STATUS_HEX[status] || '#64748b'),
                  legend: { show: false },
                  stroke: { colors: ['transparent'] },
                  plotOptions: { pie: { donut: { size: '68%' } } },
                }}
              />
              <ul className="space-y-2">
                {statusEntries.map(([status, count]) => {
                  const pct = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
                  return (
                    <li key={status} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_HEX[status] || '#64748b' }} aria-hidden="true" />
                        <span className="truncate font-semibold text-foreground">{labelOf(status)}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">{count} ({pct}%)</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <EmptyState icon={HiOutlineChartBar} title="No status data yet" text="Applications will be grouped by status here once candidates apply." />
          )}
        </ChartCard>

        <ChartCard title="Pipeline stages" subtitle="Applications at each stage" icon={HiOutlineClipboardDocumentList} delay={0.08}>
          {stageEntries.length > 0 && stageEntries.some(([, count]) => count > 0) ? (
            <ApexChart
              type="bar"
              height={Math.max(240, stageEntries.length * 36)}
              series={[{ name: 'Applications', data: stageEntries.map(([, count]) => count) }]}
              options={{
                colors: ['#10b981'],
                plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%' } },
                xaxis: { categories: stageEntries.map(([stage]) => labelOf(stage)), labels: { style: { fontSize: '11px' } } },
                yaxis: { labels: { maxWidth: 140, style: { fontSize: '11px' } } },
                dataLabels: { enabled: false },
              }}
            />
          ) : (
            <EmptyState icon={HiOutlineClipboardDocumentList} title="No pipeline data yet" text="Stage counts show up once applications move through your hiring process." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
