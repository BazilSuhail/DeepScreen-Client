"use client";

import { HiOutlineCheck } from "react-icons/hi2";

export default function JobApplyStepper({ steps, current }) {
  return (
    <nav aria-label="Application steps">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
              <a
                href={`#${step.id}`}
                aria-current={active ? "step" : undefined}
                className="group flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    active
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-emerald-100 bg-white text-muted-foreground dark:border-white/10 dark:bg-card"
                  }`}
                >
                  {done ? (
                    <HiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <span
                  className={`truncate text-sm font-bold ${
                    active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : done
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </a>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`hidden h-0.5 flex-1 rounded-full sm:block ${
                    done ? "bg-emerald-400" : "bg-emerald-100 dark:bg-white/10"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
