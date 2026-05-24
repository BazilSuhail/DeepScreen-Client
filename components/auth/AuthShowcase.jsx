"use client";

import { motion } from "motion/react";
import {
  HiOutlineChartBar, HiOutlineCodeBracket, HiOutlineBeaker,
  HiOutlineShieldCheck, HiOutlineVideoCamera, HiOutlineSparkles, HiOutlineAcademicCap,
} from "react-icons/hi2";
import { base, fadeUp, stagger } from "@/constants/motion";
import FloatingIcons from "@/components/ui/FloatingIcons";
import AuthGridBackground from "@/components/auth/AuthGridBackground";

const features = [
  { icon: HiOutlineShieldCheck, label: "AI Proctoring", desc: "Real-time face & activity monitoring" },
  { icon: HiOutlineCodeBracket, label: "Live Coding", desc: "Built-in IDE with auto-grading" },
  { icon: HiOutlineVideoCamera, label: "Video Interviews", desc: "Secure sessions with recording" },
  { icon: HiOutlineChartBar, label: "Analytics", desc: "Detailed performance insights" },
];

// Off the centre column so they never cover the copy. Drag one and it springs back home.
const FLOATING = [
  { Icon: HiOutlineSparkles, pos: "top-[15%] left-[12%]", size: "lg", depth: 1.2, duration: 4 },
  { Icon: HiOutlineCodeBracket, pos: "top-[20%] right-[18%]", tone: "teal", depth: -0.9, duration: 5, delay: 0.3 },
  { Icon: HiOutlineAcademicCap, pos: "bottom-[25%] left-[15%]", size: "lg", depth: 0.8, duration: 4.5, delay: 0.6 },
  { Icon: HiOutlineShieldCheck, pos: "bottom-[30%] right-[12%]", size: "sm", tone: "teal", depth: -1.3, duration: 3.5, delay: 0.9 },
  { Icon: HiOutlineVideoCamera, pos: "top-[45%] left-[8%]", size: "sm", depth: 1.5, duration: 5.5, delay: 1.2 },
  { Icon: HiOutlineChartBar, pos: "top-[50%] right-[8%]", tone: "teal", depth: -1, duration: 4, delay: 1.5 },
];

export default function AuthShowcase({
  title = "Secure Assessment Platform",
  body = "AI-powered proctoring, live coding evaluations, and seamless video interviews — all in one platform.",
  items = features,
}) {
  return (
    <div className="relative hidden min-h-screen w-1/2 items-center justify-center overflow-hidden border-l border-emerald-100 bg-emerald-50/40 lg:flex dark:border-white/10 dark:bg-white/[0.02]">
      <AuthGridBackground />
      <FloatingIcons items={FLOATING} />
      <div className="relative z-10 text-center max-w-md px-8">
        <motion.div {...fadeUp} transition={base}>
          <div className="w-20 h-20 rounded-sm bg-card border border-emerald-200 shadow-sm flex items-center justify-center mx-auto mb-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <HiOutlineBeaker className="w-10 h-10 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {body}
          </p>
        </motion.div>

        <div className="space-y-3">
          {items.map((f, i) => (
            <motion.div
              key={f.label}
              {...fadeUp}
              transition={{ ...base, delay: Math.min(i + 1, 8) * stagger }}
              className="group flex items-center gap-4 p-4 rounded-lg border border-emerald-100 bg-card transition-colors hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-500/40"
            >
              <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none">
                <f.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
