"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

export const inputClass =
  "h-11 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400";

export const PrimaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export const SecondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 shadow-sm transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

export function FormSection({ icon: Icon, title, description, children }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card"
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </motion.section>
  );
}

const ROW_COLS = {
  2: "grid grid-cols-1 gap-5 md:grid-cols-2",
  3: "grid grid-cols-1 gap-5 md:grid-cols-3",
};

export function FormRow({ children, cols = 2 }) {
  return <div className={ROW_COLS[cols] ?? ROW_COLS[2]}>{children}</div>;
}

function FieldMessage({ id, hint, error }) {
  if (error) {
    return (
      <p
        id={`${id}-error`}
        role="alert"
        className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400"
      >
        <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-xs text-neutral-500 dark:text-slate-400">
        {hint}
      </p>
    );
  }
  return null;
}

export function Field({ id, label, hint, error, icon: Icon, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
        )}
        <label htmlFor={id} className="text-sm font-medium text-neutral-800 dark:text-slate-200">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-emerald-600 dark:text-emerald-400">
              *
            </span>
          )}
        </label>
      </div>
      {children}
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function SkillsInput({ id, label, value, onChange, placeholder, hint, error, max = 20 }) {
  const [draft, setDraft] = useState("");
  const reduce = useReducedMotion();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  function addMany(items) {
    const next = [...value];
    for (const raw of items) {
      const skill = raw.trim();
      if (!skill || next.length >= max) continue;
      if (next.some((s) => s.toLowerCase() === skill.toLowerCase())) continue;
      next.push(skill);
    }
    if (next.length !== value.length) onChange(next);
  }

  function handleChange(e) {
    const text = e.target.value;
    if (text.includes(",")) {
      const parts = text.split(",");
      setDraft(parts.pop());
      addMany(parts);
    } else {
      setDraft(text);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addMany([draft]);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text");
    if (!/[,\n]/.test(text)) return;
    e.preventDefault();
    addMany([draft, ...text.split(/[,\n]/)]);
    setDraft("");
  }

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div
        className={`flex min-h-11 flex-wrap items-center gap-2 rounded-xl border bg-white p-2 transition-all duration-200 focus-within:ring-4 focus-within:ring-emerald-500/15 dark:bg-white/5 ${
          error
            ? "border-rose-400 dark:border-rose-500/60"
            : "border-neutral-200 hover:border-emerald-300 focus-within:border-emerald-500 dark:border-white/10 dark:focus-within:border-emerald-400"
        }`}
      >
        <AnimatePresence initial={false}>
          {value.map((skill, index) => (
            <motion.span
              key={skill}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: reduce ? 0 : 0.15 }}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 pl-3 pr-0.5 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200"
            >
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
              >
                <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          id={id}
          type="text"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-8 min-w-[8rem] flex-1 bg-transparent px-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
        />
      </div>
    </Field>
  );
}

function StepMarker({ status, icon: Icon, reduce }) {
  const isCurrent = status === "current";
  const isDone = status === "done";
  const GlyphIcon = isDone ? HiOutlineCheck : Icon;

  const tone = isDone || isCurrent
    ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
    : "border-neutral-200 bg-white text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400";

  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
      {isCurrent && !reduce && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-emerald-500/30 dark:bg-emerald-400/30"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border ${tone} ${
          isCurrent ? "ring-4 ring-emerald-500/20" : ""
        }`}
      >
        {GlyphIcon && <GlyphIcon className="h-4 w-4" aria-hidden="true" />}
      </span>
    </span>
  );
}

export function StepPipeline({ steps, current, onSelect }) {
  const reduce = useReducedMotion();
  const total = steps.length;
  const activeIndex = steps.findIndex((s) => s.key === current);
  const progress = total ? Math.max(activeIndex + 1, 0) / total : 0;

  return (
    <nav aria-label="Form progress">
      <ol className="hidden items-center md:flex">
        {steps.map((step, i) => {
          const status = i < activeIndex ? "done" : i === activeIndex ? "current" : "future";
          const isLast = i === total - 1;
          return (
            <li
              key={step.key}
              aria-current={status === "current" ? "step" : undefined}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <button
                type="button"
                onClick={() => onSelect?.(step.key)}
                disabled={!onSelect}
                className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-default"
              >
                <StepMarker status={status} icon={step.icon} reduce={reduce} />
                <span
                  className={`whitespace-nowrap text-sm font-medium ${
                    status === "future"
                      ? "text-neutral-500 dark:text-slate-400"
                      : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div className="relative mx-3 h-0.5 flex-1 rounded-full bg-neutral-200 dark:bg-white/10">
                  <motion.div
                    className="absolute inset-0 origin-left rounded-full bg-emerald-500"
                    initial={false}
                    animate={{ scaleX: i < activeIndex ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span aria-current="step" className="font-medium text-neutral-900 dark:text-white">
            {steps[activeIndex]?.label}
          </span>
          <span className="text-neutral-500 dark:text-slate-400">
            Step {Math.max(activeIndex + 1, 0)} of {total}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-white/10">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-emerald-500"
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </nav>
  );
}
