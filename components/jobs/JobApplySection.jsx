"use client";

import { motion } from "motion/react";
import { base, fadeUp, stagger } from "@/constants/motion";
import { cardPadded, iconTile } from "@/components/ui/styles";

// One numbered step of the apply flow. Reduced motion is handled by the app-wide MotionConfig.
export default function JobApplySection({
  id,
  index = 0,
  icon: Icon,
  title,
  description,
  headingId,
  children,
}) {
  return (
    <motion.section
      id={id}
      aria-labelledby={headingId}
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      className={`scroll-mt-28 space-y-5 ${cardPadded}`}
    >
      <header className="flex items-start gap-3">
        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </motion.section>
  );
}
