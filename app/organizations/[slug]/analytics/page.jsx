'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineChartBar, HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineChartPie,
  HiOutlineClipboardDocumentList, HiOutlineCheckBadge, HiOutlineArrowTrendingUp, HiOutlineFunnel,
} from 'react-icons/hi2';
import ApexChart from '@/components/dashboard/ApexChart';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { cardPadded } from '@/components/ui/styles';
import { ORG_PAGE, OrgSubpageHeader, SectionHeading, StatTile, industryBadge, itemMotion } from '@/components/organizations/orgUi';
import OrgAnalyticsSkeleton from '@/components/skeletons/organizations/OrgAnalyticsSkeleton';

// Palette only: emerald/teal/amber, red reserved for rejections.
const STATUS_HEX = {
  applied: '#14b8a6', in_progress: '#f59e0b', rejected: '#ef4444',
  offered: '#2dd4bf', hired: '#10b981',
};
const FALLBACK_HEX = '#94a3b8';

const labelOf = (key) => {
  const text = key.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function ChartPanel({ i, icon, title, helper, children }) {
  return (
    <motion.section {...itemMotion(i)} className={`${cardPadded} min-w-0 space-y-5`}>
      <SectionHeading icon={icon} title={title} helper={helper} />
      {children}
    </motion.section>
  );
}

export default function OrgAnalyticsPage() {
  const { slug } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

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
  }, [slug, attempt]);

  if (loading) return <OrgAnalyticsSkeleton />;

  if (error) {
    return (
      <div className={ORG_PAGE}>
        <OrgSubpageHeader slug={slug} current="analytics" title="Hiring analytics" />
        <ErrorState title="Analytics unavailable" message="We could not load your hiring data." onRetry={() => { setLoading(true); setError(false); setAttempt((n) => n + 1); }} />
      </div>
    );
  }

  const ov = dashboard?.overview || {};
  const orgData = dashboard?.organization || {};
  const statusEntries = Object.entries(ov.applications_by_status || {});
  const stageEntries = Object.entries(ov.applications_by_stage || {});
  const statusTotal = statusEntries.reduce((sum, [, count]) => sum + count, 0);
  const applications = ov.total_applications ?? statusTotal;
  const hired = orgData.total_hired_count ?? 0;
  const hireRate = applications > 0 ? Math.round((hired / applications) * 100) : 0;
  const hasActivity = (ov.total_jobs || 0) > 0 || applications > 0;
  const hasStages = stageEntries.some(([, count]) => count > 0);
  const colorOf = (status) => STATUS_HEX[status] || FALLBACK_HEX;

  return (
    <div className={ORG_PAGE}>
      <OrgSubpageHeader
        slug={slug}
        current="analytics"
        title="Hiring analytics"
        description={`${orgData.name ? `${orgData.name} · ` : ''}${applications} applications across ${ov.total_jobs ?? 0} jobs. Check which stages candidates drop out of, then improve the job posts that stall.`}
        meta={industryBadge(orgData.industry)}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatTile i={0} label="Total jobs" value={ov.total_jobs ?? 0} icon={HiOutlineBriefcase} hint="All postings" />
        <StatTile i={1} label="Active jobs" value={orgData.active_jobs_count ?? 0} icon={HiOutlineArrowTrendingUp} tone="teal" hint="Accepting applications" />
        <StatTile i={2} label="Applications" value={applications} icon={HiOutlineDocumentText} tone="teal" hint="Received across all jobs" />
        <StatTile i={3} label="Hired" value={hired} icon={HiOutlineCheckBadge} hint="Candidates marked as hired" />
        <StatTile i={4} label="Hire rate" value={`${hireRate}%`} icon={HiOutlineChartBar} tone="amber" hint="Hires divided by applications" />
      </div>

      {!hasActivity ? (
        <EmptyState icon={HiOutlineChartBar} title="No hiring activity yet" text="Post a job to start tracking applications." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          <ChartPanel i={0} icon={HiOutlineChartPie} title="Applications by status" helper="Share of all applications">
            {statusTotal > 0 ? (
              <ApexChart
                type="donut"
                height={260}
                series={statusEntries.map(([, count]) => count)}
                options={{
                  labels: statusEntries.map(([status]) => labelOf(status)),
                  colors: statusEntries.map(([status]) => colorOf(status)),
                  legend: { show: false },
                  stroke: { colors: ['transparent'] },
                  plotOptions: { pie: { donut: { size: '68%' } } },
                }}
              />
            ) : (
              <EmptyState icon={HiOutlineChartPie} title="No status data yet" text="Applications will be grouped by status here once candidates apply." />
            )}
          </ChartPanel>

          <ChartPanel i={1} icon={HiOutlineClipboardDocumentList} title="Status breakdown" helper="Count and share per status">
            {statusTotal > 0 ? (
              <ul className="space-y-4">
                {statusEntries.map(([status, count]) => {
                  const pct = Math.round((count / statusTotal) * 100);
                  return (
                    <li key={status} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorOf(status) }} aria-hidden="true" />
                          <span className="truncate font-medium">{labelOf(status)}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{count} · {pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: colorOf(status) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={HiOutlineClipboardDocumentList} title="Nothing to break down yet" text="Status counts appear once candidates apply." />
            )}
          </ChartPanel>

          <ChartPanel i={2} icon={HiOutlineFunnel} title="Pipeline stages" helper="Applications at each stage">
            {hasStages ? (
              <ApexChart
                type="bar"
                height={Math.max(260, stageEntries.length * 36)}
                series={[{ name: 'Applications', data: stageEntries.map(([, count]) => count) }]}
                options={{
                  colors: ['#10b981'],
                  plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
                  xaxis: { categories: stageEntries.map(([stage]) => labelOf(stage)), labels: { style: { fontSize: '11px' } } },
                  yaxis: { labels: { maxWidth: 140, style: { fontSize: '11px' } } },
                  dataLabels: { enabled: false },
                }}
              />
            ) : (
              <EmptyState icon={HiOutlineFunnel} title="No pipeline data yet" text="Stage counts show up once applications move through your hiring process." />
            )}
          </ChartPanel>
        </div>
      )}
    </div>
  );
}
