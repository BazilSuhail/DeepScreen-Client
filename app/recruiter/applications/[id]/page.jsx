"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import {
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineChevronLeft,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineCheckBadge,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineSquares2X2,
  HiOutlineInbox,
  HiOutlineBeaker,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { api } from "@/utils/api";
import resumeApi from "@/utils/resume_api";
import DashboardBanner, { BannerBlock } from "@/components/dashboard/DashboardBanner";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import CandidateRow from "@/components/applications/CandidateRow";
import CandidateDetailPanel from "@/components/applications/CandidateDetailPanel";
import {
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  StatTile,
  dangerButton,
  focusRing,
  primaryButton,
  secondaryButton,
} from "@/components/applications/ui";

const LOAD_ERROR = "We could not load this role. Check your connection and try again.";

const STAGE_FILTERS = [
  { key: "all", label: "All", icon: HiOutlineSquares2X2 },
  { key: "applied", label: "Applied", icon: HiOutlineInbox },
  { key: "shortlisted", label: "Shortlisted", icon: HiOutlineCheckBadge },
  { key: "coding_pending", label: "Coding test", icon: HiOutlineBeaker },
  { key: "rejected", label: "Rejected", icon: HiOutlineXCircle },
];

// Drops null entries so every later `app.field` read is safe.
const cleanApplications = (data) => (Array.isArray(data) ? data.filter(Boolean) : []);

export default function JobApplicationsPage({ params }) {
  const { id: jobId } = use(params);
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  // The application whose side panel is open; null when closed.
  const [openApp, setOpenApp] = useState(null);
  // Bumping `reloadKey` re-runs the load effect (used by Retry and after a shortlist run).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    // The cleanup flag drops responses from a previous role or a superseded reload.
    let active = true;
    Promise.all([
      api.get(`/jobs/${jobId}/`),
      api.get(`/applications/job/${jobId}/`),
    ])
      .then(([jobData, appsData]) => {
        if (!active) return;
        setJob(jobData ?? null);
        setApplications(cleanApplications(appsData));
        setError("");
      })
      .catch(() => {
        if (active) setError(LOAD_ERROR);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [jobId, reloadKey]);

  const retry = () => {
    setError("");
    if (!job) setLoading(true);
    setReloadKey((n) => n + 1);
  };

  const runShortlist = async () => {
    setShortlisting(true);
    setError("");
    try {
      await resumeApi.post(`/applications/job/${jobId}/shortlist/`, {});
      setReloadKey((n) => n + 1);
    } catch (err) {
      setError(err?.message || "AI analysis failed. Try again.");
    } finally {
      setShortlisting(false);
      setShortlistOpen(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSearching(true);
    setError("");
    try {
      const result = await api.get(
        `/applications/job/${jobId}/search/?email=${encodeURIComponent(trimmed)}`,
      );
      if (!result?.application_id) throw new Error("Not found");
      setApplications((prev) =>
        prev.some((a) => a.application_id === result.application_id) ? prev : [result, ...prev],
      );
      setStageFilter("all");
      setEmail("");
    } catch {
      setError(`No candidate found with email: ${trimmed}`);
    } finally {
      setSearching(false);
    }
  };

  const updateStatus = async (appId, updates) => {
    setUpdatingId(appId);
    setError("");
    try {
      await api.patch(`/applications/${appId}/`, updates);
      const data = await api.get(`/applications/job/${jobId}/`);
      setApplications(cleanApplications(data));
    } catch {
      setError("We could not update this candidate. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmReject = () => {
    const target = rejectTarget;
    setRejectTarget(null);
    if (target) updateStatus(target.application_id, { status: "rejected", current_stage: "rejected" });
  };

  const stageCounts = applications.reduce((acc, a) => {
    if (a?.current_stage) acc[a.current_stage] = (acc[a.current_stage] || 0) + 1;
    return acc;
  }, {});

  // Rank is by AI score across the whole role, so it stays correct while a stage filter is active.
  const rankById = new Map(
    applications
      .filter((a) => a.shortlist_score != null)
      .sort((a, b) => b.shortlist_score - a.shortlist_score)
      .map((a, i) => [a.application_id, i + 1]),
  );

  const applicantCount = applications.length;
  const visible = stageFilter === "all"
    ? applications
    : applications.filter((a) => a.current_stage === stageFilter);
  const activeFilter = STAGE_FILTERS.find((f) => f.key === stageFilter);
  const pendingCount = (stageCounts.applied || 0) + (stageCounts.coding_pending || 0);
  const rejectName = rejectTarget?.resume_details?.candidate_name
    || rejectTarget?.candidate_details?.email
    || "This candidate";

  const stats = [
    { label: "Total applicants", value: applicantCount, icon: HiOutlineUserGroup },
    { label: "Shortlisted", value: stageCounts.shortlisted || 0, icon: HiOutlineCheckBadge },
    { label: "Pending", value: pendingCount, icon: HiOutlineClock },
    { label: "Rejected", value: stageCounts.rejected || 0, icon: HiOutlineXCircle },
  ];

  const orgName = job?.organization_details?.name;
  const description = job
    ? [orgName, `${applicantCount} ${applicantCount === 1 ? "applicant" : "applicants"}`].filter(Boolean).join(" · ")
    : null;

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <DashboardBanner
        loading={loading}
        icon={HiOutlineUserGroup}
        title={job?.job_title || "Role"}
        subtitle={loading ? "Loading applicants..." : description || "Applicants for this role"}
        aside={loading ? (
          <div className="flex gap-2">
            <BannerBlock className="h-11 w-36 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              href="/recruiter/applications"
              className={`${secondaryButton} w-full sm:w-auto`}
            >
              <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" />
              All roles
            </Link>
            {job && (job.is_shortlisted ? (
              <>
                <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                  AI shortlist done
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/chats/recruiter?job_id=${jobId}`)}
                  className={`${primaryButton} w-full sm:w-auto`}
                >
                  <HiOutlineChatBubbleBottomCenterText className="h-4 w-4" aria-hidden="true" />
                  Open inbox
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShortlistOpen(true)}
                disabled={applicantCount === 0 || shortlisting}
                className={`${primaryButton} w-full sm:w-auto`}
              >
                <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
                Run AI shortlist
              </button>
            ))}
          </div>
        )}
      />

      {loading && <PageSkeleton stats={4} cards={3} banner={false} />}

      {!loading && error && (
        <ErrorAlert
          message={error}
          onRetry={job ? undefined : retry}
          onDismiss={job ? () => setError("") : undefined}
        />
      )}

      {!loading && job && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
          </div>

          <section aria-labelledby="candidates-heading" className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 id="candidates-heading" className="text-lg font-semibold text-emerald-950 dark:text-foreground">
                Candidates
              </h2>
              <search className="flex w-full md:w-96">
              <form onSubmit={handleSearch} className="flex w-full gap-2">
                <label htmlFor="candidate-email-search" className="sr-only">Find candidate by email</label>
                <div className="relative min-w-0 flex-1">
                  <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" aria-hidden="true" />
                  <input
                    id="candidate-email-search"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Find candidate by email"
                    className={`h-11 w-full rounded-xl border border-emerald-200 bg-white pl-10 pr-3 text-sm text-emerald-950 placeholder:text-emerald-800/60 dark:border-white/15 dark:bg-white/5 dark:text-foreground dark:placeholder:text-slate-400 ${focusRing}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !email.trim()}
                  className={`${secondaryButton} shrink-0`}
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </form>
              </search>
            </div>

            <fieldset aria-label="Filter candidates by stage" className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
              {STAGE_FILTERS.map(({ key, label, icon: Icon }) => {
                const active = stageFilter === key;
                const count = key === "all" ? applicantCount : stageCounts[key] || 0;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStageFilter(key)}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors ${focusRing} ${active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-white/15 dark:bg-white/5 dark:text-emerald-100 dark:hover:bg-white/10"}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                    <span className={`tabular-nums text-xs ${active ? "text-emerald-100" : "text-emerald-800/70 dark:text-slate-400"}`}>{count}</span>
                  </button>
                );
              })}
            </fieldset>

            {visible.length === 0 ? (
              applicantCount === 0 ? (
                <EmptyState
                  icon={HiOutlineUserGroup}
                  title="No applicants yet"
                  text="Candidates will appear here as they apply to this role."
                  action={
                    <Link href="/recruiter/applications" className={secondaryButton}>
                      <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Back to all roles
                    </Link>
                  }
                />
              ) : (
                <EmptyState
                  icon={activeFilter?.icon ?? HiOutlineSquares2X2}
                  title="No candidates in this stage"
                  text={`No one is in ${activeFilter?.label.toLowerCase() ?? "this"} right now.`}
                  action={
                    <button type="button" onClick={() => setStageFilter("all")} className={secondaryButton}>
                      Show all applicants
                    </button>
                  }
                />
              )
            ) : (
              <ul aria-label="Candidates" className="flex flex-col gap-3">
                {visible.map((app, i) => (
                  <CandidateRow
                    key={app.application_id ?? `row-${i}`}
                    app={app}
                    rank={rankById.get(app.application_id) ?? null}
                    busy={updatingId === app.application_id}
                    showMessage={Boolean(job.is_shortlisted)}
                    onShortlist={() => updateStatus(app.application_id, { current_stage: "shortlisted", status: "in_progress" })}
                    onReject={() => setRejectTarget(app)}
                    onMessage={() => router.push(`/chats/${app.application_id}`)}
                    onOpen={(row) => setOpenApp(row)}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <AnimatePresence>
        {openApp && (
          <CandidateDetailPanel
            key={openApp.application_id}
            applicationId={openApp.application_id}
            app={openApp}
            onClose={() => setOpenApp(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={shortlistOpen}
        title="Run AI shortlist?"
        description={`This analyzes ${applicantCount} ${applicantCount === 1 ? "candidate" : "candidates"} for ${job?.job_title || "this role"} and ranks them by fit. This cannot be undone.`}
        confirmLabel="Start analysis"
        busy={shortlisting}
        onConfirm={runShortlist}
        onCancel={() => setShortlistOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject this candidate?"
        description={`${rejectName} will be moved to Rejected.`}
        confirmLabel="Reject candidate"
        confirmClassName={dangerButton}
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
