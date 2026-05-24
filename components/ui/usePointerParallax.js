"use client";

import { useEffect } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

// Tracks the pointer over `ref`'s parent element as springy values from -0.5 to 0.5 (0 = centre).
// Layers multiply these by their own depth to drift at different speeds. Off under reduced motion.
export default function usePointerParallax(ref) {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.6 });

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || reduce) return;
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width - 0.5);
      rawY.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, reduce, rawX, rawY]);

  return { x, y };
}
