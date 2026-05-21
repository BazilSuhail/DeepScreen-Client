'use client';

import { useId } from 'react';
import { motion } from 'motion/react';

// A plain card for one group of job fields: icon, title and one line of purpose, then the fields.
export default function JobFormSection({ index = 0, icon: Icon, title, description, children }) {
    const headingId = useId();
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            aria-labelledby={headingId}
            className="space-y-6 rounded-lg border border-border bg-card p-6"
        >
            <header className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
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
