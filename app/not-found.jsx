'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineArrowLeft, HiOutlineBriefcase } from 'react-icons/hi2';
import AuthGridBackground from '@/components/auth/AuthGridBackground';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-screen max-w-full items-center justify-center overflow-hidden bg-background p-4">
      {/* Animated grid across the whole page */}
      <AuthGridBackground animated />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        <div className="relative mx-auto mb-8 inline-block">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-emerald-500/20 bg-card shadow-xl"
          >
            <HiOutlineMagnifyingGlass className="h-14 w-14 text-emerald-500" aria-hidden="true" />
          </motion.div>
          <span className="absolute -right-2 -top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
            404
          </span>
        </div>

        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          This page is <span className="text-emerald-500">off the map</span>
        </h1>

        <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-muted-foreground">
          The link may be old, the page may have moved, or it never existed. Head back and pick up from there.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500"
          >
            <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
            Explore jobs
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
