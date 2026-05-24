"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { spring } from "@/constants/motion";
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
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { api } from "@/utils/api";
import resumeApi from "@/utils/resume_api";
import PageHeader from "@/components/ui/PageHeader";
import { badge, iconTile, inputClass } from "@/components/ui/styles";
import ApplicationDetailSkeleton from "@/components/skeletons/recruiter/ApplicationDetailSkeleton";
import CandidateRow from "@/components/applications/CandidateRow";
import CandidateDetailPanel from "@/components/applications/CandidateDetailPanel";
import {
  ConfirmDialog,
  card,
  EmptyState,
  ErrorAlert,
  StatTile,
  dangerButton,
  focusRing,
  primaryButton,
  secondaryButton
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
      await resumeApi.post(`/applications/job/${jobId}/shortlist`, {});
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

  if (loading) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <ApplicationDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        back={{ href: "/recruiter/applications", label: "Applications" }}
        icon={HiOutlineUserGroup}
        eyebrow={orgName || "Role"}
        title={job?.job_title || "Applicants"}
        description={job ? `${applicantCount} ${applicantCount === 1 ? "applicant" : "applicants"} for this role` : "Applicants for this role"}
        meta={job?.is_shortlisted && (
          <span className={`${badge} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
            <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            AI shortlist done
          </span>
        )}
        actions={job && (job.is_shortlisted ? (
          <>
            <button
              type="button"
              onClick={() => router.push(`/chats/recruiter?job_id=${jobId}`)}
              className={`${primaryButton} w-full sm:w-auto`}
            >
              <HiOutlineChatBubbleBottomCenterText className="h-4 w-4" aria-hidden="true" />
              Open inbox
            </button>
            <button
              type="button"
              onClick={() => setShortlistOpen(true)}
              disabled={shortlisting}
              className={`${secondaryButton} w-full sm:w-auto`}
            >
              <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
              Re-run AI shortlist
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShortlistOpen(true)}
            disabled={applicantCount === 0 || shortlisting}
            className={`${primaryButton} w-full sm:w-auto`}
          >
            {shortlisting ? (
              <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
            )}
            Run AI shortlist
          </button>
        ))}
      />

      {error && (
        <ErrorAlert
          message={error}
          onRetry={job ? undefined : retry}
          onDismiss={job ? () => setError("") : undefined}
        />
      )}

      {job && (
        <div className="grid gap-6 lg:grid-cols-12">
          <aside className="min-w-0 space-y-4 self-start lg:sticky lg:top-6 lg:col-span-4 2xl:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
            </div>

            <div className={`${card} space-y-4 p-4`}>
              <search className="block">
                <form onSubmit={handleSearch} className="flex w-full gap-2">
                  <label htmlFor="candidate-email-search" className="sr-only">Find candidate by email</label>
                  <div className="relative min-w-0 flex-1">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="candidate-email-search"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Find by email"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !email.trim()}
                    aria-label={searching ? "Searching" : "Search"}
                    className={`${secondaryButton} shrink-0 px-3`}
                  >
                    {searching ? (
                      <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </form>
              </search>

              <fieldset aria-label="Filter candidates by stage" className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0 lg:flex-col lg:gap-1">
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage</legend>
                {STAGE_FILTERS.map(({ key, label, icon: Icon }) => {
                  const active = stageFilter === key;
                  const count = key === "all" ? applicantCount : stageCounts[key] || 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStageFilter(key)}
                      aria-pressed={active}
                      className={`relative inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-[color,background-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none lg:w-full ${focusRing} ${active
                        ? "text-emerald-900 dark:text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      {active && (
                        <motion.span layoutId="application-stage-filter" transition={spring} className="absolute inset-0 rounded-md bg-emerald-100 dark:bg-white/10" aria-hidden="true" />
                      )}
                      <Icon className="relative h-4 w-4" aria-hidden="true" />
                      <span className="relative flex-1 text-left">{label}</span>
                      <span className="relative text-xs tabular-nums opacity-70">{count}</span>
                    </button>
                  );
                })}
              </fieldset>
            </div>
          </aside>

          <section aria-labelledby="candidates-heading" className="min-w-0 space-y-4 lg:col-span-8 2xl:col-span-9">
            <div className="flex items-center gap-3">
              <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="candidates-heading" className="text-base font-semibold">Candidates</h2>
                <p className="text-xs text-muted-foreground">
                  {stageFilter !== "all" && activeFilter
                    ? `${visible.length} in ${activeFilter.label.toLowerCase()}`
                    : "Open a candidate to see their full profile and scores"}
                </p>
              </div>
            </div>

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
              <ul aria-label="Candidates" className="grid gap-3 2xl:grid-cols-2">
                {visible.map((app, i) => (
                  <CandidateRow
                    key={app.application_id ?? `row-${i}`}
                    app={app}
                    rank={rankById.get(app.application_id) ?? null}
                    busy={updatingId === app.application_id}
                    // The recruiter chat API only lists applicants whose current_stage is 'shortlisted'.
                    showMessage={Boolean(job.is_shortlisted) && app.current_stage === "shortlisted"}
                    onShortlist={() => updateStatus(app.application_id, { current_stage: "shortlisted", status: "in_progress" })}
                    onReject={() => setRejectTarget(app)}
                    onMessage={() => router.push(`/chats/recruiter?job_id=${jobId}&id=${app.application_id}`)}
                    onOpen={(row) => setOpenApp(row)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
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
