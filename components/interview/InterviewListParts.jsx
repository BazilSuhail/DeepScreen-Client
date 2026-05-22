import { HiOutlineArrowPath, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { focusRing } from '@/components/interview/interviewStyles';

export const listBtnSecondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10 ${focusRing}`;

export const listBtnPrimary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 ${focusRing}`;

export function ListStatTile({ icon: Icon, label, hint, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-card">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-emerald-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-emerald-800/80 dark:text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</p>
        <p className="mt-0.5 truncate text-xs text-emerald-800/70 dark:text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function ListEmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-12 text-center dark:border-white/15 dark:bg-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-emerald-300">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-base font-semibold text-emerald-950 dark:text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-emerald-800/80 dark:text-muted-foreground">{text}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function ListErrorState({ title = 'Something went wrong', message, onRetry }) {
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
        <button type="button" onClick={onRetry} className={`${listBtnSecondary} shrink-0`}>
          <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
