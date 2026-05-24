'use client';

import { motion, useReducedMotion } from 'motion/react';
import { base, stagger } from '@/constants/motion';

export default function JobDetailReveal({ index = 0, className = '', children }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
    >
      {children}
    </motion.div>
  );
}
