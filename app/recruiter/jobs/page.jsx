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
} from "react-icons/hi2";
import Link from "next/link";
import { motion } from "motion/react";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import FormError from "@/components/auth/FormError";

const linkButton = "inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get("/jobs/recruiter/");
        setJobs(data);
      } catch (err) {
        setError("We could not load your job postings. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
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

  const openJobs = jobs.filter(j => j.status === 'open').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

  if (loading) return <PageSkeleton stats={3} cards={4} />;

  const nextStep = jobs.length === 0
    ? "Next step: post your first job so candidates can start applying."
    : draftJobs > 0
      ? `Next step: publish the ${draftJobs} draft ${draftJobs === 1 ? "job" : "jobs"} so candidates can see ${draftJobs === 1 ? "it" : "them"}.`
      : "Next step: review new applicants on your open positions.";

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: HiOutlineClipboardDocumentList, tone: "bg-blue-500/10 text-blue-500", hint: "Every job posting you have created" },
    { label: "Open Positions", value: openJobs, icon: HiOutlineBriefcase, tone: "bg-emerald-500/10 text-emerald-500", hint: "Jobs currently accepting applicants" },
    { label: "Total Applicants", value: totalApplicants, icon: HiOutlineUserGroup, tone: "bg-purple-500/10 text-purple-500", hint: "Applications across all jobs" },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
      <DashboardBanner
        icon={HiOutlineBriefcase}
        badge={{ label: `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`, icon: HiOutlineBriefcase }}
        title="Job Management"
        subtitle={`${openJobs} open ${openJobs === 1 ? "position" : "positions"}, ${totalApplicants} ${totalApplicants === 1 ? "applicant" : "applicants"} in total`}
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
            title="Try loading your jobs again"
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

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight">Your postings</h2>
              <p className="text-xs text-muted-foreground/60">Edit details or remove a job</p>
            </div>
          </div>
          <Link
            href="/recruiter/jobs/create"
            title="Write a new job posting"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
          >
            <HiOutlinePlus className="h-5 w-5" aria-hidden="true" /> Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          !error && (
            <EmptyState
              icon={HiOutlineBriefcase}
              title="No jobs posted yet"
              text="Start by creating your first job listing. Candidates can apply once it is open."
              action={<Link href="/recruiter/jobs/create" className={linkButton}><HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create Job</Link>}
            />
          )
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.job_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/30 lg:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 font-semibold text-emerald-500" aria-hidden="true">
                        {job.organization_details?.name?.[0] || "DS"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-foreground transition-colors group-hover:text-emerald-500">
                          {job.job_title}
                        </h3>
                        <p className="truncate text-sm font-medium text-muted-foreground">
                          {job.organization_details?.name || "DeepScreen"} &middot; {job.job_type || "Full-time"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1" title="Location">
                        <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" /> {job.location || "Remote"}
                      </span>
                      <span className="inline-flex items-center gap-1" title="Experience level">
                        <HiOutlineAcademicCap className="h-3.5 w-3.5" aria-hidden="true" /> {job.experience_level || "N/A"}
                      </span>
                      <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                        job.status === "open"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          : job.status === "draft"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            : "border-border bg-muted text-muted-foreground"
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-xs" title="Date posted">{new Date(job.posted_date).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" title="Applications received">
                        <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" /> {job.applications_count || 0} applicants
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/recruiter/jobs/${job.job_id}/edit`}
                      title="Edit this job posting"
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold transition-all hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(job.job_id)}
                      title="Delete this job posting"
                      className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive hover:text-white"
                    >
                      <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
