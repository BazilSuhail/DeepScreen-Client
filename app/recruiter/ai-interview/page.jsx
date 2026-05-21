"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiOutlineMicrophone,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineSpeakerWave,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowPath,
} from "react-icons/hi2";
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

export default function RecruiterAIInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get("/ai-interviews/");
        setInterviews(data);
        setLoadError("");
      } catch (e) {
        console.error(e);
        setLoadError("We could not load your AI interviews. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setAttempt((n) => n + 1);
  };

  const filtered = interviews.filter(
    (i) =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.job_title?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalQuestions = interviews.reduce((sum, i) => sum + (i.number_of_questions || 0), 0);
  const totalSessions = interviews.reduce((sum, i) => sum + (i.session_count || 0), 0);

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  const withoutSessions = interviews.filter((i) => !i.session_count).length;
  const nextStep = interviews.length === 0
    ? "Next step: create your first AI interview for one of your open jobs."
    : withoutSessions > 0
      ? `Next step: assign candidates to the ${withoutSessions} ${withoutSessions === 1 ? "interview" : "interviews"} that have no sessions yet.`
      : "Next step: open Sessions to review scored candidate reports.";

  const stats = [
    { label: "Total Interviews", value: interviews.length, icon: HiOutlineMicrophone, tone: "bg-amber-500/10 text-amber-500", hint: "Interviews configured for your jobs" },
    { label: "Total Questions", value: totalQuestions, icon: HiOutlineDocumentText, tone: "bg-blue-500/10 text-blue-500", hint: "Questions across all interviews" },
    { label: "Completed Sessions", value: totalSessions, icon: HiOutlineUserGroup, tone: "bg-emerald-500/10 text-emerald-500", hint: "Candidate sessions recorded so far" },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
      {/* ═══ Banner ═══ */}
      <DashboardBanner
        icon={HiOutlineSpeakerWave}
        badge={{ label: `${interviews.length} ${interviews.length === 1 ? "interview" : "interviews"}`, icon: HiOutlineClipboardDocumentList }}
        title="AI Interviews"
        subtitle={`${totalSessions} candidate ${totalSessions === 1 ? "session" : "sessions"} recorded so far`}
        footer={
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>{nextStep}</span>
          </span>
        }
      />

      {loadError && (
        <div className="space-y-3">
          <FormError title="Something went wrong" message={loadError} />
          <button
            type="button"
            onClick={retry}
            title="Load your interviews again"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      {/* ═══ Stats ═══ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            title={stat.hint}
            className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-5 lg:p-6"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ Interviews ═══ */}
      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            icon={HiOutlineMicrophone}
            tone="bg-amber-500/10 text-amber-500"
            title="Your interviews"
            subtitle="Search by interview title or job"
          />
          <Link
            href="/recruiter/ai-interview/create"
            title="Set up a new AI interview for a job"
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
          >
            <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> New interview
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search interviews"
              placeholder="Search interviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-emerald-500/50"
            />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {interviews.length} shown</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={HiOutlineMicrophone}
            title={search ? "No matching interviews" : "No AI interviews yet"}
            text={search
              ? "Try a different interview title or job name, or clear the search."
              : "Create your first automated interview to start screening candidates."}
            action={!search && (
              <Link href="/recruiter/ai-interview/create" className={linkButton}>
                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Set up interview
              </Link>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((interview, idx) => (
              <motion.div
                key={interview.interview_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/30 lg:p-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500" title="Interview">
                    <HiOutlineMicrophone className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <span
                      title="Job"
                      className="inline-block max-w-full truncate rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500"
                    >
                      {interview.job_title || "Interview"}
                    </span>
                    <h3 className="break-words text-lg font-semibold leading-tight transition-colors group-hover:text-amber-500">
                      {interview.title}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div title="Number of questions" className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3">
                    <HiOutlineDocumentText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-lg font-semibold">{interview.number_of_questions}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Questions</span>
                  </div>
                  <div title="Candidate sessions" className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3">
                    <HiOutlineUserGroup className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-lg font-semibold">{interview.session_count || 0}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sessions</span>
                  </div>
                  <div title="Time limit in minutes" className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3">
                    <HiOutlineClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-lg font-semibold">{interview.duration_minutes}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Min</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Link
                    href={`/recruiter/ai-interview/${interview.interview_id}`}
                    title="Edit questions, criteria and instructions"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                  >
                    <HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" /> Edit
                  </Link>
                  <Link
                    href={`/recruiter/ai-interview/${interview.interview_id}/sessions`}
                    title="See candidates and their scores"
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary/80"
                  >
                    <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> Sessions
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
