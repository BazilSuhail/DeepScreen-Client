import { HiOutlineArrowPath, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { btnSecondary, card } from '@/components/interview/interviewStyles';

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/40"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
          <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">{title}</p>
          <p className="mt-0.5 text-sm text-red-700 dark:text-red-300/90">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnSecondary} shrink-0`}>
          <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-10 text-center dark:border-white/15 dark:bg-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-emerald-300">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-base font-semibold text-emerald-950 dark:text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-emerald-800/80 dark:text-muted-foreground">{text}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function StatTile({ icon: Icon, label, hint, value }) {
  return (
    <div className={`${card} flex min-w-0 flex-col items-start gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-emerald-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</p>
        <p className="truncate text-xs text-emerald-800/80 dark:text-muted-foreground">{label}</p>
        {hint && <p className="truncate text-xs text-emerald-800/60 dark:text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

// Form-shaped loading placeholder for the create and setup pages.
export function FormSkeleton({ stats = 0 }) {
  const block = 'animate-pulse rounded-lg bg-emerald-100 dark:bg-white/10';
  return (
    <output aria-busy="true" className="block space-y-8">
      <span className="sr-only">Loading</span>
      {stats > 0 && (
        <div className="grid max-w-md grid-cols-2 gap-3">
          {Array.from({ length: stats }, (_, i) => (
            <div key={i} className={`${block} h-16 rounded-xl`} />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className={`${card} space-y-5 p-5 lg:col-span-3 lg:p-6`}>
          <div className={`${block} h-5 w-48`} />
          <div className={`${block} h-11 w-full rounded-xl`} />
          <div className={`${block} h-11 w-full rounded-xl`} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`${block} h-11 rounded-xl`} />
            <div className={`${block} h-11 rounded-xl`} />
          </div>
          <div className={`${block} h-24 w-full rounded-xl`} />
          <div className={`${block} ml-auto h-11 w-40 rounded-xl`} />
        </div>
        <div className={`${card} space-y-4 p-5 lg:self-start`}>
          <div className={`${block} h-5 w-36`} />
          <div className={`${block} h-4 w-full`} />
          <div className={`${block} h-4 w-5/6`} />
          <div className={`${block} h-4 w-4/6`} />
        </div>
      </div>
    </output>
  );
}
