"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { base, fadeUp } from "@/constants/motion";
import { focusRing } from "@/components/ui/styles";

const backClass = `inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 -ml-2 text-sm font-medium text-muted-foreground transition-[color,background-color,translate,scale] duration-150 hover:bg-muted hover:text-foreground active:scale-[0.97] motion-reduce:transform-none ${focusRing}`;

// Back link for sub-pages. With `href` it links there; without, it goes back in history.
// `onBeforeLeave` (optional) returns false to cancel, e.g. an unsaved-draft confirm.
export function BackButton({ href, label = "Back", onBeforeLeave }) {
  const allowed = () => !onBeforeLeave || onBeforeLeave() !== false;
  const router = useRouter();
  const content = (
    <>
      <HiOutlineArrowLeft className="h-4 w-4 transition-[translate] duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
      {label}
    </>
  );
  return href ? (
    <Link href={href} onClick={(e) => !allowed() && e.preventDefault()} className={`group ${backClass}`}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={() => allowed() && router.back()} className={`group ${backClass}`}>
      {content}
    </button>
  );
}

// Standard header for every non-dashboard page: optional back link, icon tile, eyebrow, title, description,
// meta chips and actions (right-aligned on desktop, stacked on mobile). Full width — no max-w.
export default function PageHeader({ back, icon: Icon, eyebrow, title, description, meta, actions, className = "" }) {
  return (
    <motion.header {...fadeUp} transition={base} className={`space-y-4 ${className}`}>
      {back && <BackButton {...(back === true ? {} : back)} />}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 space-y-1">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{eyebrow}</p>
            )}
            <h1 className="break-words text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
            {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
            {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </motion.header>
  );
}
