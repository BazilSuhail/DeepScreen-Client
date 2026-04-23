"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { api } from "@/utils/api";
import {
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineCommandLine,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineVideoCamera,
  HiOutlineArrowTrendingUp,
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineStar,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
  HiOutlinePlus,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";
import BarChart from "@/components/display/BarChart";

const ICON_MAP = {
  HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineUserGroup,
  HiOutlineCommandLine, HiOutlineChatBubbleLeftEllipsis,
  HiOutlineVideoCamera, HiOutlineArrowTrendingUp, HiOutlineClock,
  HiOutlineCheckBadge, HiOutlineCalendarDays, HiOutlineUser,
  HiOutlineAcademicCap, HiOutlineStar,
};

/* ── Stat Card ── */
function StatCard({ stat, index }) {
  const Icon = ICON_MAP[stat.icon] || HiOutlineDocumentText;
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-2xl p-5 transition-all hover:shadow-md hover:shadow-emerald-500/5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[stat.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight">{stat.value.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      </div>
      <div className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 inline-block px-2.5 py-0.5 rounded-full">
        {stat.change}
      </div>
    </motion.div>
  );
}

/* ── Quick Action ── */
function QuickAction({ icon: Icon, label, color }) {
  return (
    <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:shadow-sm text-sm font-semibold ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ── Funnel Bar ── */
function FunnelBar({ label, value, max, color, index }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3"
    >
      <span className="text-xs font-medium text-muted-foreground w-28 text-right shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-secondary/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-sm font-bold w-8 text-right shrink-0">{value}</span>
    </motion.div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const styles = {
    Evaluated: "bg-emerald-500/10 text-emerald-500",
    "AI Round": "bg-violet-500/10 text-violet-500",
    Technical: "bg-cyan-500/10 text-cyan-500",
    Screening: "bg-blue-500/10 text-blue-500",
    Review: "bg-amber-500/10 text-amber-500",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${styles[status] || "bg-secondary text-muted-foreground"}`}>
      {status}
    </span>
  );
}

/* ── Avatar ── */
function Avatar({ initials }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500 shrink-0">
      {initials || "?"}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Dashboard
   ═══════════════════════════════════════════════════════════════════ */

export default function RecruiterDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const res = await api.get("/accounts/recruiter/dashboard/");
        setData(res);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <HiOutlineExclamationTriangle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load dashboard data.</p>
        <button onClick={() => window.location.reload()} className="text-xs font-semibold text-emerald-500 hover:underline">Retry</button>
      </div>
    );
  }

  const { stats, weeklyActivity, funnel, recentApplications, upcomingInterviews, jobPerformance, activityFeed, summary } = data;
  const pipelineStages = data.pipeline || [];
  const maxFunnel = funnel?.max || Math.max(...pipelineStages.map((p) => p.count), 1);

  const quickActions = [
    { label: "Post Job", icon: HiOutlinePlus, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { label: "Review", icon: HiOutlineDocumentText, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { label: "Schedule", icon: HiOutlineCalendarDays, color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
    { label: "Send Offer", icon: HiOutlinePaperAirplane, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  ];

  const primaryStats = (stats || []).slice(0, 3);
  const secondaryStats = (stats || []).slice(3);

  return (
    <div className="space-y-8 px-6 lg:px-8 pb-12">

      {/* ═══ Header ═══ */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {summary?.totalCandidates || 0} total candidates · {summary?.inAssessment || 0} in assessment ·{" "}
            <span className="text-emerald-500 font-semibold">{funnel?.conversion || 0}% conversion</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50 mr-3">
            <HiOutlineClock className="w-3.5 h-3.5" />
            <span>Live</span>
          </div>
          {quickActions.map((a) => (
            <button key={a.label} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm ${a.color}`}>
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Primary Stats (3 big cards) ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {primaryStats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* ═══ Secondary stats row + Chart ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Secondary stats — 2 columns of small cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-wider">More metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            {secondaryStats.map((stat, i) => {
              const Icon = ICON_MAP[stat.icon] || HiOutlineDocumentText;
              const colors = {
                emerald: "bg-emerald-500/10 text-emerald-500",
                blue: "bg-blue-500/10 text-blue-500",
                cyan: "bg-cyan-500/10 text-cyan-500",
                violet: "bg-violet-500/10 text-violet-500",
                rose: "bg-rose-500/10 text-rose-500",
                purple: "bg-purple-500/10 text-purple-400",
              };
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (primaryStats.length + i) * 0.04 }}
                  className="bg-card border border-border rounded-xl p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${colors[stat.color]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-lg font-bold">{stat.value.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Applicants, assessments & interviews</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Apps</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-300" /> Assess</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" /> Intvs</span>
            </div>
          </div>
          <div className="h-56 w-full">
            <BarChart data={weeklyActivity || []} />
          </div>
        </div>
      </div>

      {/* ═══ Funnel + Recent Apps ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-base font-bold mb-5">Conversion Funnel</h3>
          <div className="space-y-3">
            <FunnelBar label="Applications" value={funnel?.applications || 0} max={maxFunnel} color="bg-emerald-500" index={0} />
            <FunnelBar label="Assessments" value={funnel?.assessments || 0} max={maxFunnel} color="bg-emerald-400" index={1} />
            <FunnelBar label="AI Interviews" value={funnel?.ai_interviews || 0} max={maxFunnel} color="bg-emerald-300" index={2} />
            <FunnelBar label="Real Interviews" value={funnel?.real_interviews || 0} max={maxFunnel} color="bg-emerald-200" index={3} />
            <FunnelBar label="Offers" value={funnel?.offers || 0} max={maxFunnel} color="bg-emerald-100" index={4} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold">Recent Applications</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Latest candidates who applied</p>
            </div>
            <button className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1">
              View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {(recentApplications || []).slice(0, 4).map((app, i) => (
              <motion.div
                key={app.name + i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
              >
                <Avatar initials={app.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">{app.name}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{app.role || app.job}</p>
                </div>
                {app.score != null && app.score > 0 && (
                  <div className={`text-sm font-bold ${app.score >= 80 ? "text-emerald-500" : "text-amber-500"}`}>
                    {app.score}%
                  </div>
                )}
              </motion.div>
            ))}
            {(!recentApplications || recentApplications.length === 0) && (
              <p className="text-xs text-muted-foreground/50 text-center py-6">No applications yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Upcoming Interviews + Job Performance ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold">Upcoming Interviews</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{(upcomingInterviews || []).length} scheduled</p>
            </div>
            <button className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1">
              View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {(upcomingInterviews || []).slice(0, 4).map((iv, i) => (
              <motion.div
                key={iv.name + i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
              >
                <Avatar initials={iv.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">{iv.name}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground/60 bg-secondary/40 px-2 py-0.5 rounded">{iv.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{iv.role} · {iv.time}</p>
                </div>
                <HiOutlineVideoCamera className="w-4 h-4 text-muted-foreground/30 shrink-0" />
              </motion.div>
            ))}
            {(!upcomingInterviews || upcomingInterviews.length === 0) && (
              <p className="text-xs text-muted-foreground/50 text-center py-6">No upcoming interviews</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold">Job Performance</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Applicants & hires per job</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider pb-2 border-b border-border mb-2">
              <span className="col-span-2">Job</span>
              <span className="text-right">Apps</span>
              <span className="text-right">Hires</span>
            </div>
            {(jobPerformance || []).map((job, i) => (
              <motion.div
                key={job.title + i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-4 gap-3 py-2.5 items-center rounded hover:bg-secondary/20 transition-colors"
              >
                <span className="col-span-2 text-sm font-bold truncate">{job.title}</span>
                <span className="text-sm font-medium text-right text-muted-foreground">{job.apps}</span>
                <span className={`text-sm font-bold text-right ${job.hires > 0 ? "text-emerald-500" : "text-muted-foreground/40"}`}>
                  {job.hires}
                </span>
              </motion.div>
            ))}
            {(!jobPerformance || jobPerformance.length === 0) && (
              <p className="text-xs text-muted-foreground/50 text-center py-6">No job data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Activity Feed Footer ═══ */}
      <div className="border border-border rounded-2xl p-5 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineClock className="w-4 h-4 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-muted-foreground">Recent Activity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(activityFeed || []).slice(0, 6).map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/20 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                a.type === "assessment" ? "bg-cyan-500" :
                a.type === "application" ? "bg-blue-500" :
                a.type === "ai" ? "bg-violet-500" :
                a.type === "offer" ? "bg-emerald-500" : "bg-amber-500"
              }`} />
              <div>
                <p className="text-sm leading-relaxed text-foreground/80">{a.text}</p>
                <span className="text-[11px] text-muted-foreground/50">{a.time}</span>
              </div>
            </motion.div>
          ))}
          {(!activityFeed || activityFeed.length === 0) && (
            <p className="text-xs text-muted-foreground/50 text-center py-4 col-span-full">No recent activity</p>
          )}
        </div>
      </div>

    </div>
  );
}
