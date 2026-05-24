'use client';

import {
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
    HiOutlineXMark,
} from 'react-icons/hi2';

import { focusRing, card, primaryButton, secondaryButton, dangerButton } from '@/components/ui/styles';

export { focusRing, card, primaryButton, secondaryButton, dangerButton };
export { default as EmptyState } from '@/components/dashboard/EmptyState';

export const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

export function ErrorAlert({ message, onRetry, onDismiss }) {
    return (
        <div role="alert" className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center dark:border-red-500/30 dark:bg-red-500/10">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                <p className="min-w-0 break-words text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
            </div>
            {(onRetry || onDismiss) && (
                <div className="flex shrink-0 items-center gap-2">
                    {onRetry && (
                        <button type="button" onClick={onRetry} className={secondaryButton}>
                            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
                            Retry
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            type="button"
                            onClick={onDismiss}
                            aria-label="Dismiss error"
                            className={`min-h-11 min-w-11 rounded-md text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-500/20 ${focusRing} inline-flex items-center justify-center`}
                        >
                            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function StatTile({ icon: Icon, label, value }) {
    return (
        <div className={`${card} flex min-w-0 items-center gap-3 p-4 sm:p-5`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">{value}</p>
                <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export { default as ConfirmDialog } from '@/components/ui/ConfirmDialog';
