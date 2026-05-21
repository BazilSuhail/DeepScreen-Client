'use client';

import { motion } from 'motion/react';
import { HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineArrowRight } from 'react-icons/hi2';
import BannerShapes from '@/components/profile/BannerShapes';
import ApexChart from '@/components/dashboard/ApexChart';

const EMERALD = '#10b981';

// Strength-focused companion to DashboardBanner.
// Left: a progress ring with a labelled strength score, plus supporting chips/short links.
// Right: optional content (e.g. a bar chart) passed via `aside`, along with title/subtitle/actions.
// `compact` collapses the ring and its label onto a single row and limits chips to two.
export default function StrengthsPanel({
  title = 'Strengths Overview',
  subtitle = 'Key hiring metrics at a glance',
  date = null,
  ring = null,
  chips = [],
  actions = [],
  emptyText = 'No strengths to display',
  compact = false,
  aside = null,
  className = '',
}) {
  const shownChips = chips.slice(0, compact ? 2 : 3);
  const ringLabel = ring?.label || 'Strength';
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
              value: {
                show: showValue,
                fontSize: '16px',
                fontWeight: 600,
                color: '#fff',
                formatter: (v) => `${Math.round(v)}%`,
              },
            },
          },
        },
      }}
    />
  );

  const chipList =
    shownChips.length > 0 && (
      <div className="space-y-1.5">
        {shownChips.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.key}
              href={c.href}
              className="flex min-w-0 items-center gap-2 rounded-xl bg-amber-500/10 px-2.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              <span className="min-w-0 flex-1 truncate">{c.label}</span>
              {c.count > 1 && <span className="shrink-0 text-amber-300/70">{c.count}</span>}
              <HiOutlineArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    );

  const emptyLine = (
    <p className="flex items-center justify-center gap-2 py-1 text-xs font-semibold text-emerald-300">
      <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> {emptyText}
    </p>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-emerald-dark text-white ${className}`}
    >
      <BannerShapes className="text-emerald-400/15" />
      <div className="relative z-10 grid gap-6 p-5 md:p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:p-6">
        {/* Left: strength ring + chips */}
        <div className="flex w-full min-w-0 flex-col items-center gap-3 lg:items-stretch">
          <div className="flex shrink-0 items-center justify-center">
            {chart(compact ? 72 : 96, !compact)}
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {ringLabel}
            </p>
            {!compact && (
              <p className="mt-1 text-[11px] text-slate-400">
                {Math.round(ringValue)}% score
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm lg:mt-1 lg:w-64">
            {chipList || emptyLine}
          </div>
          <div className="lg:hidden">
            <HiOutlineSparkles className="h-5 w-5 text-amber-300" aria-hidden="true" />
          </div>
        </div>

        {/* Right: title / subtitle / actions / optional aside */}
        <div className="flex w-full min-w-0 flex-col gap-4 self-center lg:items-end">
          <div className="min-w-0 self-start">
            {date && (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {date}
              </p>
            )}
            <h2 className="break-words text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">
              {title}
            </h2>
            <div className="break-words text-xs text-slate-400">{subtitle}</div>
          </div>

          <div className="flex flex-wrap gap-2 self-start">
            {actions.map((a) => (
              <a
                key={a.label}
                href={a.href}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-all ${a.className || 'border-white/10 text-slate-200 hover:bg-white/10'}`}
              >
                {a.icon && <a.icon className="h-4 w-4" aria-hidden="true" />}
                {a.label}
              </a>
            ))}
          </div>

          {aside && <div className="w-full max-w-sm self-stretch">{aside}</div>}
        </div>
      </div>
    </motion.section>
  );
}
