"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HiMoon, HiSun } from "react-icons/hi2";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
    setMounted(true);
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
      className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${
        mounted && darkMode
          ? "bg-emerald-900/40 border border-emerald-700/30"
          : "bg-emerald-100 border border-emerald-200"
      }`}
      aria-label="Toggle Theme"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
          mounted && darkMode ? "bg-emerald-800" : "bg-white"
        }`}
        style={{ left: mounted && darkMode ? "calc(100% - 1.5rem)" : "0.25rem" }}
      >
        {mounted && darkMode ? (
          <HiMoon className="w-3 h-3 text-emerald-300" />
        ) : (
          <HiSun className="w-3 h-3 text-emerald-600" />
        )}
      </motion.div>
    </button>
  );
}
