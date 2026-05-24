'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { base, fadeUp, stagger } from '@/constants/motion';

// A plain card for one group of job fields: icon, title and one line of purpose, then the fields.
export default function JobFormSection({ index = 0, icon: Icon, title, description, children }) {
    const headingId = useId();
    return (
        <motion.section
            {...fadeUp}
            transition={{ ...base, delay: Math.min(index, 8) * stagger }}
            aria-labelledby={headingId}
            className="space-y-6 rounded-lg border border-emerald-100 bg-card dark:border-white/10 p-5 sm:p-6"
        >
            <header className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-0.5">
                    <h2 id={headingId} className="text-base font-semibold text-foreground">{title}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
            </header>
            <div className="space-y-6">{children}</div>
        </motion.section>
    );
}
