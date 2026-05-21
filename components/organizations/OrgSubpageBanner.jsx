'use client';

import { HiOutlineBuildingOffice2, HiOutlineBriefcase, HiOutlineCommandLine, HiOutlineSpeakerWave, HiOutlineVideoCamera, HiOutlineChartBar, HiOutlineUsers } from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';

// Shared page wrapper for organization subpages: phone-first, 16px side gutter.
export const ORG_PAGE_CLASS = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-12 pt-2 md:px-6 lg:px-8';

export const ORG_SECTIONS = [
  { key: 'jobs', label: 'Jobs', icon: HiOutlineBriefcase, hint: 'Open job postings and applicant counts' },
  { key: 'assesments', label: 'Assessments', icon: HiOutlineCommandLine, hint: 'Coding assessments you give candidates' },
  { key: 'ai-interviews', label: 'AI Interviews', icon: HiOutlineSpeakerWave, hint: 'AI-led interviews that score answers automatically' },
  { key: 'interviews', label: 'Live Interviews', icon: HiOutlineVideoCamera, hint: 'Camera, microphone and screen rules for live interviews' },
  { key: 'analytics', label: 'Analytics', icon: HiOutlineChartBar, hint: 'Hiring totals, status and pipeline charts' },
  { key: 'team', label: 'Team', icon: HiOutlineUsers, hint: 'Invite recruiters and review team access' },
];

const OVERVIEW_HINT = 'Back to the organization overview';

const todayLabel = () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

// Banner for an org subpage.
// `stats` is [{ label, value, icon, hint }]; pass null to show `emptyText` instead.
// Actions: Overview plus the next two subpages in nav order, so each page links to the others.
// Optional: `icon` beside the title, `badge` ({ label, icon }) above it (defaults to today's date), `footer` node under the actions.
export default function OrgSubpageBanner({
  slug,
  current,
  title,
  subtitle,
  icon,
  badge,
  footer,
  stats = null,
  emptyText = 'No data yet.',
}) {
  const others = ORG_SECTIONS.filter((s) => s.key !== current).slice(0, 2);
  const actions = [
    { label: 'Overview', href: `/organizations/${slug}`, icon: HiOutlineBuildingOffice2, hint: OVERVIEW_HINT, className: 'border-white/15 bg-white/10 text-white hover:bg-white/20' },
    ...others.map((s) => ({
      label: s.label,
      href: `/organizations/${slug}/${s.key}`,
      icon: s.icon,
      hint: s.hint,
      className: 'border-white/15 bg-white/10 text-white hover:bg-white/20',
    })),
  ];

  const aside = (
    <div className="w-full min-w-0 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:w-72">
      {stats?.length ? stats.map((s) => {
        const StatIcon = s.icon;
        return (
          <div key={s.label} title={s.hint} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <StatIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-slate-300">{s.label}</span>
            <span className="shrink-0 text-lg font-semibold tabular-nums">{s.value}</span>
          </div>
        );
      }) : (
        <p className="py-2 text-sm leading-relaxed text-slate-300">{emptyText}</p>
      )}
    </div>
  );

  return (
    <DashboardBanner
      icon={icon}
      badge={badge}
      date={todayLabel()}
      title={title}
      subtitle={subtitle}
      actions={actions}
      footer={footer}
      aside={aside}
    />
  );
}
