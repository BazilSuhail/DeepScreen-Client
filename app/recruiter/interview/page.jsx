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
  HiOutlineSignal,
  HiOutlinePlay,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineUserGroup,
  HiOutlineMicrophone,
} from "react-icons/hi2";
import { HiClipboardCopy } from "react-icons/hi";
import { BiDesktop } from "react-icons/bi";

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
  const totalSessions = interviews.length;
  const activeSessions = interviews.filter(
    (i) => i.status === "in_progress" || i.status === "scheduled",
  ).length;

  if (loading) {
    return (
      <div className="space-y-6 px-12">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-12 pb-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-semibold">Live Interviews</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <HiOutlineVideoCamera className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Live Interviews
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure templates and manage live interview sessions
            </p>
          </div>
        </div>
        <Link
          href="/recruiter/interview/create"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
        >
          <HiOutlinePlus className="w-5 h-5" /> Schedule Interview
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Jobs Configured",
            value: totalJobs,
            icon: HiOutlineBuildingOffice2,
            color: "from-blue-500/10 to-blue-600/5 text-blue-500",
          },
          {
            label: "Scheduled Sessions",
            value: activeSessions,
            icon: HiOutlineCalendar,
            color: "from-emerald-500/10 to-emerald-600/5 text-emerald-500",
          },
          {
            label: "Total Sessions",
            value: totalSessions,
            icon: HiOutlineUserGroup,
            color: "from-rose-500/10 to-rose-600/5 text-rose-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 bg-muted p-1.5 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab("setup")}
          className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "setup"
              ? "bg-card text-foreground shadow-md border border-border"
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
              ? "bg-card text-foreground shadow-md border border-border"
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
            className="space-y-4"
          >
            {jobs.length === 0 ? (
              <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
                <HiOutlineBuildingOffice2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No jobs found
                </h2>
                <p className="text-muted-foreground mb-6">
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
                    className="bg-card border border-border rounded-2xl p-6 hover:border-emerald-500/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex items-center justify-center text-emerald-500 shrink-0">
                          <HiOutlineBuildingOffice2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
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
                      className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-card border border-border hover:bg-secondary text-foreground"
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
              <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
                <HiOutlineCalendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No sessions scheduled
                </h2>
                <p className="text-muted-foreground">
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
                      className="bg-card border border-border rounded-2xl hover:border-emerald-500/20 transition-all group overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 flex items-center justify-center text-rose-500 shrink-0">
                              <HiOutlineVideoCamera className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
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
                              {scheduledAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })} at{" "}
                              {scheduledAt.toLocaleTimeString('en-US', {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "UTC",
                              })} UTC
                            </span>
                          </div>
                        )}

                        {expiresAt && (
                          <div
                            className={`flex items-center gap-2 text-xs ${isExpiringSoon ? "text-amber-500" : "text-muted-foreground"}`}
                          >
                            <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Expires {expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })} UTC
                            </span>
                            {isExpiringSoon && (
                              <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}

                        {interview.candidate_details?.profile?.first_name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HiOutlineUser className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {interview.candidate_details.profile.first_name}{" "}
                              {interview.candidate_details.profile.last_name ||
                                ""}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HiOutlineVideoCamera
                            className={`w-3.5 h-3.5 ${interview.camera_required ? "text-emerald-500" : ""}`}
                          />
                          <HiOutlineMicrophone
                            className={`w-3.5 h-3.5 ${interview.mic_required ? "text-emerald-500" : ""}`}
                          />
                          <BiDesktop
                            className={`w-3.5 h-3.5 ${interview.screen_share_enabled ? "text-emerald-500" : ""}`}
                          />
                          <span className="text-[10px] text-muted-foreground/60">
                            {interview.camera_required ? "Cam" : "No cam"} ·{" "}
                            {interview.mic_required ? "Mic" : "No mic"} ·{" "}
                            {interview.screen_share_enabled
                              ? "Share"
                              : "No share"}
                          </span>
                        </div>

                        {interview.candidate_instructions && (
                          <div className="text-xs text-muted-foreground/70 bg-secondary/20 rounded-xl p-3 line-clamp-2 leading-relaxed">
                            {interview.candidate_instructions}
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
                          className="w-full py-2.5 rounded-lg bg-muted hover:bg-secondary text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <HiClipboardCopy className="w-4 h-4" />
                          {copiedId === interview.room_id
                            ? "Copied!"
                            : "Copy Interview Link"}
                        </button>
                        <Link
                          href={`/interview/join/${interview.access_token}`}
                          className="w-full py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
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
