import { HiOutlineArrowPath, HiOutlineExclamationCircle } from "react-icons/hi2";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

export const primaryButton =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const secondaryButton =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10 ${focusRing}`;

export const cardClass =
  "rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card";

export const inputClass =
  `w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 placeholder:text-emerald-700/50 outline-none transition-colors focus:border-emerald-500 dark:border-white/10 dark:bg-background dark:text-foreground dark:placeholder:text-slate-500 ${focusRing}`;

export const labelClass = "block text-sm font-semibold text-emerald-900 dark:text-slate-200";
export const hintClass = "text-xs text-emerald-800/70 dark:text-slate-400";

export function ErrorAlert({ title = "Something went wrong", message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center dark:border-red-500/25 dark:bg-red-500/10"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{title}</p>
          <p className="break-words text-sm text-red-700 dark:text-red-300/80">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`${secondaryButton} shrink-0 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/20`}
        >
          <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.02]">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-emerald-950 dark:text-foreground">{title}</p>
        {text && <p className="mx-auto max-w-sm text-sm text-emerald-800/80 dark:text-slate-400">{text}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
