'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineMapPin, HiOutlineQuestionMarkCircle, HiOutlineSparkles } from 'react-icons/hi2';
import FloatingIcons from '@/components/ui/FloatingIcons';
import AuthGridBackground from '@/components/auth/AuthGridBackground';
import { base, fadeUp } from '@/constants/motion';
import { primaryButton, secondaryButton } from '@/components/ui/styles';

// Kept to the edges so they never sit on the copy; drag one and it springs back.
const FLOATING = [
  { Icon: HiOutlineMapPin, pos: 'top-[18%] left-[12%]', depth: 1.2, duration: 5 },
  { Icon: HiOutlineQuestionMarkCircle, pos: 'top-[24%] right-[14%]', tone: 'teal', depth: -1, duration: 4.6, delay: 0.5 },
  { Icon: HiOutlineBriefcase, pos: 'bottom-[22%] left-[16%]', size: 'sm', tone: 'teal', depth: 0.9, duration: 5.6, delay: 1 },
  { Icon: HiOutlineSparkles, pos: 'bottom-[18%] right-[12%]', size: 'sm', depth: -1.2, duration: 4.2, delay: 1.4 },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      <AuthGridBackground />
      <FloatingIcons items={FLOATING} className="hidden lg:block" />

      <motion.div
        {...fadeUp}
        transition={base}
        className="relative z-10 w-full max-w-xl text-center"
      >
        <div className="relative mx-auto mb-8 inline-block">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-lg border border-emerald-200 bg-card shadow-sm dark:border-emerald-500/20">
            <HiOutlineMagnifyingGlass className="h-14 w-14 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <span className="absolute -right-2 -top-2 rounded-sm bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
            404
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
          This page is <span className="text-emerald-600 dark:text-emerald-400">off the map</span>
        </h1>

        <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-muted-foreground">
          The link may be old, the page may have moved, or it never existed. Head back and pick up from there.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={primaryButton}
          >
            <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/jobs"
            className={secondaryButton}
          >
            <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
            Explore jobs
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
