'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import {
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineDocumentText,
  HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineVideoCamera,
} from 'react-icons/hi2';
import AuthGridBackground from '@/components/auth/AuthGridBackground';
import FloatingIcons from '@/components/ui/FloatingIcons';

// Each icon sits off the centre column so it never covers the logo or the text. Drag one and it springs back.
const FLOATING_ICONS = [
  { Icon: HiOutlineBriefcase, pos: 'top-[14%] left-[8%]', depth: 1.2, duration: 5.2 },
  { Icon: HiOutlineSparkles, pos: 'top-[20%] right-[10%]', tone: 'teal', depth: -1, duration: 4.6, delay: 0.7 },
  { Icon: HiOutlineUserGroup, pos: 'top-[46%] left-[5%]', size: 'sm', tone: 'teal', depth: 0.8, duration: 6, delay: 1.4 },
  { Icon: HiOutlineVideoCamera, pos: 'top-[50%] right-[6%]', size: 'sm', depth: -1.4, duration: 5.5, delay: 0.3 },
  { Icon: HiOutlineDocumentText, pos: 'bottom-[18%] left-[16%]', tone: 'teal', depth: 1, duration: 4.9, delay: 1.9 },
  { Icon: HiOutlineShieldCheck, pos: 'bottom-[14%] right-[16%]', depth: -0.9, duration: 5.8, delay: 1.1 },
];

// Full-screen "signing you in" state. Follows the active theme so it never flashes black over a light app.
export default function AuthenticatingScreen() {
  const reduceMotion = useReducedMotion();

  return (
    <output
      aria-live="polite"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background"
    >
      <AuthGridBackground animated={!reduceMotion} />
      <FloatingIcons items={FLOATING_ICONS} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <Image src="/deepscreen.webp" alt="DeepScreen logo" width={56} height={56} priority />

        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Deep<span className="text-emerald-600 dark:text-emerald-400">Screen</span>
        </h1>

        <div className="flex items-center gap-2.5 text-sm text-emerald-700 dark:text-emerald-300/80">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-500 dark:bg-emerald-400"
              animate={reduceMotion ? undefined : { scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          </span>
          <span>Signing you in...</span>
        </div>

        <div className="relative h-0.5 w-40 overflow-hidden rounded-full bg-emerald-500/15">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-emerald-500 dark:bg-emerald-400"
            animate={reduceMotion ? { x: '0%', width: '100%', opacity: 0.4 } : { x: ['-100%', '300%'] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </output>
  );
}
