"use client";

import { useRef } from "react";
import { motion, useTransform } from "motion/react";
import usePointerParallax from "./usePointerParallax";

const TONES = {
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  teal: "border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400",
  light: "border-white/15 bg-white/10 text-emerald-300",
};
const SIZES = {
  sm: ["h-9 w-9", "h-4 w-4"],
  md: ["h-12 w-12", "h-6 w-6"],
  lg: ["h-14 w-14", "h-7 w-7"],
};

function FloatingIcon({ Icon, pos, size = "md", tone = "emerald", depth = 1, float = 10, duration = 5, delay = 0, px, py, interactive }) {
  const x = useTransform(px, (v) => v * depth * 36);
  const y = useTransform(py, (v) => v * depth * 36);
  const [box, glyph] = SIZES[size] ?? SIZES.md;

  return (
    <motion.div className={`absolute ${pos}`} style={{ x, y }}>
      <motion.div
        animate={{ y: [0, -float, 0] }}
        transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          drag={interactive}
          dragSnapToOrigin
          dragElastic={0.6}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
          whileHover={interactive ? { scale: 1.12, rotate: -8 } : undefined}
          whileTap={interactive ? { scale: 0.92 } : undefined}
          whileDrag={{ scale: 1.15, rotate: 6 }}
          className={`flex items-center justify-center rounded-sm border ${box} ${TONES[tone] ?? TONES.emerald} ${
            interactive ? "pointer-events-auto cursor-grab touch-none active:cursor-grabbing" : ""
          }`}
        >
          <Icon className={glyph} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Decorative floating icons that drift with the cursor (parallax), bob idly, and — when `interactive` —
// can be hovered, grabbed and thrown (they spring back home). Place inside a `relative overflow-hidden` parent.
// items: [{ Icon, pos: "top-[15%] left-[12%]", size, tone, depth, float, duration, delay }]
export default function FloatingIcons({ items, interactive = true, className = "" }) {
  const ref = useRef(null);
  const { x, y } = usePointerParallax(ref);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {items.map((item, i) => (
        <FloatingIcon key={i} {...item} px={x} py={y} interactive={interactive} />
      ))}
    </div>
  );
}
