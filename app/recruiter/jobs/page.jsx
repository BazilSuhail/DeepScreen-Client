"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineMapPin,
  HiOutlineAcademicCap,
  HiOutlineLightBulb,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineArchiveBox,
  HiOutlineRocketLaunch,
  HiOutlineMagnifyingGlass,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/dashboard/EmptyState";
import ErrorState from "@/components/dashboard/ErrorState";
import JobsListSkeleton from "@/components/skeletons/recruiter/JobsListSkeleton";
import { base, fadeUp, spring, stagger } from "@/constants/motion";
import { badge, card as cardClass, dangerButton, focusRing, iconTile, inputClass, primaryButton, secondaryButton } from "@/components/ui/styles";

const STATUS_STYLES = {
  open: { tone: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400", icon: HiOutlineCheckCircle },
  draft: { tone: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400", icon: HiOutlineDocumentText },
  default: { tone: "border-border bg-muted text-muted-foreground", icon: HiOutlineArchiveBox },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "draft", label: "Draft" },
  { key: "other", label: "Closed" },
];

const matchesFilter = (job, key) =>
  key === "all" || (key === "other" ? job.status !== "open" && job.status !== "draft" : job.status === key);

const Dash = () => <span className="text-muted-foreground/60">—</span>;

function MetaItem({ icon: Icon, label, children }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm" title={label}>
      <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      <span className="min-w-0 truncate text-foreground/80">{children}</span>
    </div>
  );
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [publishingId, setPublishingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const data = await api.get("/jobs/recruiter/");
        if (!cancelled) setJobs(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("We could not load your job postings. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError("");
    setAttempt((n) => n + 1);
  };

  const handleDelete = (jobId) => {
    setDeleteError("");
    setDeleteId(jobId);
  };

  const confirmDelete = async () => {
    const jobId = deleteId;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/jobs/${jobId}/`);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
      setDeleteId(null);
    } catch {
      setDeleteError("We could not delete this job. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (jobId) => {
    setPublishingId(jobId);
    setNotice(null);
    try {
      await api.post(`/jobs/${jobId}/publish/`);
      setJobs((prev) => prev.map((j) => (j.job_id === jobId ? { ...j, status: "open" } : j)));
      setNotice({ tone: "success", text: "Job published. Candidates can now see it." });
    } catch {
      setNotice({ tone: "error", text: "We could not publish this job. Try again." });
    } finally {
      setPublishingId(null);
    }
  };

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const draftJobs = jobs.filter((j) => j.status === "draft").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

  const nextStep = jobs.length === 0
    ? "Next step: post your first job so candidates can start applying."
    : draftJobs > 0
      ? `Next step: publish the ${draftJobs} draft ${draftJobs === 1 ? "job" : "jobs"} so candidates can see ${draftJobs === 1 ? "it" : "them"}.`
      : "Next step: review new applicants on your open positions.";

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: HiOutlineClipboardDocumentList, hint: "Every job posting you have created" },
    { label: "Open Positions", value: openJobs, icon: HiOutlineBriefcase, hint: "Jobs currently accepting applicants" },
    { label: "Total Applicants", value: totalApplicants, icon: HiOutlineUserGroup, hint: "Applications across all jobs" },
  ];

  const q = query.trim().toLowerCase();
  const visibleJobs = jobs.filter(
    (j) =>
      matchesFilter(j, filter) &&
      (!q || [j.job_title, j.location, j.job_type, j.organization_details?.name].some((v) => String(v || "").toLowerCase().includes(q))),
  );

  if (loading) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <JobsListSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        icon={HiOutlineBriefcase}
        eyebrow="Recruiter"
        title="Job Management"
        description={error ? "Post, publish and manage your job listings." : `${openJobs} open ${openJobs === 1 ? "position" : "positions"}, ${totalApplicants} ${totalApplicants === 1 ? "applicant" : "applicants"} in total`}
        actions={
          <Link href="/recruiter/jobs/create" title="Write a new job posting" className={primaryButton}>
            <HiOutlinePlus className="h-5 w-5" aria-hidden="true" /> Post New Job
          </Link>
        }
      />

      {error && <ErrorState title="Something went wrong" message={error} onRetry={retry} />}

      {!error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                className={`${cardClass} flex items-center gap-4 p-5`}
              >
                <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                  <stat.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{stat.hint}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>{nextStep}</span>
          </p>
        </>
      )}

      {notice && (notice.tone === "error" ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {notice.text}
        </div>
      ) : (
        <output className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          <HiOutlineCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> {notice.text}
        </output>
      ))}

      {!error && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold">Your postings</h2>
                <p className="text-xs text-muted-foreground">Publish drafts, edit details or remove a job</p>
              </div>
            </div>
            {jobs.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div role="tablist" aria-label="Filter by status" className="flex rounded-md border border-emerald-100 bg-card p-1 dark:border-white/10">
                  {FILTERS.map((f) => {
                    const active = filter === f.key;
                    const count = jobs.filter((j) => matchesFilter(j, f.key)).length;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setFilter(f.key)}
                        className={`relative flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-sm px-3 text-xs font-semibold transition-colors sm:flex-none ${active ? "text-emerald-900 dark:text-white" : "text-muted-foreground hover:text-foreground"} ${focusRing}`}
                      >
                        {active && <motion.span layoutId="jobs-filter" transition={spring} className="absolute inset-0 rounded-sm bg-emerald-100 dark:bg-white/10" />}
                        <span className="relative">{f.label}</span>
                        <span className="relative tabular-nums opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="relative block sm:w-64">
                  <span className="sr-only">Search jobs</span>
                  <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or location" className={`${inputClass} pl-9`} />
                </label>
              </div>
            )}
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={HiOutlineBriefcase}
              title="No jobs posted yet"
              text="Start by creating your first job listing. Candidates can apply once it is open."
              action={
                <Link href="/recruiter/jobs/create" className={primaryButton}>
                  <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create Job
                </Link>
              }
            />
          ) : visibleJobs.length === 0 ? (
            <EmptyState icon={HiOutlineMagnifyingGlass} title="No matching jobs" text="Try another search or status filter." />
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 ">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleJobs.map((job, i) => {
                  const status = STATUS_STYLES[job.status] || STATUS_STYLES.default;
                  const StatusIcon = status.icon;
                  const org = job.organization_details?.name;
                  const applicants = job.applications_count || 0;
                  const publishing = publishingId === job.job_id;
                  return (
                    <motion.article
                      key={job.job_id}
                      layout
                      {...fadeUp}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                      className={`${cardClass} flex min-w-0 flex-col transition-colors hover:border-emerald-300 dark:hover:border-emerald-500/40`}
                    >
                      <div className="flex items-start gap-3 p-5 pb-4">
                        <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400`} aria-hidden="true">
                          {org?.[0] || <HiOutlineBriefcase className="h-5 w-5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 break-words font-semibold leading-snug">{job.job_title}</h3>
                          {org && (
                            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                              <HiOutlineBuildingOffice2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate">{org}</span>
                            </p>
                          )}
                        </div>
                        {job.status && (
                          <span className={`${badge} shrink-0 border text-[10px] font-semibold uppercase tracking-wider ${status.tone}`}>
                            <StatusIcon className="h-3 w-3" aria-hidden="true" /> {job.status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-emerald-100 px-5 py-4 dark:border-white/10">
                        <MetaItem icon={HiOutlineMapPin} label="Location">{job.location || <Dash />}</MetaItem>
                        <MetaItem icon={HiOutlineClock} label="Job type">{job.job_type || <Dash />}</MetaItem>
                        <MetaItem icon={HiOutlineAcademicCap} label="Experience level">{job.experience_level || <Dash />}</MetaItem>
                        <MetaItem icon={HiOutlineCalendarDays} label="Date posted">
                          {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : <Dash />}
                        </MetaItem>
                        <MetaItem icon={HiOutlineUserGroup} label="Applications received">
                          <span className="font-semibold tabular-nums">{applicants}</span> {applicants === 1 ? "applicant" : "applicants"}
                        </MetaItem>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-emerald-100 p-3 dark:border-white/10">
                        {job.status === "draft" && (
                          <button
                            type="button"
                            onClick={() => handlePublish(job.job_id)}
                            disabled={publishing}
                            aria-label={`Publish ${job.job_title}`}
                            title="Make this job visible to candidates"
                            className={`${primaryButton} flex-1`}
                          >
                            {publishing ? (
                              <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <HiOutlineRocketLaunch className="h-4 w-4" aria-hidden="true" />
                            )}
                            {publishing ? "Publishing..." : "Publish"}
                          </button>
                        )}
                        <Link href={`/recruiter/jobs/${job.job_id}/edit`} title="Edit this job posting" className={`${secondaryButton} flex-1`}>
                          <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(job.job_id)}
                          aria-label={`Delete ${job.job_title}`}
                          title="Delete this job posting"
                          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 transition-[color,background-color,border-color,translate,scale] duration-150 hover:bg-red-600 hover:text-white active:scale-[0.97] motion-reduce:transform-none dark:border-red-900/60 dark:text-red-400 dark:hover:text-white ${focusRing}`}
                        >
                          <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      )}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this job posting?"
        description="This cannot be undone."
        confirmLabel="Delete job"
        confirmClassName={dangerButton}
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
