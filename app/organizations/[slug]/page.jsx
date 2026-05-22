'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar,
  HiOutlineCommandLine, HiOutlineSpeakerWave, HiOutlineVideoCamera,
  HiOutlineCog6Tooth, HiOutlineArrowRight, HiOutlineChevronRight, HiOutlinePlus,
  HiOutlineDocumentText, HiOutlineCalendarDays, HiOutlineClipboardDocumentList,
  HiOutlineMapPin, HiOutlineTag, HiOutlineCheckBadge, HiOutlineGlobeAlt,
  HiOutlineEnvelope, HiOutlineInformationCircle, HiOutlinePencilSquare, HiOutlineUserCircle,
  HiOutlineBuildingOffice2, HiOutlineSparkles, HiOutlineXMark, HiOutlineLightBulb,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import ChartCard from '@/components/dashboard/ChartCard';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import OrgEditForm from '@/components/organizations/OrgEditForm';

const sectionLinks = [
  { label: 'Jobs', icon: HiOutlineBriefcase, path: 'jobs', tone: 'text-blue-500 bg-blue-500/10', hint: 'Manage job postings' },
  { label: 'Assessments', icon: HiOutlineCommandLine, path: 'assesments', tone: 'text-purple-500 bg-purple-500/10', hint: 'Build and review assessments' },
  { label: 'AI Interviews', icon: HiOutlineSpeakerWave, path: 'ai-interviews', tone: 'text-amber-500 bg-amber-500/10', hint: 'Configure AI interview rounds' },
  { label: 'Live Interviews', icon: HiOutlineVideoCamera, path: 'interviews', tone: 'text-rose-500 bg-rose-500/10', hint: 'Set up live interviews' },
  { label: 'Analytics', icon: HiOutlineChartBar, path: 'analytics', tone: 'text-cyan-500 bg-cyan-500/10', hint: 'See hiring performance' },
  { label: 'Team', icon: HiOutlineUsers, path: 'team', tone: 'text-emerald-500 bg-emerald-500/10', hint: 'Invite and manage members' },
];

const bannerActionClass = 'border-neutral-200 bg-white text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/20';

const today = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const formatSize = (size) => (size ? `${size} people` : 'Not specified');

function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />;
}

function Skeleton() {
  return (
    <output aria-busy="true" className="block mx-auto w-full max-w-7xl min-w-0 space-y-10 px-4 pb-20 md:px-8">
      <span className="sr-only">Loading organization...</span>

      {/* Banner */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 md:p-6 dark:border-transparent dark:bg-emerald-dark">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10" />
              <div className="h-8 w-2/3 animate-pulse rounded-md bg-neutral-200 dark:bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded-md bg-neutral-200 dark:bg-white/10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-white/10" />
              ))}
            </div>
          </div>
          <div className="w-full space-y-3 rounded-2xl border border-neutral-200 bg-neutral-100 p-4 dark:border-white/10 dark:bg-white/5 lg:w-72">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full space-y-3">
                <Bar className="h-3 w-1/3" />
                <Bar className="h-9 w-1/2" />
              </div>
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-secondary/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 lg:col-span-2 lg:p-6">
          <Bar className="h-5 w-40" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
              <div className="w-full space-y-2">
                <Bar className="h-3 w-3/4" />
                <Bar className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
          <Bar className="h-5 w-32" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-secondary/60" />
          ))}
        </div>
      </div>
    </output>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{children}</p>
      </div>
    </div>
  );
}

export default function OrganizationDashboardPage() {
  const { slug } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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
  if (!dashboard) {
    return (
      <div role="alert" className="mx-auto max-w-md px-4 py-20 text-center">
        <HiOutlineInformationCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Failed to load organization</p>
        <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
      </div>
    );
  }

  const { organization: org, overview, jobs = [] } = dashboard;
  const totalConfigs = (configs?.assessments?.length || 0) + (configs?.ai_interviews?.length || 0) + (configs?.interview_configs?.length || 0);

  // Save from the edit panel: merge the new fields into the on-screen organization and close the panel.
  const handleSaved = (updated) => {
    setDashboard((d) => ({ ...d, organization: { ...d.organization, ...updated, slug: d.organization.slug } }));
    setEditing(false);
  };

  const actions = sectionLinks.map((l) => ({
    label: l.label,
    href: `/organizations/${slug}/${l.path}`,
    icon: l.icon,
    hint: l.hint,
    className: bannerActionClass,
  }));

  const footer = (org.active_jobs_count ?? 0) === 0 ? (
    <span className="flex items-start gap-2">
      <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
      <span>
        Next: <Link href={`/organizations/${slug}/jobs/create`} className="font-semibold text-neutral-900 underline underline-offset-4 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-300">post your first job</Link>
      </span>
    </span>
  ) : (
    <span className="flex items-start gap-2">
      <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
      <span>
        {overview.total_applications > 0
          ? `${overview.total_applications} applications across your jobs. Review them in Jobs.`
          : 'Tip: add an assessment or AI interview to your jobs to screen candidates.'}
      </span>
    </span>
  );

  const orgCard = (
    <div className="w-full min-w-0 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-100 p-4 dark:border-white/10 dark:bg-white/5 backdrop-blur-sm lg:w-72">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 dark:text-slate-400">Organization</p>
        {org.is_verified && (
          <span title="This organization has been verified" className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            <HiOutlineCheckBadge className="h-3.5 w-3.5" aria-hidden="true" /> Verified
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div title="Industry" className="flex min-w-0 items-center gap-2 text-xs text-neutral-700 dark:text-slate-200">
          <HiOutlineTag className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          <span className="truncate">{org.industry || 'No industry'}</span>
        </div>
        <div title="Company size" className="flex min-w-0 items-center gap-2 text-xs text-neutral-700 dark:text-slate-200">
          <HiOutlineUsers className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          <span className="truncate">{formatSize(org.company_size)}</span>
        </div>
        <div title="Location" className="flex min-w-0 items-center gap-2 text-xs text-neutral-700 dark:text-slate-200">
          <HiOutlineMapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          <span className="truncate">{org.location || 'No location'}</span>
        </div>
        <div title="Founded" className="flex min-w-0 items-center gap-2 text-xs text-neutral-700 dark:text-slate-200">
          <HiOutlineCalendarDays className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          <span className="truncate">{org.founded_year ? `Founded ${org.founded_year}` : 'Founded: n/a'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-10 px-4 pb-20 md:px-8">
      <DashboardBanner
        date={today()}
        icon={HiOutlineBuildingOffice2}
        badge={{ label: org.industry || 'Organization', icon: HiOutlineTag }}
        title={org.name}
        subtitle={org.tagline || org.location || null}
        actions={actions}
        footer={footer}
        aside={orgCard}
      />

      {editing && (
        <OrgEditForm
          key={org.slug}
          org={org}
          slug={slug}
          onSaved={handleSaved}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={org.active_jobs_count ?? 0} icon={HiOutlineBriefcase} tone="blue"
          hint={`${overview.total_jobs} total jobs`} delay={0} />
        <StatCard label="Applications" value={overview.total_applications} icon={HiOutlineDocumentText} tone="purple"
          hint="Across all jobs" delay={0.06} />
        <StatCard label="Hired" value={org.total_hired_count ?? 0} icon={HiOutlineClipboardDocumentList} tone="emerald"
          hint="Candidates hired" delay={0.12} />
        <StatCard label="Members" value={org.members_count ?? 0} icon={HiOutlineUsers} tone="cyan"
          hint="People on the team" delay={0.18} />
      </div>

      {/* Quick sections */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sectionLinks.map((link) => (
          <Link
            key={link.label}
            href={`/organizations/${slug}/${link.path}`}
            title={link.hint}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-emerald-500/30"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.tone}`}>
              <link.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-center text-xs font-semibold leading-tight text-foreground group-hover:text-emerald-500">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent jobs */}
        <ChartCard
          className="lg:col-span-2"
          title="Recent jobs"
          subtitle="The latest five postings"
          icon={HiOutlineBriefcase}
          action={
            <Link href={`/organizations/${slug}/jobs`} className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400">
              View all <HiOutlineArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          }
        >
          {jobs.length === 0 ? (
            <EmptyState
              icon={HiOutlineBriefcase}
              title="No jobs yet"
              text="Post your first job to start receiving applicants."
              action={
                <Link
                  href={`/organizations/${slug}/jobs/create`}
                  title="Create a new job posting"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                >
                  <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create job
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.job_id} className="group rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-emerald-500/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-emerald-500">{job.job_title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : job.status === 'closed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {job.department && <span className="flex items-center gap-1"><HiOutlineBuildingOffice2 className="h-3.5 w-3.5" aria-hidden="true" />{job.department}</span>}
                        {job.location && <span className="flex items-center gap-1"><HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" />{job.location}</span>}
                        {job.job_type && <span className="flex items-center gap-1"><HiOutlineTag className="h-3.5 w-3.5" aria-hidden="true" />{job.job_type}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1 text-base font-semibold tabular-nums text-foreground">
                        <HiOutlineUsers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{job.applications_count}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Applicants</div>
                    </div>
                  </div>

                  {job.interview_pipeline?.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      {job.interview_pipeline.map((stage, si) => (
                        <React.Fragment key={stage}>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stage}</span>
                          {si < job.interview_pipeline.length - 1 && <HiOutlineChevronRight className="h-3 w-3 text-muted-foreground/40" aria-hidden="true" />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.assessment && <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-semibold text-purple-500"><HiOutlineCommandLine className="h-3 w-3" aria-hidden="true" /> Assessment</span>}
                    {job.ai_interviews?.length > 0 && <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-500"><HiOutlineSpeakerWave className="h-3 w-3" aria-hidden="true" /> AI interview</span>}
                    {job.interview_config && <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-500"><HiOutlineVideoCamera className="h-3 w-3" aria-hidden="true" /> Live interview</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Sidebar */}
        <div className="space-y-6">
          <ChartCard
            title="About"
            subtitle="Public details"
            icon={HiOutlineInformationCircle}
            action={
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                title={editing ? 'Close the edit panel' : 'Edit the public details of this organization'}
                aria-expanded={editing}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-emerald-500/40 hover:text-emerald-500"
              >
                {editing ? <HiOutlineXMark className="h-3.5 w-3.5" aria-hidden="true" /> : <HiOutlinePencilSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                {editing ? 'Close' : 'Edit details'}
              </button>
            }
          >
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{org.description || 'No description yet.'}</p>
              <div className="space-y-3 border-t border-border pt-4">
                <DetailRow icon={HiOutlineSparkles} label="Tagline">{org.tagline || 'Not set'}</DetailRow>
                <DetailRow icon={HiOutlineGlobeAlt} label="Website">{org.website_url || 'Not set'}</DetailRow>
                <DetailRow icon={HiOutlineEnvelope} label="Contact">{org.contact_email || 'Not set'}</DetailRow>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Configurations" subtitle={`${totalConfigs} in total`} icon={HiOutlineCog6Tooth}>
            {!configs ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                <HiOutlineCog6Tooth className="h-5 w-5 shrink-0 opacity-50" aria-hidden="true" /> Loading configs...
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { label: 'Assessments', count: configs.assessments?.length || 0, icon: HiOutlineCommandLine, path: 'assesments', tone: 'text-purple-500 bg-purple-500/10' },
                  { label: 'AI Interviews', count: configs.ai_interviews?.length || 0, icon: HiOutlineSpeakerWave, path: 'ai-interviews', tone: 'text-amber-500 bg-amber-500/10' },
                  { label: 'Interview Configs', count: configs.interview_configs?.length || 0, icon: HiOutlineVideoCamera, path: 'interviews', tone: 'text-rose-500 bg-rose-500/10' },
                ].map((cfg) => (
                  <Link key={cfg.label} href={`/organizations/${slug}/${cfg.path}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-emerald-500/30">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.tone}`}>
                      <cfg.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground group-hover:text-emerald-500">{cfg.label}</div>
                      <div className="text-xs text-muted-foreground">{cfg.count} {cfg.count === 1 ? 'config' : 'configs'}</div>
                    </div>
                    <HiOutlineChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Owner" subtitle="Who manages this organization" icon={HiOutlineUserCircle}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {org.owner?.email?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{org.owner?.email?.split('@')[0] || 'Owner'}</div>
                <div className="truncate text-xs text-muted-foreground">{org.owner?.email || ''}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><HiOutlineUsers className="h-3.5 w-3.5" aria-hidden="true" /> {org.members_count ?? 0} members</span>
              <span className="flex items-center gap-1"><HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'n/a'}</span>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
