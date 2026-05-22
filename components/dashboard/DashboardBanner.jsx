'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlineCalendarDays, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';
import BannerShapes from '@/components/profile/BannerShapes';
import ApexChart from '@/components/dashboard/ApexChart';
import { useTheme } from '@/components/layout/useTheme';

const EMERALD = '#10b981';

// Pulsing block used wherever a banner value is still loading.
export function BannerBlock({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-emerald-200/70 dark:bg-white/10 ${className}`} />;
}

// Shared dashboard banner for candidate, recruiter, and organization pages.
//
// Title, subtitle and actions always render. While `loading`, only data-driven parts (badge, footer,
// ring, chips) show a block placeholder. Pages pass a BannerBlock-based `aside` themselves while loading.
//
// Props
//   loading   true while data is fetching; shows block placeholders for data-driven parts
//   icon      component shown in a badge beside the title
//   badge     { label, icon } pill above the title; defaults to `date` with a calendar icon
//   date      shortcut for the badge label
//   title     text or node
//   subtitle  text or node, shown under the title
//   actions   [{ label, href, icon, className, hint }]; `hint` becomes the tooltip (title attribute)
//   footer    node shown under the actions, for guidance such as "Next: post your first job"
//   aside     node that replaces the right-hand card
//   ring      { label, value } progress ring; used when `aside` is not given
//   chips     [{ key, label, href, icon, count }] short links under the ring
//   compact   puts the ring beside its label and shows at most two chips
export default function DashboardBanner({
  loading = false,
  icon: Icon = null,
  badge,
  date,
  title,
  subtitle,
  actions = [],
  footer = null,
  ring = null,
  chips = [],
  emptyText = 'All caught up',
  compact = false,
  aside = null,
}) {
  const { darkMode } = useTheme();
  const badgeLabel = badge?.label ?? date;
  const BadgeIcon = badge?.icon ?? HiOutlineCalendarDays;
  const shownChips = chips.slice(0, compact ? 2 : 3);
  const ringLabel = ring?.label || 'Progress';
  const ringValue = Number(ring?.value) || 0;

  const chart = (height, showValue = true) => (
    <ApexChart
      type="radialBar"
      height={height}
      series={[ringValue]}
      options={{
        labels: [ringLabel],
        colors: [EMERALD],
        plotOptions: {
          radialBar: {
            hollow: { size: '55%' },
            track: { background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.15)' },
            dataLabels: {
              name: { show: false },
              value: { show: showValue, fontSize: '16px', fontWeight: 600, color: darkMode ? '#fff' : '#064e3b', formatter: (v) => `${Math.round(v)}%` },
            },
          },
        },
      }}
    />
  );

  const chipList = shownChips.length > 0 && (
    <div className="space-y-1.5">
      {shownChips.map((c) => {
        const ChipIcon = c.icon;
        return (
          <Link
            key={c.key}
            href={c.href}
            title={c.hint}
            className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-emerald-100 px-2.5 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
          >
            {ChipIcon && <ChipIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="min-w-0 flex-1 truncate">{c.label}</span>
            {c.count > 1 && <span className="shrink-0 text-emerald-700 dark:text-amber-300/70">{c.count}</span>}
            <HiOutlineArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );

  const emptyLine = (
    <p className="flex items-center justify-center gap-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
      <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> {emptyText}
    </p>
  );

  const ringCard = compact ? (
    <div className="w-full min-w-0 space-y-2 rounded-2xl border border-emerald-200 bg-white p-3 backdrop-blur-sm lg:w-72 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="w-20 shrink-0">{loading ? <BannerBlock className="h-20 w-20 rounded-full" /> : chart(80, false)}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-slate-400">{ringLabel}</p>
        </div>
      </div>
      {loading ? <BannerBlock className="h-9 w-full rounded-xl" /> : chipList || emptyLine}
    </div>
  ) : (
    <div className="w-full min-w-0 space-y-3 rounded-2xl border border-emerald-200 bg-white p-4 backdrop-blur-sm lg:w-64 dark:border-white/10 dark:bg-white/5">
      <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-slate-400">{ringLabel}</p>
      {loading ? <BannerBlock className="mx-auto h-24 w-24 rounded-full" /> : chart(100)}
      {loading ? <BannerBlock className="h-9 w-full rounded-xl" /> : chipList || emptyLine}
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-busy={loading || undefined}
      className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 text-emerald-950 dark:border-white/5 dark:bg-emerald-dark dark:text-white"
    >
      <BannerShapes className="text-emerald-400/25 dark:text-emerald-400/15" />
      <div className="relative z-10 grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6">
        <div className="min-w-0 space-y-4">
          <div className="space-y-2">
            {loading ? (
              <BannerBlock className="h-6 w-28 rounded-full" />
            ) : (
              badgeLabel && (
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" /> {badgeLabel}
                </p>
              )
            )}
            <div className="flex min-w-0 items-center gap-3">
              {Icon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 dark:border-white/10 dark:bg-white/10 dark:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <h1 className="min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">{title}</h1>
            </div>
            {subtitle && <div className="break-words text-xs text-emerald-800/70 dark:text-slate-400">{subtitle}</div>}
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  title={a.hint}
                  className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${a.className || 'border-emerald-200 bg-white text-emerald-800 shadow-sm hover:bg-emerald-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/20'}`}
                >
                  {a.icon && <a.icon className="h-4 w-4" aria-hidden="true" />}
                  {a.label}
                </Link>
              ))}
            </div>
          )}

          {loading && footer ? (
            <BannerBlock className="h-4 w-2/3" />
          ) : (
            footer && <div className="text-xs leading-relaxed text-emerald-900/80 dark:text-slate-300">{footer}</div>
          )}
        </div>

        {aside || (ring ? ringCard : null)}
      </div>
    </motion.section>
  );
}
