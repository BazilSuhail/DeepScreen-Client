"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import { motion } from "motion/react";
import DashboardBanner, { BannerBlock } from "@/components/dashboard/DashboardBanner";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import {
  HiOutlineMicrophone,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import {
  EmptyState,
  ErrorAlert,
  cardClass,
  focusRing,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/ai-interview/recruiter/AIInterviewListUi";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Focus ring shown on the whole card when its stretched title link has keyboard focus.
const cardFocus =
  "transition-colors hover:border-emerald-500/40 [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-emerald-500 [&:has(:focus-visible)]:ring-offset-2";

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className={`${cardClass} flex min-w-0 flex-col gap-3 p-4 sm:p-5`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-emerald-800/80 dark:text-slate-400">{label}</p>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</p>
        <p className="truncate text-xs text-emerald-800/70 dark:text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

function SessionBadge({ count }) {
  if (count > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {plural(count, "session", "sessions")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-white/5 dark:text-slate-300">
      <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
      No candidates yet
    </span>
  );
}

function InterviewCard({ interview }) {
  const id = interview.interview_id;
  const title = interview.title || "Untitled interview";
  const sessions = Number(interview.session_count) || 0;
  return (
    <article className={`${cardClass} ${cardFocus} relative flex min-w-0 w-full flex-col gap-4 p-5 lg:p-6`}>
      <div className="min-w-0 space-y-2">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-emerald-800/80 dark:text-slate-400">
          <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{interview.job_title || "No job title"}</span>
        </p>
        <h2 className="break-words text-lg font-semibold leading-snug text-emerald-950 dark:text-foreground">
          <Link
            href={`/recruiter/ai-interview/${id}`}
            className="rounded-md after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
          >
            {title}
          </Link>
        </h2>
        <SessionBadge count={sessions} />
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 px-3 py-2 dark:bg-white/[0.03]">
          <HiOutlineDocumentText className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <dt className="sr-only">Questions</dt>
          <dd className="font-semibold tabular-nums text-emerald-950 dark:text-foreground">
            {interview.number_of_questions ?? 0} <span className="font-normal text-emerald-800/70 dark:text-slate-400">questions</span>
          </dd>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 px-3 py-2 dark:bg-white/[0.03]">
          <HiOutlineClock className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <dt className="sr-only">Time limit</dt>
          <dd className="font-semibold tabular-nums text-emerald-950 dark:text-foreground">
            {interview.duration_minutes ?? "-"} <span className="font-normal text-emerald-800/70 dark:text-slate-400">min</span>
          </dd>
        </div>
      </dl>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Link
          href={`/recruiter/ai-interview/${id}`}
          aria-label={`Edit ${interview.title || "interview"}`}
          className={`${secondaryButton} relative z-10 w-full`}
        >
          <HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" /> Edit
        </Link>
        <Link
          href={`/recruiter/ai-interview/${id}/sessions`}
          aria-label={`View candidate sessions for ${interview.title || "interview"}`}
          className={`${primaryButton} relative z-10 w-full`}
        >
          <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> Sessions
        </Link>
      </div>
    </article>
  );
}

export default function RecruiterAIInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get("/ai-interviews/");
        if (!active) return;
        setInterviews(Array.isArray(data) ? data : []);
        setLoadError("");
      } catch (e) {
        if (!active) return;
        console.error(e);
        setLoadError("We could not load your AI interviews. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setAttempt((n) => n + 1);
  };

  const query = search.trim().toLowerCase();
  const filtered = query
    ? interviews.filter(
        (i) =>
          i.title?.toLowerCase().includes(query) ||
          i.job_title?.toLowerCase().includes(query),
      )
    : interviews;

  const totalQuestions = interviews.reduce((sum, i) => sum + (Number(i.number_of_questions) || 0), 0);
  const totalSessions = interviews.reduce((sum, i) => sum + (Number(i.session_count) || 0), 0);

  const stats = [
    { label: "Interviews", value: interviews.length, icon: HiOutlineMicrophone, hint: "Set up for your jobs" },
    { label: "Questions", value: totalQuestions, icon: HiOutlineDocumentText, hint: "Across all interviews" },
    { label: "Sessions", value: totalSessions, icon: HiOutlineUserGroup, hint: "Candidates who took one" },
  ];

  const createButton = (
    <Link href="/recruiter/ai-interview/create" className={`${primaryButton} w-full sm:w-auto`}>
      <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> New interview
    </Link>
  );

  const [today] = useState(() => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }));

  // Data-dependent guidance is only shown once the list has loaded.
  const nextStep = interviews.length === 0
    ? "Next step: create your first AI interview. Candidates take it after you assign it to their application."
    : totalSessions === 0
      ? "Next step: no candidates have taken an interview yet. Sessions will appear here once they do."
      : "Next step: open an interview's Sessions to review scored candidate reports.";

  const showingContent = !loading && !loadError;

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <DashboardBanner
        loading={loading}
        icon={HiOutlineMicrophone}
        date={today}
        title="AI interviews"
        subtitle="Automated screening interviews for your jobs, with scored candidate reports."
        aside={
          loading ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <BannerBlock className="h-11 w-36 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {createButton}
            </div>
          )
        }
        footer={
          showingContent ? (
            <span className="flex items-start gap-2">
              <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              <span>{nextStep}</span>
            </span>
          ) : null
        }
      />

      <ErrorAlert message={loadError} onRetry={retry} />

      {loading && <PageSkeleton stats={3} cards={2} banner={false} />}

      {showingContent && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StatTile {...stat} />
              </motion.div>
            ))}
          </div>

          <section aria-labelledby="interview-list-heading" className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="interview-list-heading" className="text-base font-semibold text-emerald-950 dark:text-foreground">
                Your interviews
              </h2>
              {interviews.length > 0 && (
                <div className="relative w-full sm:w-80">
                  <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700 dark:text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    aria-label="Search interviews by title or job"
                    placeholder="Search by title or job"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputClass} min-h-11 py-3 pl-10 pr-12`}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className={`absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-white/10 ${focusRing}`}
                    >
                      <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {interviews.length > 0 && (
              <p aria-live="polite" className="text-xs text-emerald-800/70 dark:text-slate-400">
                Showing {filtered.length} of {plural(interviews.length, "interview", "interviews")}
              </p>
            )}

            {interviews.length === 0 ? (
              <EmptyState
                icon={HiOutlineMicrophone}
                title="No AI interviews yet"
                text="Create your first automated interview to start screening candidates for a job."
                action={createButton}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={HiOutlineMagnifyingGlass}
                title="No matching interviews"
                text="Try another title or job name, or clear the search to see everything."
                action={
                  <button type="button" onClick={() => setSearch("")} className={secondaryButton}>
                    <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Clear search
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((interview, idx) => (
                  <motion.div
                    key={interview.interview_id ?? idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx, 8) * 0.04 }}
                    className="flex min-w-0"
                  >
                    <InterviewCard interview={interview} />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
