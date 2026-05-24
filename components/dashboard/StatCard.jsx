'use client';

import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';
import { base } from '@/constants/motion';

// Tone names are kept for existing callers; every tone maps onto the house palette (emerald / teal / amber / red).
const EMERALD = { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
const TEAL = { badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' };
const AMBER = { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
const RED = { badge: 'bg-red-500/10 text-red-600 dark:text-red-400' };
const TONES = { emerald: EMERALD, teal: TEAL, blue: TEAL, cyan: TEAL, purple: TEAL, amber: AMBER, rose: RED, red: RED };

export default function StatCard({ label, value, icon: Icon, tone = 'emerald', hint, delay = 0 }) {
  const reduce = useReducedMotion();
  const isNumber = typeof value === 'number';
  const [display, setDisplay] = useState(0);
  const palette = TONES[tone] || TONES.emerald;

  useEffect(() => {
    if (!isNumber || reduce) return;
    const controls = animate(0, value, {
      duration: 1,
      delay,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, isNumber, reduce, delay]);

  const shown = !isNumber ? value : reduce ? value : Math.round(display).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...base, delay }}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-5 lg:p-5"
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight lg:text-4xl">{shown}</p>
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm ${palette.badge}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>

      {hint && <p className="relative mt-5 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
