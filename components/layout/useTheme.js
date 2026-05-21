"use client";

import { useCallback, useSyncExternalStore } from "react";

// The <html> element's "dark" class is the single source of truth for the theme.
// It is set server-side in app/layout.jsx and reconciled with localStorage by an
// inline script before hydration, so every consumer just observes the class.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => null;

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, []);

  return { darkMode: isDark === true, mounted: isDark !== null, toggleTheme };
}
