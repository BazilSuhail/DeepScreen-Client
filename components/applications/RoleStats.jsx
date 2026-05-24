'use client';

import React from 'react';
import { motion } from 'motion/react';
import { base, fadeUp, stagger } from '@/constants/motion';
import { iconTile } from '@/components/ui/styles';
import { card } from './ui';

// Summary tiles for the roles list: icon tile, value, label and hint.
export default function RoleStats({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, hint, icon: Icon }, i) => (
                <motion.div
                    key={label}
                    {...fadeUp}
                    transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                    className={`${card} flex min-w-0 items-center gap-4 p-5`}
                >
                    <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-2xl font-semibold tabular-nums">{value}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className="truncate text-xs text-muted-foreground">{hint}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
