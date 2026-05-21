'use client';

import { motion } from 'motion/react';

// Dense emerald grid over a dark, tight emerald wash. Shared by the auth pages and the 404 page.
// Position it in a `relative` parent; pass `className` to control when it shows (e.g. "lg:hidden").
// `animated` slowly drifts the grid lines, one cell every few seconds.
const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to bottom, rgba(2,44,34,0.55), rgba(9,10,15,0) 40%), " +
    "linear-gradient(rgba(52,211,153,0.10) 1px, transparent 1px), " +
    "linear-gradient(90deg, rgba(52,211,153,0.10) 1px, transparent 1px)",
  backgroundSize: "100% 100%, 24px 24px, 24px 24px",
};

export default function AuthGridBackground({ className = "", animated = false }) {
  const base = `pointer-events-none absolute inset-0 ${className}`;
  if (!animated) {
    return <div aria-hidden="true" className={base} style={GRID_STYLE} />;
  }
  return (
    <motion.div
      aria-hidden="true"
      className={base}
      style={GRID_STYLE}
      animate={{ backgroundPosition: ["0px 0px, 0px 0px, 0px 0px", "0px 0px, 24px 24px, 24px 24px"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  );
}
