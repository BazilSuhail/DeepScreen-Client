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
  HiOutlineBriefcase,
  HiOutlineLightBulb,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { HiClipboardCopy } from "react-icons/hi";
import { BiDesktop } from "react-icons/bi";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import FormError from "@/components/auth/FormError";

const linkButton = "inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20";

function SectionHeader({ icon: Icon, tone, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function RecruiterInterviewDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("setup");
  const [copiedId, setCopiedId] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interviewsData, jobsData] = await Promise.all([
          api.get("/interviews/recruiter/"),
          api.get("/interviews/recruiter/jobs/"),
        ]);
        setInterviews(interviewsData);
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("We could not load your interviews. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError("");
    setAttempt((n) => n + 1);
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

  if (loading) return <PageSkeleton stats={3} cards={4} />;

  const nextStep = jobs.length === 0
    ? "Next step: post a job so you can set up its interview template."
    : interviews.length === 0
      ? "Next step: schedule your first interview from a candidate application."
      : "Next step: copy each join link for the candidate and open the room a few minutes early.";

  const stats = [
    { label: "Jobs Configured", value: totalJobs, icon: HiOutlineBuildingOffice2, tone: "bg-blue-500/10 text-blue-500", hint: "Jobs with an interview template" },
    { label: "Scheduled Sessions", value: activeSessions, icon: HiOutlineCalendar, tone: "bg-emerald-500/10 text-emerald-500", hint: "Sessions scheduled or in progress" },
    { label: "Total Sessions", value: totalSessions, icon: HiOutlineUserGroup, tone: "bg-rose-500/10 text-rose-500", hint: "Every session you have created" },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
      <DashboardBanner
        icon={HiOutlineVideoCamera}
        badge={{ label: `${totalSessions} ${totalSessions === 1 ? "session" : "sessions"}`, icon: HiOutlineCalendar }}
        title="Live Interviews"
        subtitle={`${totalJobs} ${totalJobs === 1 ? "job" : "jobs"} configured, ${activeSessions} scheduled or in progress`}
        footer={
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>{nextStep}</span>
          </span>
        }
      />

      {error && (
        <div className="flex flex-col items-start gap-2">
          <FormError title="Something went wrong" message={error} />
          <button
            type="button"
            onClick={retry}
            title="Try loading your interviews again"
            className={linkButton}
          >
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            title={stat.hint}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 lg:p-6"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-fit gap-2 rounded-xl border border-border bg-muted p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("setup")}
            title="Templates for each job"
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "setup"
                ? "border border-border bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" />
            Interview Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            title="Live sessions booked with candidates"
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "sessions"
                ? "border border-border bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HiOutlineCalendar className="h-4 w-4" aria-hidden="true" />
            Sessions
            {totalSessions > 0 && (
              <span className="ml-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                {totalSessions}
              </span>
            )}
          </button>
        </div>

        <Link
          href="/recruiter/interview/create"
          title="Pick a candidate application and set up a live session"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
        >
          <HiOutlinePlus className="h-5 w-5" aria-hidden="true" /> Schedule Interview
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "setup" ? (
          <motion.section
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <SectionHeader
              icon={HiOutlineCog6Tooth}
              tone="bg-emerald-500/10 text-emerald-500"
              title="Interview setup"
              subtitle="One reusable template per job, applied to every session"
            />

            {jobs.length === 0 ? (
              !error && (
                <EmptyState
                  icon={HiOutlineBuildingOffice2}
                  title="No jobs found"
                  text="Post a job first, then come back here to set up its interview template."
                  action={<Link href="/recruiter/jobs/create" className={linkButton}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post a job</Link>}
                />
              )
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                {jobs.map((job, i) => (
                  <motion.div
                    key={job.job_id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/30 lg:p-6"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <HiOutlineBuildingOffice2 className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-emerald-500">
                            {job.job_title}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {job.organization || "Organization"}
                          </p>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
                        <HiOutlineCheckCircle className="h-3 w-3" aria-hidden="true" />
                        Ready
                      </span>
                    </div>

                    <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5" title="Planned session length">
                        <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
                        {job.default_duration_minutes || 45} min
                      </span>
                      <span className="flex items-center gap-1.5" title="Camera requirement">
                        <HiOutlineVideoCamera className="h-3.5 w-3.5" aria-hidden="true" />
                        {job.camera_required ? "Camera On" : "Optional"}
                      </span>
                    </div>

                    <Link
                      href={`/recruiter/interview/setup/${job.job_id}`}
                      title="Set duration, camera, mic, and instructions for this job"
                      className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
                    >
                      <HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" />
                      Edit Configuration
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="sessions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <SectionHeader
              icon={HiOutlineCalendar}
              tone="bg-rose-500/10 text-rose-500"
              title="Sessions"
              subtitle="Live sessions booked with candidates"
            />

            {interviews.length === 0 ? (
              !error && (
                <EmptyState
                  icon={HiOutlineCalendar}
                  title="No sessions scheduled"
                  text="Schedule an interview to see candidate sessions here."
                  action={<Link href="/recruiter/interview/create" className={linkButton}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Schedule Interview</Link>}
                />
              )
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
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
                      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-emerald-500/30"
                    >
                      <div className="space-y-4 p-5 lg:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                              <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-emerald-500">
                                {interview.title || "Technical Interview"}
                              </h3>
                              <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                <HiOutlineUser className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">
                                  {interview.candidate_details?.email ||
                                    "Candidate"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${sc.bg}`}
                          >
                            <StatusIcon className="h-3 w-3" aria-hidden="true" />
                            {interview.status.replace("_", " ")}
                          </span>
                        </div>

                        {scheduledAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Scheduled time (UTC)">
                            <HiOutlineCalendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
                            title="When the join link stops working"
                            className={`flex items-center gap-2 text-xs ${isExpiringSoon ? "text-amber-500" : "text-muted-foreground"}`}
                          >
                            <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              Expires {expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })} UTC
                            </span>
                            {isExpiringSoon && (
                              <HiOutlineExclamationCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </div>
                        )}

                        {interview.candidate_details?.profile?.first_name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HiOutlineUser className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {interview.candidate_details.profile.first_name}{" "}
                              {interview.candidate_details.profile.last_name ||
                                ""}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <HiOutlineVideoCamera
                            title={interview.camera_required ? "Camera required" : "Camera optional"}
                            className={`h-3.5 w-3.5 ${interview.camera_required ? "text-emerald-500" : ""}`}
                            aria-hidden="true"
                          />
                          <HiOutlineMicrophone
                            title={interview.mic_required ? "Mic required" : "Mic optional"}
                            className={`h-3.5 w-3.5 ${interview.mic_required ? "text-emerald-500" : ""}`}
                            aria-hidden="true"
                          />
                          <BiDesktop
                            title={interview.screen_share_enabled ? "Screen share enabled" : "Screen share off"}
                            className={`h-3.5 w-3.5 ${interview.screen_share_enabled ? "text-emerald-500" : ""}`}
                            aria-hidden="true"
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
                          <div className="line-clamp-2 rounded-xl bg-secondary/20 p-3 text-xs leading-relaxed text-muted-foreground/70">
                            {interview.candidate_instructions}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto space-y-2.5 border-t border-border p-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyLink(
                              interview.interview_link,
                              interview.room_id,
                            )
                          }
                          title="Copy the link the candidate uses to join"
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-2.5 text-xs font-semibold transition-all hover:bg-secondary"
                        >
                          <HiClipboardCopy className="h-4 w-4" aria-hidden="true" />
                          {copiedId === interview.room_id
                            ? "Copied!"
                            : "Copy Interview Link"}
                        </button>
                        <Link
                          href={`/interview/join/${interview.access_token}`}
                          title="Open the live session room"
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                        >
                          <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
                          Join Session
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
