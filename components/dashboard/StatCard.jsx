'use client';

import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';

const TONES = {
  emerald: { badge: 'bg-emerald-500/10 text-emerald-500', glow: 'bg-emerald-500/15' },
  blue: { badge: 'bg-blue-500/10 text-blue-500', glow: 'bg-blue-500/15' },
  purple: { badge: 'bg-purple-500/10 text-purple-500', glow: 'bg-purple-500/15' },
  amber: { badge: 'bg-amber-500/10 text-amber-500', glow: 'bg-amber-500/15' },
  rose: { badge: 'bg-rose-500/10 text-rose-500', glow: 'bg-rose-500/15' },
  cyan: { badge: 'bg-cyan-500/10 text-cyan-500', glow: 'bg-cyan-500/15' },
};

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
      whileHover={{ y: -3 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 lg:p-5"
    >
      {/* Soft tinted shape in the corner, brighter on hover */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-100 ${palette.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight lg:text-4xl">{shown}</p>
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${palette.badge}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>

      {hint && <p className="relative mt-5 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
