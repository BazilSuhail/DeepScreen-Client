'use client';

import { motion } from 'motion/react';

// Fine emerald grid with a soft wash at the top. Shared by the auth pages, chats and the 404 page.
// Theme-aware: a dark emerald wash in dark mode, a pale emerald wash in light mode.
// Position it in a `relative` parent; pass `className` to control when it shows (e.g. "lg:hidden").
// `animated` slowly drifts the grid lines, one cell every few seconds.
const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(16,185,129,0.10) 1px, transparent 1px), " +
    "linear-gradient(90deg, rgba(16,185,129,0.10) 1px, transparent 1px)",
  backgroundSize: "24px 24px, 24px 24px",
};
const WASH_DARK = { backgroundImage: "linear-gradient(to bottom, rgba(2,44,34,0.55), rgba(9,10,15,0) 40%)" };
const WASH_LIGHT = { backgroundImage: "linear-gradient(to bottom, rgba(209,250,229,0.7), rgba(255,255,255,0) 40%)" };
// Fade the grid out towards the bottom so it never fights with form content.
const MASK = { maskImage: "linear-gradient(to bottom, black 30%, transparent 95%)", WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 95%)" };

export default function AuthGridBackground({ className = "", animated = false }) {
  const layer = "pointer-events-none absolute inset-0";
  return (
    <div aria-hidden="true" className={`${layer} ${className}`}>
      <div className={`${layer} dark:hidden`} style={WASH_LIGHT} />
      <div className={`${layer} hidden dark:block`} style={WASH_DARK} />
      {animated ? (
        <motion.div
          className={layer}
          style={{ ...GRID_STYLE, ...MASK }}
          animate={{ backgroundPosition: ["0px 0px, 0px 0px", "24px 24px, 24px 24px"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <div className={layer} style={{ ...GRID_STYLE, ...MASK }} />
      )}
    </div>
  );
}
