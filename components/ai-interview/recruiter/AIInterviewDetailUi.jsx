import Link from 'next/link';
import {
  HiOutlineArrowLeft, HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineExclamationTriangle, HiOutlinePauseCircle, HiOutlineShieldExclamation,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import { BannerBlock } from '@/components/dashboard/DashboardBanner';

export const TONE = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400',
  yellow: 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-400',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-400',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
  neutral: 'border-emerald-200 bg-emerald-100/60 text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
};

const ICON_TONE = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  neutral: 'bg-emerald-100 text-emerald-700 dark:bg-white/5 dark:text-slate-300',
};

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

export const BTN = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;
export const btnPrimary = `${BTN} bg-emerald-600 text-white shadow-sm hover:bg-emerald-500`;
export const btnDanger = `${BTN} bg-red-600 text-white shadow-sm hover:bg-red-500`;
export const btnSecondary = `${BTN} border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10`;
export const btnLink = `inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-emerald-800/80 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 ${FOCUS}`;
export const inputClass = `min-h-11 w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-950 outline-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-white/10 dark:bg-background dark:text-foreground`;
export const labelClass = 'block text-sm font-semibold text-emerald-900 dark:text-slate-200';
export const hintClass = 'text-xs text-emerald-800/70 dark:text-slate-400';

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
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${TONE[tone]} ${className}`}>
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
  const box = size === 'lg' ? 'h-12 w-12 rounded-2xl' : 'h-9 w-9 rounded-xl';
  return (
    <span className={`flex shrink-0 items-center justify-center ${box} ${ICON_TONE[tone]}`}>
      <Icon className={size === 'lg' ? 'h-6 w-6' : 'h-[18px] w-[18px]'} aria-hidden="true" />
    </span>
  );
}

export function Card({ as: Tag = 'section', className = '', children }) {
  return (
    <Tag className={`min-w-0 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card lg:p-6 ${className}`}>
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
    <div title={hint} className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card">
      <IconTile icon={icon} tone="emerald" />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-emerald-800/80 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-emerald-950 dark:text-foreground">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/25 dark:bg-red-500/10">
      <div className="flex items-start gap-3">
        <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{title}</p>
          {message && <p className="mt-1 break-words text-sm text-red-700 dark:text-red-300/80">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnSecondary} w-fit`}>
          <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action = null }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.02]">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm dark:bg-white/5 dark:text-slate-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-emerald-950 dark:text-foreground">{title}</p>
      {text && <p className="max-w-sm text-sm text-emerald-800/80 dark:text-slate-400">{text}</p>}
      {action}
    </div>
  );
}

export function NotFoundLink({ href, label }) {
  return (
    <Link href={href} className={`${btnSecondary} w-fit`}>
      <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

// Banner aside placeholder shared by the detail pages while data loads.
export function AsideBlocks({ count = 1 }) {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
      {Array.from({ length: count }, (_, i) => (
        <BannerBlock key={i} className="h-11 w-36 rounded-xl" />
      ))}
    </div>
  );
}

// Body placeholder below the banner. `sidebar` mirrors the config layout (content plus a side card).
function Bar({ className }) {
  return <div className={`animate-pulse rounded-lg bg-emerald-200/60 dark:bg-white/10 ${className}`} />;
}

export function DetailSkeleton({ stats = 0, blocks = 2, sidebar = false }) {
  return (
    <output aria-busy="true" className="block space-y-6">
      <span className="sr-only">Loading...</span>
      {stats > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: stats }, (_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 dark:border-white/10 dark:bg-card">
              <Bar className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Bar className="h-3 w-16" />
                <Bar className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      )}
      {sidebar ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {Array.from({ length: blocks }, (_, i) => (
              <div key={i} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card lg:p-6">
                <Bar className="h-5 w-40" />
                <Bar className="h-3 w-56" />
                <Bar className="h-32 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card lg:p-6">
            <Bar className="h-5 w-32" />
            <Bar className="h-3 w-48" />
            <Bar className="h-10 w-full" />
            <Bar className="h-10 w-full" />
            <Bar className="h-10 w-full" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: blocks }, (_, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card lg:p-6">
              <Bar className="h-5 w-40" />
              <Bar className="h-3 w-56" />
              <Bar className="h-40 w-full" />
            </div>
          ))}
        </div>
      )}
    </output>
  );
}
