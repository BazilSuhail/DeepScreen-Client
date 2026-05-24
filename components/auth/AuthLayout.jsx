'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import AuthGridBackground from '@/components/auth/AuthGridBackground';
import AuthShowcase from '@/components/auth/AuthShowcase';
import { base, fadeUp } from '@/constants/motion';
import { focusRing } from '@/components/ui/styles';

// Shared two-column shell for auth flows: brand + narrow centred form on the left, showcase panel on lg+.
// Below lg the grid background stands in for the showcase. Pass `maxWidth` to widen the form column,
// and `showcase` ({ title, body, items }) to change the panel copy.
export default function AuthLayout({ children, maxWidth = 'max-w-md', showcase = {} }) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <AuthGridBackground className="lg:hidden" />
      <div className="relative flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-16">
        <motion.div {...fadeUp} transition={base} className={`w-full ${maxWidth}`}>
          <Link href="/" className={`mb-8 inline-flex items-center gap-2.5 rounded-md ${focusRing}`}>
            <Image src="/deepscreen.webp" alt="" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Deep<span className="text-emerald-600 dark:text-emerald-400">Screen</span>
            </span>
          </Link>
          {children}
        </motion.div>
      </div>
      <AuthShowcase {...showcase} />
    </div>
  );
}
