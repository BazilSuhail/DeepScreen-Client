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

export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

export const card = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';

export const btnPrimary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnSecondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-foreground dark:hover:bg-white/10 ${focusRing}`;

export const btnIcon = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-900/80 transition-colors hover:bg-emerald-50/60 hover:text-emerald-700 disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-emerald-400 ${focusRing}`;

export const btnDangerIcon = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-900/80 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-white/10 dark:bg-card dark:text-slate-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 ${focusRing}`;

export const inputClass = `min-h-11 w-full rounded-2xl border border-emerald-100 bg-white px-3.5 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-700/60 outline-none transition-colors focus:border-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-foreground dark:placeholder:text-slate-500 ${focusRing}`;

const STATUS_NEUTRAL = 'text-emerald-900/80 bg-emerald-50 border-emerald-100 dark:text-slate-300 dark:bg-white/10 dark:border-white/10';

export const STATUS_META = {
  pending: {
    icon: HiOutlineMinusCircle,
    label: 'Pending',
    className: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  },
  in_progress: {
    icon: HiOutlinePlayCircle,
    label: 'In progress',
    className: 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
  },
  submitted: {
    icon: HiOutlineDocumentText,
    label: 'Submitted',
    className: 'text-purple-800 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20',
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

const BADGE = 'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium';

export function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  const Icon = meta?.icon || HiOutlineMinusCircle;
  return (
    <span className={`${BADGE} ${meta?.className || STATUS_NEUTRAL}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta?.label || status || 'Unknown'}
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
  coding: { label: 'Coding', icon: 'code', className: 'text-sky-800 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20' },
  mcq: { label: 'MCQ', icon: 'list', className: 'text-violet-800 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20' },
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
        {caption && <span className="text-[10px] font-medium text-emerald-800/70 dark:text-slate-400">{caption}</span>}
      </div>
    </div>
  );
}


export function SectionTitle({ icon: Icon, title, hint, count }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900/80 dark:bg-white/10 dark:text-slate-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-emerald-950 dark:text-foreground">
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900/80 dark:bg-white/10 dark:text-slate-300">{count}</span>
          )}
        </h2>
        {hint && <p className="text-xs text-emerald-800/70 dark:text-slate-400">{hint}</p>}
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
      transition={{ delay }}
      className={`${card} p-4 lg:p-5`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-emerald-800/70 dark:text-slate-400">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
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
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm font-medium ${
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


export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800/70 dark:bg-white/10 dark:text-slate-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-emerald-950 dark:text-foreground">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-emerald-800/70 dark:text-slate-400">{text}</p>
      </div>
      {action}
    </div>
  );
}


