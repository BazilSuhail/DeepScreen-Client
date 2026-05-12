"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import Link from "next/link";
import { HiLocationMarker } from "react-icons/hi";
import { motion } from "motion/react";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const data = await api.get("/jobs/recruiter/");
      setJobs(data);
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

  if (loading)
    return (
      <div className="space-y-6 px-12">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-[2rem] animate-pulse" />)}</div>
      </div>
    );

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-semibold">Jobs</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <HiOutlineBriefcase className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage your open positions</p>
          </div>
        </div>
        <Link
          href="/recruiter/jobs/create"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
        >
          <HiOutlinePlus className="w-5 h-5" /> Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: HiOutlineClipboardDocumentList, color: 'from-blue-500/10 to-blue-600/5 text-blue-500' },
          { label: 'Open Positions', value: openJobs, icon: HiOutlineBriefcase, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
          { label: 'Total Applicants', value: totalApplicants, icon: HiOutlineUserGroup, color: 'from-purple-500/10 to-purple-600/5 text-purple-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold">{error}</div>
      )}

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
            <HiOutlineClipboardDocumentList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <h2 className="text-xl font-bold text-foreground mb-2">No Jobs Posted Yet</h2>
            <p className="text-muted-foreground mb-6">Start by creating your first job listing.</p>
            <Link href="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm">
              <HiOutlinePlus className="w-5 h-5" /> Create Job
            </Link>
          </div>
        ) : (
          jobs.map((job, i) => (
            <motion.div key={job.job_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-[2rem] p-6 md:p-7 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex items-center justify-center text-emerald-500 font-bold shrink-0">
                      {job.organization_details?.name?.[0] || "DS"}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                        {job.job_title}
                      </h2>
                      <p className="text-sm text-muted-foreground font-medium truncate">
                        {job.organization_details?.name || "DeepScreen"} &middot; {job.job_type || "Full-time"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-1">
                      <HiLocationMarker size={14} /> {job.location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineBriefcase size={14} /> {job.experience_level || "N/A"}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === "open"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : job.status === "draft"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-xs">{new Date(job.posted_date).toLocaleDateString()}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <HiOutlineUserGroup size={14} /> {job.applications_count || 0} applicants
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/recruiter/jobs/${job.job_id}/edit`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-card border border-border hover:bg-emerald-500 hover:text-white hover:border-emerald-500 rounded-xl font-bold text-xs transition-all">
                    <HiOutlinePencilSquare className="w-4 h-4" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(job.job_id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl font-bold text-xs transition-all">
                    <HiOutlineTrash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
