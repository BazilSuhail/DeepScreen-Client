'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlineCalendarDays, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';
import BannerShapes from '@/components/profile/BannerShapes';
import ApexChart from '@/components/dashboard/ApexChart';

const EMERALD = '#10b981';

// Shared dashboard banner for candidate, recruiter, and organization pages.
//
// Left column: optional icon, badge (defaults to `date`), title, subtitle, actions, and an optional footer
// line for guidance. Right column: `aside` (any card), or a progress ring with short links.
//
// Props
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
            track: { background: 'rgba(255,255,255,0.08)' },
            dataLabels: {
              name: { show: false },
              value: { show: showValue, fontSize: '16px', fontWeight: 600, color: '#fff', formatter: (v) => `${Math.round(v)}%` },
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
            className="flex min-w-0 items-center gap-2 rounded-xl bg-amber-500/10 px-2.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            {ChipIcon && <ChipIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="min-w-0 flex-1 truncate">{c.label}</span>
            {c.count > 1 && <span className="shrink-0 text-amber-300/70">{c.count}</span>}
            <HiOutlineArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );

  const emptyLine = (
    <p className="flex items-center justify-center gap-2 py-1 text-xs font-semibold text-emerald-300">
      <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> {emptyText}
    </p>
  );

  const ringCard = compact ? (
    <div className="w-full min-w-0 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm lg:w-72">
      <div className="flex items-center gap-3">
        <div className="w-20 shrink-0">{chart(80, false)}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{ringLabel}</p>
        </div>
      </div>
      {chipList || emptyLine}
    </div>
  ) : (
    <div className="w-full min-w-0 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:w-64">
      <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">{ringLabel}</p>
      {chart(100)}
      {chipList || emptyLine}
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-emerald-dark text-white"
    >
      <BannerShapes className="text-emerald-400/15" />
      <div className="relative z-10 grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6">
        <div className="min-w-0 space-y-4">
          <div className="space-y-2">
            {badgeLabel && (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" /> {badgeLabel}
              </p>
            )}
            <div className="flex min-w-0 items-center gap-3">
              {Icon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <h1 className="min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">{title}</h1>
            </div>
            {subtitle && <div className="break-words text-xs text-slate-400">{subtitle}</div>}
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  title={a.hint}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-all ${a.className || 'border-white/15 bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {a.icon && <a.icon className="h-4 w-4" aria-hidden="true" />}
                  {a.label}
                </Link>
              ))}
            </div>
          )}

          {footer && <div className="text-xs leading-relaxed text-slate-300">{footer}</div>}
        </div>

        {aside || (ring ? ringCard : null)}
      </div>
    </motion.section>
  );
}
