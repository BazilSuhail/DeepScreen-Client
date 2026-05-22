import { HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';

// Error notices use role="alert" with an optional Retry. Success notices use role="status".
export default function Notice({ tone = 'error', title, message, onRetry }) {
    const isError = tone === 'error';
    const Icon = isError ? HiOutlineExclamationTriangle : HiOutlineCheckCircle;

    return (
        <div
            role={isError ? 'alert' : 'status'}
            className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                isError
                    ? 'border-red-500/25 bg-red-500/5 dark:bg-red-500/10'
                    : 'border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10'
            }`}
        >
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${isError ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                    aria-hidden="true"
                />
                <div className="min-w-0">
                    {title && (
                        <p className={`text-sm font-semibold ${isError ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'}`}>{title}</p>
                    )}
                    {message && (
                        <p className={`break-words text-sm ${isError ? 'text-red-700 dark:text-red-300/80' : 'text-emerald-700 dark:text-emerald-300/80'}`}>{message}</p>
                    )}
                </div>
            </div>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-white/5 dark:text-red-300 dark:hover:bg-white/10"
                >
                    <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                </button>
            )}
        </div>
    );
}
