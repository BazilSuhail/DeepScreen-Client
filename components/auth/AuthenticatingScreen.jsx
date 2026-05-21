'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineVideoCamera } from 'react-icons/hi2';
import AuthGridBackground from '@/components/auth/AuthGridBackground';

// Each icon sits off the centre column so it never covers the logo or the text.
const FLOATING_ICONS = [
  { Icon: HiOutlineBriefcase, pos: 'top-[14%] left-[8%]', duration: 5.2, delay: 0 },
  { Icon: HiOutlineSparkles, pos: 'top-[20%] right-[10%]', duration: 4.6, delay: 0.7 },
  { Icon: HiOutlineUserGroup, pos: 'top-[46%] left-[5%]', duration: 6, delay: 1.4 },
  { Icon: HiOutlineVideoCamera, pos: 'top-[50%] right-[6%]', duration: 5.5, delay: 0.3 },
  { Icon: HiOutlineDocumentText, pos: 'bottom-[18%] left-[16%]', duration: 4.9, delay: 1.9 },
  { Icon: HiOutlineShieldCheck, pos: 'bottom-[14%] right-[16%]', duration: 5.8, delay: 1.1 },
];

// Thin emerald lines that draw across the screen. Each has its own loop length and delay.
const LINES = [
  { pos: 'top-[30%] left-0 right-0 h-px', axis: 'x', duration: 9, delay: 0 },
  { pos: 'top-[66%] left-0 right-0 h-px', axis: 'x', duration: 11, delay: 3 },
  { pos: 'left-[32%] top-0 bottom-0 w-px', axis: 'y', duration: 10, delay: 5 },
];

export default function AuthenticatingScreen() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen w-screen max-w-full items-center justify-center overflow-hidden bg-[#090a0f]"
    >
      <AuthGridBackground animated={!reduceMotion} />

      {LINES.map(({ pos, axis, duration, delay }, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className={`pointer-events-none absolute bg-emerald-400 ${pos}`}
          style={{ originX: 0, originY: 0 }}
          initial={{ opacity: 0, scaleX: axis === 'x' ? 0 : 1, scaleY: axis === 'y' ? 0 : 1 }}
          animate={
            reduceMotion
              ? { opacity: 0.12, scaleX: 1, scaleY: 1 }
              : axis === 'x'
                ? { opacity: [0, 0.3, 0], scaleX: [0, 1, 1] }
                : { opacity: [0, 0.3, 0], scaleY: [0, 1, 1] }
          }
          transition={reduceMotion ? { duration: 0 } : { duration, delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }}
        />
      ))}

      {FLOATING_ICONS.map(({ Icon, pos, duration, delay }, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className={`pointer-events-none absolute ${pos} rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-400 shadow-lg shadow-emerald-500/10 backdrop-blur-sm sm:p-3`}
          animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <Image src="/deepscreen.webp" alt="DeepScreen logo" width={56} height={56} priority />

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Deep<span className="text-emerald-400">Screen</span>
        </h1>

        <div className="flex items-center gap-2.5 text-sm text-emerald-300/80">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={reduceMotion ? undefined : { scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span>Signing you in...</span>
        </div>

        <div className="relative h-px w-40 overflow-hidden rounded-full bg-emerald-500/15">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-emerald-400"
            animate={reduceMotion ? { x: '0%', width: '100%', opacity: 0.4 } : { x: ['-100%', '300%'] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}
