"use client";

import { motion } from "motion/react";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-emerald-600 mb-6"
      >
        Dashboard Overview
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-emerald-500/10 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-muted-foreground mb-2">Stat {i}</h3>
            <p className="text-4xl font-bold text-emerald-500">1,234</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-card border border-emerald-500/10 min-h-[300px] flex items-center justify-center text-muted-foreground">
        Analytics Chart Placeholder
      </div>
    </div>
  );
}
