"use client";

import { motion } from "motion/react";
import { HiOutlineSparkles, HiOutlinePlus } from "react-icons/hi2";
import FloatingIcons from "@/components/ui/FloatingIcons";

const ACCENTS = [
  { Icon: HiOutlineSparkles, pos: "top-0 left-3", size: "sm", depth: 1.4, float: 6, duration: 3.6 },
  { Icon: HiOutlinePlus, pos: "bottom-0 right-3", size: "sm", tone: "teal", depth: -1.2, float: 6, duration: 4.2, delay: 0.5 },
];

export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-6 text-center">
      {Icon && (
        <div className="relative flex h-20 w-40 items-center justify-center">
          <FloatingIcons items={ACCENTS} />
          {/* Grab-and-throw: the tile springs back to its spot. */}
          <motion.span
            aria-hidden="true"
            drag
            dragSnapToOrigin
            dragElastic={0.5}
            whileHover={{ scale: 1.08, rotate: -6 }}
            whileTap={{ scale: 0.94 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            className="relative flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 active:cursor-grabbing dark:text-emerald-400"
          >
            <Icon className="h-6 w-6" />
          </motion.span>
        </div>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
