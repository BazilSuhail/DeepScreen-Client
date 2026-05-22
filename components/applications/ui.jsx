'use client';

import React, { useEffect, useRef } from 'react';
import {
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
    HiOutlineXMark,
} from 'react-icons/hi2';

export const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-card';

export const card = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';

const buttonBase = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const primaryButton = `${buttonBase} bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500`;

export const secondaryButton = `${buttonBase} border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-white/15 dark:bg-white/5 dark:text-emerald-100 dark:hover:bg-white/10`;

export const dangerButton = `${buttonBase} bg-red-600 text-white hover:bg-red-500`;

export const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

export function ErrorAlert({ message, onRetry, onDismiss }) {
    return (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center dark:border-red-500/30 dark:bg-red-500/10">
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
                            className={`min-h-11 min-w-11 rounded-xl text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-500/20 ${focusRing} inline-flex items-center justify-center`}
                        >
                            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, text, action }) {
    return (
        <div className={`${card} flex flex-col items-center gap-3 px-6 py-10 text-center`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="max-w-md">
                <h3 className="font-semibold text-emerald-950 dark:text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-emerald-800/80 dark:text-slate-400">{text}</p>
            </div>
            {action}
        </div>
    );
}

export function StatTile({ icon: Icon, label, value }) {
    return (
        <div className={`${card} flex min-w-0 items-center gap-3 p-4 sm:p-5`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xl font-semibold tabular-nums text-emerald-950 dark:text-foreground sm:text-2xl">{value}</p>
                <p className="truncate text-xs font-medium text-emerald-800/80 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
}

export function ConfirmDialog({ open, title, description, confirmLabel, confirmClassName = primaryButton, busy = false, onConfirm, onCancel }) {
    const cancelRef = useRef(null);

    useEffect(() => {
        if (open) cancelRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape' && !busy) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, busy, onCancel]);

    if (!open) return null;

    const close = () => {
        if (!busy) onCancel();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                aria-label="Close dialog"
                tabIndex={-1}
                onClick={close}
                className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
            />
            <dialog
                open
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                className="relative m-0 w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 text-foreground shadow-2xl dark:border-white/10 dark:bg-card"
            >
                <h2 id="confirm-dialog-title" className="text-lg font-semibold text-emerald-950 dark:text-foreground">{title}</h2>
                <p id="confirm-dialog-description" className="mt-2 text-sm text-emerald-800/80 dark:text-slate-400">{description}</p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button ref={cancelRef} type="button" onClick={close} disabled={busy} className={secondaryButton}>
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={busy} className={confirmClassName}>
                        {busy ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </dialog>
        </div>
    );
}
