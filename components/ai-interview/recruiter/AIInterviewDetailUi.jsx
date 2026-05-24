import Link from 'next/link';
import {
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlinePauseCircle, HiOutlineShieldExclamation,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import { focusRing, secondaryButton } from '@/components/ui/styles';

export const TONE = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400',
  yellow: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
  blue: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/25 dark:bg-teal-500/10 dark:text-teal-400',
  violet: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/25 dark:bg-teal-500/10 dark:text-teal-400',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
  neutral: 'border-emerald-200 bg-emerald-100/60 text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-foreground',
};

const ICON_TONE = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  blue: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
  yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  violet: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  neutral: 'bg-emerald-100 text-emerald-700 dark:bg-white/5 dark:text-foreground',
};

export const BTN = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export { primaryButton as btnPrimary, dangerButton as btnDanger, secondaryButton as btnSecondary } from '@/components/ui/styles';
export const btnLink = `inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-800/80 transition-colors hover:text-emerald-700 dark:text-muted-foreground dark:hover:text-emerald-400 ${focusRing}`;
export const inputClass = `min-h-11 w-full rounded-md border border-emerald-200 bg-card px-4 py-2.5 text-sm text-emerald-950 outline-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-white/10 dark:bg-background dark:text-foreground`;
export const labelClass = 'block text-sm font-semibold text-emerald-900 dark:text-foreground';
export const hintClass = 'text-xs text-emerald-800/70 dark:text-muted-foreground';

export const STATUS_META = {
  completed: { label: 'Completed', icon: HiOutlineCheckCircle, tone: 'emerald' },
  evaluated: { label: 'Evaluated', icon: HiOutlineChartBar, tone: 'blue' },
  in_progress: { label: 'In progress', icon: HiOutlineClock, tone: 'yellow' },
  pending: { label: 'Pending', icon: HiOutlinePauseCircle, tone: 'neutral' },
  terminated: { label: 'Terminated', icon: HiOutlineShieldExclamation, tone: 'red' },
};

export const formatLabel = (value) => (value ? String(value).replace(/_/g, ' ') : '');

// The list endpoint exposes `score`; some payloads only carry `overall_score`.
export const getScore = (session) => session?.score ?? session?.overall_score ?? null;

export const isTerminatedSession = (session) =>
  session?.status === 'terminated' || Boolean(session?.guardrail_flagged);

export function Pill({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold ${TONE[tone]} ${className}`}>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  if (!meta) {
    return status ? <Pill tone="neutral" icon={HiOutlinePauseCircle}>{formatLabel(status)}</Pill> : null;
  }
  return <Pill tone={meta.tone} icon={meta.icon}>{meta.label}</Pill>;
}

export function IconTile({ icon: Icon, tone = 'emerald', size = 'md' }) {
  const box = size === 'lg' ? 'h-12 w-12 rounded-sm' : 'h-9 w-9 rounded-sm';
  return (
    <span className={`flex shrink-0 items-center justify-center ${box} ${ICON_TONE[tone]}`}>
      <Icon className={size === 'lg' ? 'h-6 w-6' : 'h-[18px] w-[18px]'} aria-hidden="true" />
    </span>
  );
}

export function Card({ as: Tag = 'section', className = '', children }) {
  return (
    <Tag className={`min-w-0 rounded-lg border border-emerald-100 bg-card p-5 shadow-sm dark:border-white/10 lg:p-6 ${className}`}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ icon, tone = 'emerald', title, description, action = null, headingLevel = 'h2' }) {
  const Heading = headingLevel;
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <IconTile icon={icon} tone={tone} />}
        <div className="min-w-0">
          <Heading className="text-base font-semibold tracking-tight text-emerald-950 dark:text-foreground">{title}</Heading>
          {description && <p className={hintClass}>{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Stat tiles always use the emerald theme tile; the `tone` prop is kept for call-site compatibility.
export function StatTile({ icon, label, value, hint }) {
  return (
    <div title={hint} className="flex min-w-0 items-center gap-3 rounded-lg border border-emerald-100 bg-card p-4 shadow-sm dark:border-white/10">
      <IconTile icon={icon} tone="emerald" />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-emerald-800/80 dark:text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-emerald-950 dark:text-foreground">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export { default as ErrorState } from '@/components/dashboard/ErrorState';
export { default as EmptyState } from '@/components/dashboard/EmptyState';

export function NotFoundLink({ href, label }) {
  return (
    <Link href={href} className={`${secondaryButton} w-fit`}>
      <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
