"use client";

import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-secondary hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200 text-foreground"
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <HiSun className="w-5 h-5 text-emerald-400" />
      ) : (
        <HiMoon className="w-5 h-5 text-emerald-600" />
      )}
    </button>
  );
}
