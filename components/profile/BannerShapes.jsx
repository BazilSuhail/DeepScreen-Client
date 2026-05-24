"use client";

import { useRef } from "react";
import { motion, useTransform } from "motion/react";
import usePointerParallax from "@/components/ui/usePointerParallax";

// Decorative SVG shapes for profile/dashboard banners. Sits behind the content in a `relative overflow-hidden` parent.
// The colour comes from the `className` text colour, e.g. "text-emerald-400/20".
// Interactive: each layer drifts with the cursor at its own depth, and the rings turn when the parent (`group`) is hovered.
export default function BannerShapes({ className = "" }) {
  const ref = useRef(null);
  const { x, y } = usePointerParallax(ref);
  // Depth per layer in px at the banner edge; negative layers move against the cursor.
  const dots = { x: useTransform(x, (v) => v * -14), y: useTransform(y, (v) => v * -14) };
  const rings = { x: useTransform(x, (v) => v * 28), y: useTransform(y, (v) => v * 28) };
  const shards = { x: useTransform(x, (v) => v * 18), y: useTransform(y, (v) => v * 18) };
  const plus = { x: useTransform(x, (v) => v * -36), y: useTransform(y, (v) => v * -36) };

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Dot grid, top left */}
      <motion.svg style={dots} className="absolute -left-4 -top-4 h-36 w-36" viewBox="0 0 144 144">
        <defs>
          <pattern id="banner-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="144" height="144" fill="url(#banner-dots)" />
      </motion.svg>

      {/* Ring pair, top right */}
      <motion.svg style={rings} className="absolute -right-14 -top-16 h-64 w-64" viewBox="0 0 200 200" fill="none">
        <g className="origin-center [transform-box:fill-box] transition-transform duration-1000 ease-out group-hover:rotate-90 motion-reduce:transition-none">
          <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" strokeLinecap="round" />
        </g>
      </motion.svg>

      {/* Angular shards, bottom right */}
      <motion.svg style={shards} className="absolute -bottom-2 right-0 h-36 w-72" viewBox="0 0 280 150" preserveAspectRatio="none">
        <path d="M0 150 L140 150 L280 30 L280 150 Z" fill="currentColor" />
        <path d="M70 150 L190 62 L220 150 Z" fill="currentColor" opacity="0.5" />
      </motion.svg>

      {/* Plus mark, bottom left */}
      <motion.svg style={plus} className="absolute bottom-6 left-1/3 h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <g className="origin-center [transform-box:fill-box] transition-transform duration-500 group-hover:rotate-45 motion-reduce:transition-none">
          <path d="M12 4 V20 M4 12 H20" />
        </g>
      </motion.svg>
    </div>
  );
}
