"use client";

import { motion } from "motion/react";
import { BiBarChartSquare, BiCode } from "react-icons/bi";
import { FaFlask } from "react-icons/fa";
import {
  LuShield, LuVideo,
  LuSparkles, LuGraduationCap, LuArrowRight,
} from "react-icons/lu";

const features = [
  { icon: LuShield, label: "AI Proctoring", desc: "Real-time face & activity monitoring" },
  { icon: BiCode, label: "Live Coding", desc: "Built-in IDE with auto-grading" },
  { icon: LuVideo, label: "Video Interviews", desc: "Secure sessions with recording" },
  { icon: BiBarChartSquare, label: "Analytics", desc: "Detailed performance insights" },
];

export default function AuthShowcase() {
  return (
    <div className="hidden lg:flex w-1/2 border-l-3 border-emerald-700/10 rounded-[70px] min-h-screen relative items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div className="absolute top-[15%] left-[12%]" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <LuSparkles className="w-7 h-7 text-emerald-400" />
        </div>
      </motion.div>
      <motion.div className="absolute top-[20%] right-[18%]" animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <BiCode className="w-6 h-6 text-teal-400" />
        </div>
      </motion.div>
      <motion.div className="absolute bottom-[25%] left-[15%]" animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <LuGraduationCap className="w-8 h-8 text-emerald-400" />
        </div>
      </motion.div>
      <motion.div className="absolute bottom-[30%] right-[12%]" animate={{ y: [0, 14, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}>
        <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <LuShield className="w-5.5 h-5.5 text-teal-400" />
        </div>
      </motion.div>
      <motion.div className="absolute top-[45%] left-[8%]" animate={{ y: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <LuVideo className="w-5 h-5 text-emerald-400" />
        </div>
      </motion.div>
      <motion.div className="absolute top-[50%] right-[8%]" animate={{ y: [0, 12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
        <div className="w-13 h-13 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <BiBarChartSquare className="w-6.5 h-6.5 text-teal-400" />
        </div>
      </motion.div>

      <div className="relative z-10 text-center max-w-md px-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="w-20 h-20 rounded-3xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <FaFlask className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-4">
            Secure Assessment Platform
          </h2>
          <p className="text-foreground/50 leading-relaxed mb-8">
            AI-powered proctoring, live coding evaluations, and seamless video interviews — all in one platform.
          </p>
        </motion.div>

        <div className="space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] hover:bg-foreground/[0.06] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">{f.label}</div>
                <div className="text-xs text-foreground/40">{f.desc}</div>
              </div>
              <LuArrowRight className="w-4 h-4 text-foreground/30 ml-auto group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
