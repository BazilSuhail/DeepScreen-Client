"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { motion } from "motion/react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
    >
      <div className="glass px-6 py-3 rounded-2xl flex items-center justify-between border border-emerald-500/20 shadow-lg backdrop-blur-md">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          DeepScreen
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-emerald-500 transition-colors">
            Dashboard
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-emerald-500 transition-colors">
            Profile
          </Link>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
