'use client';

import { HiOutlineExclamationCircle, HiOutlineChevronDown } from 'react-icons/hi2';
import JobFieldHint from '@/components/jobs/JobFieldHint';

// Shared form primitives. Every field has a label, an optional leading icon, an optional hint,
// and an error line that is linked to the input for screen readers.

const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const hintClass = 'text-xs leading-relaxed text-muted-foreground';
const errorClass = 'flex items-start gap-1.5 text-xs font-medium text-red-600 dark:text-red-400';

const RADIUS = { xl: 'rounded-lg', lg: 'rounded-md' };

function fieldShell(error, radius = 'lg') {
  return `min-h-11 w-full ${RADIUS[radius] ?? RADIUS.lg} border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/20 ${
    error ? 'border-red-500/50 focus:border-red-500/60' : 'border-border focus:border-emerald-500/60'
  }`;
}

function Shell({ id, label, hint, error, children, counter, hintVariant }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const tooltip = hintVariant === 'tooltip';
  return (
    <div className={tooltip ? 'group relative space-y-2' : 'space-y-2'}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className={labelClass}>{label}</label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={errorId} role="alert" className={errorClass}>
          <HiOutlineExclamationCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : tooltip ? (
        hint && <JobFieldHint id={hintId}>{hint}</JobFieldHint>
      ) : (
        hint && <p id={hintId} className={hintClass}>{hint}</p>
      )}
    </div>
  );
}

export function TextField({ id, label, icon: Icon, hint, error, counter, className = '', radius, hintVariant, ...inputProps }) {
  return (
    <Shell id={id} label={label} hint={hint} error={error} counter={counter} hintVariant={hintVariant}>
      <div className="group relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400"
          />
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${fieldShell(error, radius)} ${Icon ? 'pl-11' : ''} ${className}`}
          {...inputProps}
        />
      </div>
    </Shell>
  );
}

export function SelectField({ id, label, icon: Icon, hint, error, options = [], placeholder, radius, hintVariant, ...selectProps }) {
  return (
    <Shell id={id} label={label} hint={hint} error={error} hintVariant={hintVariant}>
      <div className="group relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400"
          />
        )}
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${fieldShell(error, radius)} appearance-none pr-10 ${Icon ? 'pl-11' : ''}`}
          {...selectProps}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <HiOutlineChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35"
        />
      </div>
    </Shell>
  );
}

export function TextAreaField({ id, label, icon: Icon, hint, error, rows = 4, maxLength, value = '', radius, hintVariant, ...textareaProps }) {
  const counter = maxLength ? (
    <span className={`text-[11px] tabular-nums ${value.length > maxLength * 0.9 ? 'text-amber-600 dark:text-amber-300' : 'text-foreground/35'}`}>
      {value.length}/{maxLength}
    </span>
  ) : null;
  return (
    <Shell id={id} label={label} hint={hint} error={error} counter={counter} hintVariant={hintVariant}>
      <div className="group relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-foreground/35 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400"
          />
        )}
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${fieldShell(error, radius)} resize-none ${Icon ? 'pl-11' : ''}`}
          {...textareaProps}
        />
      </div>
    </Shell>
  );
}

// Compact on/off row, used for settings such as "Open to work" or "Visible to recruiters".
export function ToggleField({ id, label, hint, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 min-h-11 rounded-md border border-border bg-muted/40 px-4 py-3 transition-colors hover:border-emerald-500/30 has-focus-visible:ring-2 has-focus-visible:ring-emerald-500">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {hint && <span className={`block ${hintClass}`}>{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[translate] duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      </span>
    </label>
  );
}
