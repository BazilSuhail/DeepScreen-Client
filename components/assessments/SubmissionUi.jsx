import { motion } from 'motion/react';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineMinusCircle,
  HiOutlinePlayCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { hasScore, scoreTone } from '@/components/assessments/SubmissionHelpers';

import { base } from '@/constants/motion';
import { focusRing, card, primaryButton, secondaryButton, inputClass } from '@/components/ui/styles';

export { focusRing, card, primaryButton as btnPrimary, secondaryButton as btnSecondary, inputClass };
export { default as EmptyState } from '@/components/dashboard/EmptyState';

export const btnIcon = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-100 bg-card text-emerald-900/80 transition-colors hover:bg-emerald-50/60 hover:text-emerald-700 disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-foreground/90 dark:hover:bg-white/10 dark:hover:text-emerald-400 ${focusRing}`;

export const btnDangerIcon = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-100 bg-card text-emerald-900/80 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-white/10 dark:bg-card dark:text-foreground/90 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 ${focusRing}`;

const STATUS_NEUTRAL = 'text-emerald-900/80 bg-emerald-50 border-emerald-100 dark:text-foreground/90 dark:bg-white/10 dark:border-white/10';

export const STATUS_META = {
  pending: {
    icon: HiOutlineMinusCircle,
    label: 'Pending',
    className: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  },
  in_progress: {
    icon: HiOutlinePlayCircle,
    label: 'In progress',
    className: 'text-teal-800 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20',
  },
  submitted: {
    icon: HiOutlineDocumentText,
    label: 'Submitted',
    className: 'text-foreground bg-muted border-border',
  },
  evaluated: {
    icon: HiOutlineCheckCircle,
    label: 'Evaluated',
    className: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  },
};

export const QUESTION_STATUS_META = {
  passed: {
    icon: HiOutlineCheckCircle,
    label: 'Passed',
    className: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  },
  partial: {
    icon: HiOutlineClock,
    label: 'Partial',
    className: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  },
  failed: {
    icon: HiOutlineXCircle,
    label: 'Failed',
    className: 'text-red-800 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20',
  },
  no_answer: {
    icon: HiOutlineMinusCircle,
    label: 'No answer',
    className: STATUS_NEUTRAL,
  },
  error: {
    icon: HiOutlineExclamationTriangle,
    label: 'Error',
    className: 'text-red-800 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20',
  },
  no_tests: {
    icon: HiOutlineExclamationTriangle,
    label: 'No tests',
    className: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  },
};

const BADGE = 'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium';

export function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  const Icon = meta?.icon || HiOutlineMinusCircle;
  return (
    <span className={`${BADGE} ${meta?.className || STATUS_NEUTRAL}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta?.label || status || '—'}
    </span>
  );
}

export function QuestionStatusBadge({ status }) {
  const meta = QUESTION_STATUS_META[status] || QUESTION_STATUS_META.no_answer;
  const Icon = meta.icon;
  return (
    <span className={`${BADGE} ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status ? meta.label : 'No answer'}
    </span>
  );
}

const TYPE_META = {
  coding: { label: 'Coding', icon: 'code', className: 'text-teal-800 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20' },
  mcq: { label: 'MCQ', icon: 'list', className: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
  subjective: { label: 'Subjective', icon: 'text', className: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20' },
};

export function TypeBadge({ type, icon: Icon }) {
  const meta = TYPE_META[type] || { label: type || 'Other', className: STATUS_NEUTRAL };
  return (
    <span className={`${BADGE} ${meta.className}`}>
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

export function ScoreRing({ percentage, size = 52, strokeWidth = 5, caption }) {
  const scored = hasScore(percentage);
  const pct = scored ? Math.min(100, Math.max(0, percentage)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const tone = scoreTone(percentage);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="sr-only">{scored ? `Score ${Math.round(pct)} percent` : 'Not scored yet'}</span>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-emerald-100 dark:stroke-white/10" />
        {scored && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.hex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-semibold ${tone.text}`}>{scored ? `${Math.round(pct)}%` : '—'}</span>
        {caption && <span className="text-[10px] font-medium text-emerald-800/70 dark:text-muted-foreground">{caption}</span>}
      </div>
    </div>
  );
}


export function SectionTitle({ icon: Icon, title, hint, count }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-emerald-950 dark:text-foreground">
          {title}
          {count !== undefined && (
            <span className="rounded-sm bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900/80 dark:bg-white/10 dark:text-foreground/90">{count}</span>
          )}
        </h2>
        {hint && <p className="text-xs text-emerald-800/70 dark:text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

// Stat tile: emerald icon tile, value, label and hint. Value tone can be overridden through valueClass.
export function StatCard({ icon: Icon, label, value, sub, subClass, valueClass = 'text-emerald-950 dark:text-foreground', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...base, delay }}
      className={`${card} p-4 lg:p-5`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-emerald-800/70 dark:text-muted-foreground">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight lg:text-3xl ${valueClass}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs font-medium ${subClass}`}>{sub}</p>}
    </motion.div>
  );
}

export function Alert({ tone = 'error', children }) {
  const isError = tone === 'error';
  const Icon = isError ? HiOutlineExclamationTriangle : HiOutlineCheckCircle;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm font-medium ${
        isError
          ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
