import { HiOutlineArrowPath, HiOutlineExclamationCircle } from "react-icons/hi2";
import { card as sharedCard, focusRing, secondaryButton } from "@/components/ui/styles";

export { focusRing, primaryButton, secondaryButton } from "@/components/ui/styles";

export const cardClass = sharedCard;
export { default as EmptyState } from "@/components/dashboard/EmptyState";

export const inputClass =
  `w-full rounded-md border border-emerald-200 bg-card px-4 py-3 text-sm text-emerald-950 placeholder:text-emerald-700/50 outline-none transition-colors focus:border-emerald-500 dark:border-white/10 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground ${focusRing}`;

export const labelClass = "block text-sm font-semibold text-emerald-900 dark:text-foreground";
export const hintClass = "text-xs text-emerald-800/70 dark:text-muted-foreground";

export function ErrorAlert({ title = "Something went wrong", message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center dark:border-red-500/25 dark:bg-red-500/10"
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

