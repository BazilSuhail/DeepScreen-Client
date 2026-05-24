'use client';

import { motion } from 'motion/react';
import { base } from '@/constants/motion';

export default function ChartCard({ title, subtitle, icon: Icon, action, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...base, delay }}
      className={`rounded-lg border border-border bg-card p-5 lg:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />}
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </motion.div>
  );
}
