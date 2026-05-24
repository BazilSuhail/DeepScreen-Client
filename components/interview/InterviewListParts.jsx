'use client';

import { motion } from 'motion/react';
import { base, fadeUp, stagger } from '@/constants/motion';
import { card, iconTile } from '@/components/ui/styles';

export { primaryButton as listBtnPrimary, secondaryButton as listBtnSecondary } from '@/components/ui/styles';

// Stat tile: label + icon row, big value, optional hint. Shape matches SkeletonStats.
export function ListStatTile({ icon: Icon, label, hint, value, index = 0 }) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      className={`${card} min-w-0 space-y-2 p-5`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-foreground lg:text-3xl">{value}</p>
      {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}

// Section heading: icon tile + title + helper text + optional right-side action.
export function SectionHeading({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {text && <p className="text-xs text-muted-foreground">{text}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export { default as ListEmptyState } from '@/components/dashboard/EmptyState';
export { default as ListErrorState } from '@/components/dashboard/ErrorState';
