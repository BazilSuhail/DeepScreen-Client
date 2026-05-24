'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineUsers, HiOutlineBriefcase,
  HiOutlineCommandLine, HiOutlineSpeakerWave, HiOutlineVideoCamera,
  HiOutlineArrowRight, HiOutlineChevronRight, HiOutlinePlus,
  HiOutlineDocumentText, HiOutlineCalendarDays, HiOutlineClipboardDocumentList,
  HiOutlineMapPin, HiOutlineTag, HiOutlineCheckBadge, HiOutlineGlobeAlt,
  HiOutlineEnvelope, HiOutlineInformationCircle, HiOutlinePencilSquare, HiOutlineUserCircle,
  HiOutlineBuildingOffice2, HiOutlineSparkles, HiOutlineXMark, HiOutlineLightBulb, HiOutlineSquares2X2,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import PageHeader from '@/components/ui/PageHeader';
import OrgEditForm from '@/components/organizations/OrgEditForm';
import { ORG_PAGE, ORG_SECTIONS, TONES, Chip, SectionHeading, StatTile, itemMotion } from '@/components/organizations/orgUi';
import { cardInteractive, cardPadded, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';
import OrganizationOverviewSkeleton from '@/components/skeletons/organizations/OrganizationOverviewSkeleton';

const bannerActionClass = 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500 dark:border-white dark:bg-white dark:text-emerald-900 dark:hover:bg-emerald-50';
const bannerGhostClass = 'border-emerald-200 bg-transparent text-emerald-800 hover:bg-emerald-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10';
const BANNER_LINKS = ['jobs', 'team', 'analytics'];

const today = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const STATUS_TONE = { open: 'emerald', closed: 'red' };

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${iconTile} h-8 w-8 bg-muted text-muted-foreground`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{children || <span className="font-normal text-muted-foreground">—</span>}</p>
      </div>
    </div>
  );
}

function BannerFact({ icon: Icon, title, children }) {
  return (
    <div title={title} className="flex min-w-0 items-center gap-2 text-xs text-emerald-900 dark:text-slate-200">
      <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
      <span className="truncate">{children || '—'}</span>
    </div>
  );
}

function JobRow({ job }) {
  return (
    <li className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-sm font-semibold">{job.job_title}</h3>
            <Chip tone={STATUS_TONE[job.status] || 'muted'}><span className="capitalize">{job.status}</span></Chip>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {job.department && <span className="flex items-center gap-1"><HiOutlineBuildingOffice2 className="h-3.5 w-3.5" aria-hidden="true" />{job.department}</span>}
            {job.location && <span className="flex items-center gap-1"><HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" />{job.location}</span>}
            {job.job_type && <span className="flex items-center gap-1"><HiOutlineTag className="h-3.5 w-3.5" aria-hidden="true" />{job.job_type}</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 text-base font-semibold tabular-nums">
            <HiOutlineUsers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{job.applications_count ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Applicants</p>
        </div>
      </div>

      {(job.interview_pipeline?.length > 0 || job.assessment || job.ai_interviews?.length > 0 || job.interview_config) && (
        <div className="flex flex-wrap items-center gap-2">
          {job.interview_pipeline?.map((stage, si) => (
            <React.Fragment key={stage}>
              <Chip>{stage}</Chip>
              {si < job.interview_pipeline.length - 1 && <HiOutlineChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" />}
            </React.Fragment>
          ))}
          {job.interview_pipeline?.length > 0 && (job.assessment || job.ai_interviews?.length > 0 || job.interview_config) && (
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          )}
          {job.assessment && <Chip tone="teal" icon={HiOutlineCommandLine}>Assessment</Chip>}
          {job.ai_interviews?.length > 0 && <Chip tone="amber" icon={HiOutlineSpeakerWave}>AI interview</Chip>}
          {job.interview_config && <Chip tone="emerald" icon={HiOutlineVideoCamera}>Live interview</Chip>}
        </div>
      )}
    </li>
  );
}

export default function OrganizationDashboardPage() {
  const { slug } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { user } = useAuth();
  // Jobs are created from the recruiter workspace; staff can only view them here.
  const canCreate = user?.role === 'RECRUITER';

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
  }, [slug, attempt]);

  if (loading) return <OrganizationOverviewSkeleton />;
  if (!dashboard) {
    return (
      <div className={ORG_PAGE}>
        <PageHeader back={{ href: '/organizations', label: 'Organizations' }} icon={HiOutlineBuildingOffice2} eyebrow="Organization" title="Organization unavailable" />
        <ErrorState
          title="Failed to load organization"
          message="Check your connection and try again."
          onRetry={() => { setLoading(true); setAttempt((n) => n + 1); }}
        />
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

  const actions = BANNER_LINKS.map((key, i) => {
    const s = ORG_SECTIONS.find((x) => x.key === key);
    return { label: s.label, href: `/organizations/${slug}/${s.key}`, icon: s.icon, hint: s.hint, className: i === 0 ? bannerActionClass : bannerGhostClass };
  });

  const footer = (
    <span className="flex items-start gap-2">
      <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
      {(org.active_jobs_count ?? 0) === 0 ? (
        canCreate ? (
          <span>
            Next: <Link href="/recruiter/jobs/create" className="font-semibold text-emerald-950 underline underline-offset-4 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-300">post your first job</Link>
          </span>
        ) : (
          <span>Recruiters in your organization post jobs here.</span>
        )
      ) : (
        <span>
          {overview.total_applications > 0
            ? `${overview.total_applications} applications across your jobs. Review them in Jobs.`
            : 'Tip: add an assessment or AI interview to your jobs to screen candidates.'}
        </span>
      )}
    </span>
  );

  const orgCard = (
    <div className="w-full min-w-0 space-y-3 rounded-lg border border-emerald-200 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:w-72">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80 dark:text-slate-400">Organization</p>
        {org.is_verified && (
          <span title="This organization has been verified" className="inline-flex items-center gap-1 rounded-sm bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            <HiOutlineCheckBadge className="h-3.5 w-3.5" aria-hidden="true" /> Verified
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <BannerFact icon={HiOutlineTag} title="Industry">{org.industry}</BannerFact>
        <BannerFact icon={HiOutlineUsers} title="Company size">{org.company_size && `${org.company_size} people`}</BannerFact>
        <BannerFact icon={HiOutlineMapPin} title="Location">{org.location}</BannerFact>
        <BannerFact icon={HiOutlineCalendarDays} title="Founded">{org.founded_year && `Founded ${org.founded_year}`}</BannerFact>
      </div>
    </div>
  );

  // Workspace tiles: one per section, with the count each one holds when known.
  const sectionCount = {
    jobs: overview.total_jobs,
    assesments: configs?.assessments?.length,
    'ai-interviews': configs?.ai_interviews?.length,
    interviews: configs?.interview_configs?.length,
    team: org.members_count,
  };
  const sectionUnit = { jobs: 'jobs', assesments: 'configs', 'ai-interviews': 'configs', interviews: 'configs', team: 'members' };

  return (
    <div className={`${ORG_PAGE} lg:space-y-8`}>
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
        <OrgEditForm key={org.slug} org={org} slug={slug} onSaved={handleSaved} onCancel={() => setEditing(false)} />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile i={0} label="Active jobs" value={org.active_jobs_count ?? 0} icon={HiOutlineBriefcase} hint={`${overview.total_jobs ?? 0} total jobs`} />
        <StatTile i={1} label="Applications" value={overview.total_applications ?? 0} icon={HiOutlineDocumentText} tone="teal" hint="Across all jobs" />
        <StatTile i={2} label="Hired" value={org.total_hired_count ?? 0} icon={HiOutlineClipboardDocumentList} hint="Candidates hired" />
        <StatTile i={3} label="Members" value={org.members_count ?? 0} icon={HiOutlineUsers} tone="amber" hint="People on the team" />
      </div>

      <section aria-labelledby="workspace-heading" className="space-y-4">
        <SectionHeading
          id="workspace-heading"
          icon={HiOutlineSquares2X2}
          title="Workspace"
          helper={configs ? `${totalConfigs} ${totalConfigs === 1 ? 'configuration' : 'configurations'} in total` : 'Everything this organization runs'}
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {ORG_SECTIONS.map((s, i) => {
            const n = sectionCount[s.key];
            return (
              <motion.li key={s.key} {...itemMotion(i)}>
                <Link href={`/organizations/${slug}/${s.key}`} title={s.hint} className={`group flex h-full flex-col gap-3 p-4 ${cardInteractive}`}>
                  <span className={`${iconTile} h-10 w-10 ${TONES[s.tone]}`}>
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{s.label}</span>
                  <span className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    {s.key === 'analytics' ? 'View charts' : typeof n === 'number' ? `${n} ${sectionUnit[s.key]}` : '—'}
                    <HiOutlineArrowRight className="h-3.5 w-3.5 shrink-0 transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-labelledby="recent-jobs-heading" className={`${cardPadded} min-w-0 space-y-5 lg:col-span-8 2xl:col-span-9`}>
          <SectionHeading
            id="recent-jobs-heading"
            icon={HiOutlineBriefcase}
            title="Recent jobs"
            helper="The latest five postings"
            action={
              <Link href={`/organizations/${slug}/jobs`} className="flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                View all <HiOutlineArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />
          {jobs.length === 0 ? (
            <EmptyState
              icon={HiOutlineBriefcase}
              title="No jobs yet"
              text={canCreate ? 'Post your first job to start receiving applicants.' : 'Recruiters in your organization post jobs here.'}
              action={canCreate && (
                <Link href="/recruiter/jobs/create" title="Create a new job posting" className={primaryButton}>
                  <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create job
                </Link>
              )}
            />
          ) : (
            <ul className="divide-y divide-border">
              {jobs.slice(0, 5).map((job) => <JobRow key={job.job_id} job={job} />)}
            </ul>
          )}
        </section>

        <div className="space-y-6 lg:col-span-4 2xl:col-span-3">
          <section aria-labelledby="about-heading" className={`${cardPadded} space-y-4`}>
            <SectionHeading
              id="about-heading"
              icon={HiOutlineInformationCircle}
              title="About"
              helper="Public details"
              action={
                <button
                  type="button"
                  onClick={() => setEditing((v) => !v)}
                  title={editing ? 'Close the edit panel' : 'Edit the public details of this organization'}
                  aria-expanded={editing}
                  className={`${secondaryButton} min-h-10 px-3 py-1.5 text-xs`}
                >
                  {editing ? <HiOutlineXMark className="h-3.5 w-3.5" aria-hidden="true" /> : <HiOutlinePencilSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                  {editing ? 'Close' : 'Edit'}
                </button>
              }
            />
            <p className="text-sm leading-relaxed text-muted-foreground">{org.description || '—'}</p>
            <div className="space-y-3 border-t border-border pt-4">
              <DetailRow icon={HiOutlineSparkles} label="Tagline">{org.tagline}</DetailRow>
              <DetailRow icon={HiOutlineGlobeAlt} label="Website">{org.website_url}</DetailRow>
              <DetailRow icon={HiOutlineEnvelope} label="Contact">{org.contact_email}</DetailRow>
            </div>
          </section>

          <section aria-labelledby="owner-heading" className={`${cardPadded} space-y-4`}>
            <SectionHeading id="owner-heading" icon={HiOutlineUserCircle} title="Owner" helper="Who manages this organization" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {org.owner?.email?.[0]?.toUpperCase() || <HiOutlineUserCircle className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{org.owner?.email?.split('@')[0] || '—'}</p>
                {org.owner?.email && <p className="truncate text-xs text-muted-foreground">{org.owner.email}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><HiOutlineUsers className="h-3.5 w-3.5" aria-hidden="true" /> {org.members_count ?? 0} members</span>
              <span className="flex items-center gap-1" title="Created"><HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {org.created_at ? new Date(org.created_at).toLocaleDateString() : '—'}</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
