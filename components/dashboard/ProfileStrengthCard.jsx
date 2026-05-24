'use client';

import Link from 'next/link';
import { HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';

// Profile strength as a checklist: a real count of completed items, a segment bar,
// and links to the next missing items. Items come from the server, so nothing here is estimated.
export default function ProfileStrengthCard({ items = [] }) {
  if (items.length === 0) return null;

  const done = items.filter((item) => item.done).length;
  const open = items.filter((item) => !item.done).slice(0, 2);

  return (
    <div className="w-full min-w-0 space-y-3 rounded-lg border border-neutral-200 bg-neutral-100 p-4 dark:border-white/10 dark:bg-white/5 lg:w-72">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 dark:text-slate-400">Profile strength</p>
        <p className="text-xs font-semibold tabular-nums text-neutral-700 dark:text-slate-200">
          {done} of {items.length} done
        </p>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {items.map((item) => (
          <span key={item.label} className={`h-1.5 flex-1 rounded-full ${item.done ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-neutral-200 dark:bg-white/10'}`} />
        ))}
      </div>

      {open.length > 0 ? (
        <div className="space-y-1.5">
          {open.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-10 min-w-0 items-center gap-2 rounded-md bg-neutral-100 px-2.5 py-2 text-xs font-semibold text-neutral-800 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-neutral-200 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
            >
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <HiOutlineArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> Profile complete
        </p>
      )}
    </div>
  );
}
