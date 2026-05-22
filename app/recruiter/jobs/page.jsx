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
} from "react-icons/hi2";
import Link from "next/link";
import { motion } from "motion/react";
import DashboardBanner, { BannerBlock } from "@/components/dashboard/DashboardBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import FormError from "@/components/auth/FormError";

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const primaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-emerald-500 ${focusRing}`;
const secondaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 ${focusRing}`;
const cardClass = "rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card";

const STATUS_STYLES = {
  open: { tone: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400", icon: HiOutlineCheckCircle },
  draft: { tone: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400", icon: HiOutlineDocumentText },
  default: { tone: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-300", icon: HiOutlineArchiveBox },
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [publishingId, setPublishingId] = useState(null);
  const [notice, setNotice] = useState(null);

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

  const handleDelete = async (jobId) => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      await api.delete(`/jobs/${jobId}/`);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
    } catch {
      alert("Failed to delete job");
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

  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineBriefcase}
      badge={loading ? undefined : { label: `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`, icon: HiOutlineBriefcase }}
      title="Job Management"
      subtitle={loading
        ? "Loading your job postings..."
        : `${openJobs} open ${openJobs === 1 ? "position" : "positions"}, ${totalApplicants} ${totalApplicants === 1 ? "applicant" : "applicants"} in total`}
      footer={loading ? null : (
        <span className="flex items-start gap-2">
          <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <span>{nextStep}</span>
        </span>
      )}
      aside={loading ? (
        <div className="flex flex-wrap gap-2">
          <BannerBlock className="h-11 w-36 rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Link
            href="/recruiter/jobs/create"
            title="Write a new job posting"
            className={`${primaryButton} shadow-lg shadow-emerald-600/20 dark:text-white`}
          >
            <HiOutlinePlus className="h-5 w-5" aria-hidden="true" /> Post New Job
          </Link>
        </div>
      )}
    />
  );

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {banner}

      {loading && <PageSkeleton stats={3} cards={4} banner={false} />}

      {!loading && error && (
        <div className="flex flex-col items-start gap-2">
          <FormError title="Something went wrong" message={error} />
          <button type="button" onClick={retry} title="Try loading your jobs again" className={secondaryButton}>
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-4 p-5 lg:p-6 ${cardClass}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" aria-hidden="true">
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-semibold text-emerald-950 dark:text-white">{stat.value}</div>
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{stat.label}</div>
                  <div className="text-xs text-emerald-800/70 dark:text-slate-400">{stat.hint}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {notice && (notice.tone === "error" ? (
            <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              {notice.text}
            </div>
          ) : (
            <output className="block rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
              {notice.text}
            </output>
          ))}

          <section className="space-y-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight text-emerald-950 dark:text-white">Your postings</h2>
                <p className="text-xs text-emerald-800/70 dark:text-slate-400">Edit details or remove a job</p>
              </div>
            </div>

            {jobs.length === 0 ? (
              !error && (
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
              )
            ) : (
              <div className="space-y-4">
                {jobs.map((job, i) => {
                  const status = STATUS_STYLES[job.status] || STATUS_STYLES.default;
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={job.job_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group p-5 transition-colors hover:border-emerald-300 lg:p-6 ${cardClass}`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" aria-hidden="true">
                              {job.organization_details?.name?.[0] || "DS"}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-semibold text-emerald-950 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                                {job.job_title}
                              </h3>
                              <p className="truncate text-sm font-medium text-emerald-800/70 dark:text-slate-400">
                                {job.organization_details?.name || "DeepScreen"} &middot; {job.job_type || "Full-time"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-emerald-800/70 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1" title="Location">
                              <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" /> {job.location || "Remote"}
                            </span>
                            <span className="inline-flex items-center gap-1" title="Experience level">
                              <HiOutlineAcademicCap className="h-3.5 w-3.5" aria-hidden="true" /> {job.experience_level || "N/A"}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${status.tone}`}>
                              <StatusIcon className="h-3 w-3" aria-hidden="true" /> {job.status || "unknown"}
                            </span>
                            <span className="text-xs" title="Date posted">
                              {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : "Date not set"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold" title="Applications received">
                              <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" /> {job.applications_count || 0} applicants
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {job.status === "draft" && (
                            <button
                              type="button"
                              onClick={() => handlePublish(job.job_id)}
                              disabled={publishingId === job.job_id}
                              aria-label={`Publish ${job.job_title}`}
                              title="Make this job visible to candidates"
                              className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <HiOutlineRocketLaunch className="h-4 w-4" aria-hidden="true" /> {publishingId === job.job_id ? "Publishing..." : "Publish"}
                            </button>
                          )}
                          <Link
                            href={`/recruiter/jobs/${job.job_id}/edit`}
                            title="Edit this job posting"
                            className={secondaryButton}
                          >
                            <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(job.job_id)}
                            title="Delete this job posting"
                            className={`flex min-h-11 items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive hover:text-white dark:hover:text-white ${focusRing}`}
                          >
                            <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
