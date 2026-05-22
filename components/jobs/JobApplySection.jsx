"use client";

import { motion, useReducedMotion } from "motion/react";

export default function JobApplySection({
  id,
  index = 0,
  icon: Icon,
  title,
  description,
  headingId,
  children,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      aria-labelledby={headingId}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.04 }}
      className="scroll-mt-28 space-y-6 rounded-2xl border border-emerald-100 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-card"
    >
      <header className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-bold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      {children}
    </motion.section>
  );
}
