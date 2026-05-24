'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineBuildingOffice2, HiOutlineBriefcase, HiOutlineCommandLine, HiOutlineSpeakerWave,
  HiOutlineVideoCamera, HiOutlineChartBar, HiOutlineUsers, HiOutlineTag,
} from 'react-icons/hi2';
import PageHeader from '@/components/ui/PageHeader';
import { badge, card, focusRing, iconTile } from '@/components/ui/styles';
import { base, fadeUp, spring, stagger } from '@/constants/motion';

// Full-width page shell shared by every organization page.
export const ORG_PAGE = 'w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10';

export const TONES = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  muted: 'bg-muted text-muted-foreground',
};

export const ORG_SECTIONS = [
  { key: 'jobs', label: 'Jobs', icon: HiOutlineBriefcase, tone: 'emerald', hint: 'Open job postings and applicant counts' },
  { key: 'assesments', label: 'Assessments', icon: HiOutlineCommandLine, tone: 'teal', hint: 'Coding assessments you give candidates' },
  { key: 'ai-interviews', label: 'AI Interviews', icon: HiOutlineSpeakerWave, tone: 'amber', hint: 'AI-led interviews that score answers automatically' },
  { key: 'interviews', label: 'Live Interviews', icon: HiOutlineVideoCamera, tone: 'teal', hint: 'Camera, microphone and screen rules for live interviews' },
  { key: 'analytics', label: 'Analytics', icon: HiOutlineChartBar, tone: 'emerald', hint: 'Hiring totals, status and pipeline charts' },
  { key: 'team', label: 'Team', icon: HiOutlineUsers, tone: 'amber', hint: 'Invite recruiters and review team access' },
];

export function Chip({ tone = 'muted', icon: Icon, children, title }) {
  return (
    <span title={title} className={`${badge} ${TONES[tone]}`}>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}

// The one industry chip used across org pages; renders nothing when the org has no industry.
export function industryBadge(industry) {
  return industry ? <Chip icon={HiOutlineTag} title="Industry">{industry}</Chip> : null;
}

export function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />;
}

export function StatTile({ label, value, icon: Icon, tone = 'emerald', hint, i = 0 }) {
  return (
    <motion.div {...fadeUp} transition={{ ...base, delay: Math.min(i, 8) * stagger }} title={hint} className={`${card} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <span className={`${iconTile} h-8 w-8 ${TONES[tone]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight lg:text-3xl">{value}</p>
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}

export function SectionHeading({ icon: Icon, title, helper, action, id }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold">{title}</h2>
          {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Section switcher shown under every subpage header so the whole workspace stays one click away.
export function OrgSectionNav({ slug, current }) {
  const items = [{ key: '', label: 'Overview', icon: HiOutlineBuildingOffice2 }, ...ORG_SECTIONS];
  return (
    <nav aria-label="Organization sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max min-w-full gap-1 border-b border-border">
        {items.map((s) => {
          const active = s.key === current;
          const Icon = s.icon;
          return (
            <li key={s.key || 'overview'}>
              <Link
                href={s.key ? `/organizations/${slug}/${s.key}` : `/organizations/${slug}`}
                title={s.hint}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors ${focusRing} ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {s.label}
                {active && <motion.span layoutId="org-section-nav" transition={spring} aria-hidden="true" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-500" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// PageHeader + section nav for /organizations/[slug]/<section>. Back goes to the org overview.
export function OrgSubpageHeader({ slug, current, title, description, meta, actions }) {
  const section = ORG_SECTIONS.find((s) => s.key === current);
  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: `/organizations/${slug}`, label: 'Overview' }}
        icon={section?.icon}
        eyebrow="Organization"
        title={title}
        description={description}
        meta={meta}
        actions={actions}
      />
      <OrgSectionNav slug={slug} current={current} />
    </div>
  );
}

// Grid entrance for cards/rows.
export const itemMotion = (i) => ({ ...fadeUp, transition: { ...base, delay: Math.min(i, 8) * stagger } });
