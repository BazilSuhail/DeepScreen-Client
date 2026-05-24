import { HiOutlineArrowPath, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { secondaryButton } from "@/components/ui/styles";

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/40"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
          <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">{title}</p>
          {message && <p className="mt-0.5 text-sm text-red-700 dark:text-red-300/90">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${secondaryButton} shrink-0`}>
          <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
