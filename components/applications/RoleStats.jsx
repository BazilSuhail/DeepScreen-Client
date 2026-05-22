'use client';

import React from 'react';
import { card } from './ui';

// Summary tiles for the roles list: emerald icon tile, value, label and hint.
export default function RoleStats({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map(({ label, value, hint, icon: Icon }) => (
                <div key={label} className={`${card} flex min-w-0 items-center gap-4 p-4 sm:p-5`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-emerald-800/80 dark:text-slate-400">{label}</p>
                        <p className="text-2xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</p>
                        <p className="truncate text-xs text-emerald-800/70 dark:text-slate-500">{hint}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
