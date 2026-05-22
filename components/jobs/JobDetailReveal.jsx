'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function JobDetailReveal({ index = 0, className = '', children }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.04 }}
    >
      {children}
    </motion.div>
  );
}
