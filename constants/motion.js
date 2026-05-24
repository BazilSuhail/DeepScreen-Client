// Shared motion tokens. Use these instead of ad-hoc durations so every surface moves the same way.
// Reduced motion is handled once by <MotionConfig reducedMotion="user"> in LayoutWrapper.

export const ease = [0.2, 0, 0, 1];

export const fast = { duration: 0.15, ease }; // hover, press, color
export const base = { duration: 0.22, ease }; // fades, small reveals
export const spring = { type: "spring", stiffness: 400, damping: 35 }; // layout, indicators
export const sheet = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 }; // bottom sheets, drawers

export const stagger = 0.04; // per item; cap staggered lists at ~8 items

export const press = { scale: 0.97 };

// Page/section entrance: fade up once. Pair with `transition={{ ...base, delay: i * stagger }}`.
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};
