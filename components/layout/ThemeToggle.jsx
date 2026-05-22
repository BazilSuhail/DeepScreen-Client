"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";

const OPTIONS = [
  { value: "light", label: "Light", icon: HiOutlineSun },
  { value: "dark", label: "Dark", icon: HiOutlineMoon },
];

// The theme is the `dark` class on <html>. The choice is saved in a cookie, which the root layout reads on
// the server, so the right class is there before first paint. Dark is the default for first visits.
const THEME_EVENT = "themechange";

function subscribe(onChange) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function writeThemeCookie(value) {
  document.cookie = `theme=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

const readIsDark = () => document.documentElement.classList.contains("dark");
const serverIsDark = () => true;

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, readIsDark, serverIsDark);
  const theme = isDark ? "dark" : "light";

  const choose = (value) => {
    document.documentElement.classList.toggle("dark", value === "dark");
    writeThemeCookie(value);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex h-9 items-center gap-0.5 rounded-xl border border-border bg-muted/60 p-1"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <label
            key={value}
            className={`relative flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-emerald-500 ${
              active ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              aria-label={label}
              checked={active}
              onChange={() => choose(value)}
              className="sr-only"
            />
            {active && (
              <motion.span
                layoutId="theme-thumb"
                className="absolute inset-0 rounded-lg bg-emerald-600 shadow-sm shadow-emerald-600/30"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative h-3.5 w-3.5" aria-hidden="true" />
            <span className="relative hidden sm:inline">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
