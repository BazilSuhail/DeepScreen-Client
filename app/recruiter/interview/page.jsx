"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineCog6Tooth,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineChartBarSquare,
  HiOutlineSignal,
  HiOutlinePlay,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { HiClipboardCopy } from "react-icons/hi";

export default function RecruiterInterviewDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("setup");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [interviewsData, jobsData] = await Promise.all([
        api.get("/interviews/recruiter/"),
        api.get("/interviews/recruiter/jobs/"),
      ]);
      setInterviews(interviewsData);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link, id) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const totalJobs = jobs.length;
  const configuredJobs = jobs.length;
  const totalSessions = interviews.length;
  const activeSessions = interviews.filter(
    (i) => i.status === "in_progress" || i.status === "scheduled",
  ).length;

  const stats = [
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: HiOutlineBuildingOffice2,
      color: "text-blue-500",
    },
    {
      label: "Scheduled Sessions",
      value: activeSessions,
      icon: HiOutlineCalendar,
      color: "text-emerald-500",
    },
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: HiOutlineVideoCamera,
      color: "text-violet-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
          <HiOutlineVideoCamera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <HiOutlineVideoCamera className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold">Live Interviews</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure templates and manage live interview sessions.
          </p>
        </div>
        <Link
          href="/recruiter/interview/create"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <HiOutlinePlus className="w-4 h-4" /> Schedule Interview
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 bg-secondary/30 p-1.5 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab("setup")}
          className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "setup"
              ? "bg-card text-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HiOutlineCog6Tooth className="w-4 h-4" />
          Interview Setup
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "sessions"
              ? "bg-card text-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HiOutlineCalendar className="w-4 h-4" />
          Sessions
          {totalSessions > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px]">
              {totalSessions}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "setup" ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {jobs.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto text-muted-foreground/40">
                  <HiOutlineBuildingOffice2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground/60">
                  No jobs found
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create a job posting first to set up interview templates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job, i) => (
                  <motion.div
                    key={job.job_id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-6 hover:border-emerald-500/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 shrink-0">
                          <HiOutlineBuildingOffice2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate group-hover:text-emerald-500 transition-colors">
                            {job.job_title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {job.organization || "Organization"}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full shrink-0">
                        <HiOutlineCheckCircle className="w-3 h-3" />
                        Ready
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <HiOutlineClock className="w-3.5 h-3.5" />
                        {job.default_duration_minutes || 45} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineVideoCamera className="w-3.5 h-3.5" />
                        {job.camera_required ? "Camera On" : "Optional"}
                      </span>
                    </div>

                    <Link
                      href={`/recruiter/interview/setup/${job.job_id}`}
                      className="w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all bg-secondary hover:bg-secondary/80 text-foreground"
                    >
                      <HiOutlineCog6Tooth className="w-4 h-4" />
                      Edit Configuration
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {interviews.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto text-muted-foreground/40">
                  <HiOutlineCalendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground/60">
                  No sessions scheduled
                </h3>
                <p className="text-muted-foreground text-sm">
                  Schedule an interview to see candidate sessions here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {interviews.map((interview, i) => {
                  const statusConfig = {
                    pending: {
                      bg: "bg-amber-500/10 text-amber-500",
                      icon: HiOutlineClock,
                    },
                    scheduled: {
                      bg: "bg-blue-500/10 text-blue-500",
                      icon: HiOutlineCalendar,
                    },
                    in_progress: {
                      bg: "bg-emerald-500/10 text-emerald-500",
                      icon: HiOutlinePlay,
                    },
                    completed: {
                      bg: "bg-violet-500/10 text-violet-500",
                      icon: HiOutlineCheckCircle,
                    },
                    cancelled: {
                      bg: "bg-red-500/10 text-red-500",
                      icon: HiOutlineExclamationCircle,
                    },
                  };
                  const sc = statusConfig[interview.status] || {
                    bg: "bg-muted text-muted-foreground",
                    icon: HiOutlineSignal,
                  };
                  const StatusIcon = sc.icon;
                  const scheduledAt = interview.scheduled_at
                    ? new Date(interview.scheduled_at)
                    : null;
                  const expiresAt = interview.link_expires_at
                    ? new Date(interview.link_expires_at)
                    : null;
                  const isExpiringSoon =
                    expiresAt && expiresAt - new Date() < 86400000;

                  return (
                    <motion.div
                      key={interview.room_id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-border bg-card hover:border-emerald-500/20 transition-all group overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 shrink-0">
                              <HiOutlineVideoCamera className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold truncate group-hover:text-emerald-500 transition-colors">
                                {interview.title || "Technical Interview"}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <HiOutlineUser className="w-3 h-3" />
                                <span className="truncate">
                                  {interview.candidate_details?.email ||
                                    "Candidate"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest shrink-0 ${sc.bg}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {interview.status.replace("_", " ")}
                          </span>
                        </div>

                        {scheduledAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HiOutlineCalendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {scheduledAt.toLocaleDateString()} at{" "}
                              {scheduledAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}

                        {expiresAt && (
                          <div
                            className={`flex items-center gap-2 text-xs ${isExpiringSoon ? "text-amber-500" : "text-muted-foreground"}`}
                          >
                            <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Expires {expiresAt.toLocaleDateString()}
                            </span>
                            {isExpiringSoon && (
                              <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}

                        {interview.candidate_details?.name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HiOutlineUser className="w-3.5 h-3.5 shrink-0" />
                            <span>{interview.candidate_details.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border p-4 space-y-2.5">
                        <button
                          onClick={() =>
                            handleCopyLink(
                              interview.interview_link,
                              interview.room_id,
                            )
                          }
                          className="w-full py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <HiClipboardCopy className="w-4 h-4" />
                          {copiedId === interview.room_id
                            ? "Copied!"
                            : "Copy Interview Link"}
                        </button>
                        <Link
                          href={`/interview/join/${interview.access_token}`}
                          className="w-full py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                        >
                          <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                          Join Session
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
