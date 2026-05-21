"use client";

import React, { useState, useEffect, use } from "react";
import { api } from "@/utils/api";
import resumeApi from "@/utils/resume_api";

import {
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineChevronLeft,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineChartBarSquare,
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineXMark,
  HiOutlineSquares2X2,
  HiOutlineInbox,
  HiOutlineBeaker,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from "react-icons/hi2";

import CandidateCard from "@/components/applications/CandidateCard";
import ShortlistModal from "@/components/applications/modals/ShortlistModal";
import CandidateSearch from "@/components/applications/CandidateSearch";
import EmptyState from "@/components/dashboard/EmptyState";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import { useRouter } from "next/navigation";

const STAGE_FILTERS = [
  { key: "all", icon: HiOutlineSquares2X2, hint: "Show every applicant" },
  { key: "applied", icon: HiOutlineInbox, hint: "Received and waiting for review" },
  { key: "shortlisted", icon: HiOutlineCheckBadge, hint: "Passed AI screening" },
  { key: "coding_pending", icon: HiOutlineBeaker, hint: "Coding test not yet completed" },
  { key: "rejected", icon: HiOutlineXCircle, hint: "Not moving forward" },
];

export default function JobApplicationsPage({ params }) {
  const { id: jobId } = use(params);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [stageFilter, setStageFilter] = useState("all");
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchJobAndApps = async () => {
    try {
      const [jobData, appsData] = await Promise.all([
        api.get(`/jobs/${jobId}/`),
        api.get(`/applications/job/${jobId}/`),
      ]);
      setJob(jobData);
      setApplications(appsData);
    } catch (err) {
      setError("We could not load this role. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    const load = async () => {
      try {
        const [jobData, appsData] = await Promise.all([
          api.get(`/jobs/${jobId}/`),
          api.get(`/applications/job/${jobId}/`),
        ]);
        if (!active) return;
        setJob(jobData);
        setApplications(appsData);
      } catch (err) {
        if (!active) return;
        setError("We could not load this role. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [jobId]);

  const retryLoad = () => {
    setError("");
    setLoading(true);
    fetchJobAndApps();
  };

  const handleShortlistConfirm = async () => {
    setShortlisting(true);
    setError("");
    try {
      await resumeApi.post(`/applications/job/${jobId}/shortlist/`, {});
      setLoading(true);
      await fetchJobAndApps();
      setIsShortlistModalOpen(false);
    } catch (err) {
      setError(err.message || "AI analysis failed");
    } finally {
      setShortlisting(false);
    }
  };

  const handleCandidateSearch = async (email) => {
    setSearching(true);
    setError("");
    try {
      const result = await api.get(
        `/applications/job/${jobId}/search/?email=${encodeURIComponent(email)}`,
      );
      setApplications((prev) => {
        const exists = prev.find(
          (a) => a.application_id === result.application_id,
        );
        if (exists) return prev;
        return [result, ...prev];
      });
      setStageFilter("all");
    } catch (err) {
      setError(`No candidate found with email: ${email}`);
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateStatus = async (appId, updates) => {
    try {
      await api.patch(`/applications/${appId}/`, updates);
      const data = await api.get(`/applications/job/${jobId}/`);
      setApplications(data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleStartChat = (app) => {
    if (app?.application_id) {
      router.push(`/chats/${app.application_id}`);
    }
  };

  const filteredApps =
    stageFilter === "all"
      ? applications
      : applications.filter((a) => a.current_stage === stageFilter);

  const stageCounts = applications.reduce((acc, a) => {
    acc[a.current_stage] = (acc[a.current_stage] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-20 md:px-8">
      <div className="flex min-w-0 flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push("/recruiter/applications")}
          title="Back to your roles"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-emerald-500 transition-all hover:gap-2.5"
        >
          <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Jobs
        </button>

        <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold tracking-tight lg:text-3xl">
              {job?.job_title}
            </h1>
            <p className="mt-0.5 break-words text-sm text-muted-foreground">
              {job?.organization_details?.name} &middot; {applications.length} Applicant{applications.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-full md:w-72">
            <CandidateSearch
              onSearch={handleCandidateSearch}
              loading={searching}
            />
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <p className="min-w-0 flex-1 break-words text-sm text-red-300">{error}</p>
          {!job && (
            <button
              type="button"
              onClick={retryLoad}
              title="Try loading this role again"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            title="Dismiss"
            className="shrink-0 rounded-md p-1 text-red-300/60 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total', hint: 'Every applicant to this role', count: applications.length, icon: HiOutlineUserCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Shortlisted', hint: 'Passed AI screening', count: stageCounts['shortlisted'] || 0, icon: HiOutlineCheckBadge, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending', hint: 'Waiting on review or a coding test', count: (stageCounts['applied'] || 0) + (stageCounts['coding_pending'] || 0), icon: HiOutlineClock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Rejected', hint: 'Not moving forward', count: stageCounts['rejected'] || 0, icon: HiOutlineXCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map(({ label, hint, count, icon: Icon, color, bg }) => (
          <div key={label} title={hint} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-5 lg:p-6">
            <div className={`${bg} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold tabular-nums">{count}</p>
              <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action card */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 lg:p-6 sm:flex-row">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <HiOutlineChartBarSquare className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">Candidate Evaluation</h3>
            <p className="text-xs text-muted-foreground">Trigger AI analysis or manage your pipeline</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => setIsShortlistModalOpen(true)}
            disabled={shortlisting || applications.length === 0 || job?.is_shortlisted}
            title={job?.is_shortlisted ? "AI shortlist has already run for this role" : "Rank applicants with AI screening"}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale"
          >
            <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
            {job?.is_shortlisted ? "Shortlisting Done" : "Run AI Shortlist"}
          </button>

          {job?.is_shortlisted && (
            <button
              type="button"
              onClick={() => router.push(`/chats/recruiter?job_id=${jobId}`)}
              title="Message shortlisted candidates"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/80"
            >
              <HiOutlineChatBubbleBottomCenterText className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Open Inbox
            </button>
          )}
        </div>
      </div>

      {/* Candidates */}
      <section className="space-y-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <HiOutlineUserGroup className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">Candidates</h2>
            <p className="text-xs text-muted-foreground/60">Filter by stage to focus on who needs attention</p>
          </div>
        </div>

        {/* Stage filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STAGE_FILTERS.map(({ key, icon: FilterIcon, hint }) => {
            const active = stageFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStageFilter(key)}
                aria-pressed={active}
                title={hint}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <FilterIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {key === "all"
                  ? `All (${applications.length})`
                  : key.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>

        {filteredApps.length === 0 ? (
          <EmptyState
            icon={HiOutlineUserCircle}
            title="No candidates"
            text={
              stageFilter === "all"
                ? "No one has applied to this position yet. Applicants will appear here as they apply."
                : `No candidates are in the "${stageFilter.replace(/_/g, " ")}" stage. Choose All to see everyone.`
            }
          />
        ) : (
          <div className="grid gap-3">
            {filteredApps.map((app, i) => (
              <CandidateCard
                key={app.application_id}
                app={app}
                rank={i + 1}
                onUpdateStatus={handleUpdateStatus}
                onStartChat={() => handleStartChat(app)}
                showMessageButton={job?.is_shortlisted}
              />
            ))}
          </div>
        )}
      </section>

      <ShortlistModal
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        onConfirm={handleShortlistConfirm}
        jobTitle={job?.job_title}
        totalApplicants={applications.length}
        loading={shortlisting}
      />
    </div>
  );
}
