'use client';

import { HiOutlineCheck } from 'react-icons/hi2';

// Step indicator for multi-step auth flows. `steps` is [{ label, icon }], `current` is 1-based.
// Completed steps are buttons when `onSelect` is given, so people can go back and fix a step.
export default function StepIndicator({ steps, current, onSelect }) {
  return (
    <ol className="mb-8 flex items-center" aria-label="Progress">
      {steps.map((step, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        const Icon = step.icon;
        const circle = (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
              done
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : active
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-border bg-muted text-foreground/30'
            }`}
          >
            {done ? <HiOutlineCheck className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
          </span>
        );
        return (
          <li key={step.label} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              {done && onSelect ? (
                <button type="button" onClick={() => onSelect(num)} aria-label={`Back to ${step.label}`} className="cursor-pointer">
                  {circle}
                </button>
              ) : (
                <span aria-current={active ? 'step' : undefined}>{circle}</span>
              )}
              <span
                className={`hidden truncate text-[11px] font-semibold tracking-wide sm:block ${
                  active ? 'text-emerald-400' : done ? 'text-foreground/60' : 'text-foreground/30'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 transition-colors ${done ? 'bg-emerald-500/60' : 'bg-border'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
