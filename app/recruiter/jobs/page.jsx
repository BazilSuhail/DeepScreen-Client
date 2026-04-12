"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBriefcase,
} from "react-icons/hi2";
import Link from "next/link";
import { HiLocationMarker } from "react-icons/hi";

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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  return (
    <div className="space-y-8 w-full px-4 md:px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your open positions
          </p>
        </div>
        <Link
          href="/recruiter/jobs/create"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
        >
          <HiOutlinePlus className="w-5 h-5" /> Post New Job
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.job_id}
            className="bg-card rounded-[32px] border border-border p-6 md:p-8 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-xl text-emerald-400 font-bold shadow-lg shrink-0">
                    {job.organization_details?.name?.[0] || "DS"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-card-foreground truncate">
                      {job.job_title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium truncate">
                      {job.organization_details?.name || "DeepScreen"} &middot;{" "}
                      {job.job_type || "Full-time"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <HiLocationMarker size={14} />
                    {job.location || "Remote"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineBriefcase size={14} />
                    {job.experience_level || "N/A"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === "open"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : job.status === "draft"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-xs">
                    {new Date(job.posted_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/recruiter/jobs/${job.job_id}/edit`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-emerald-500 text-secondary-foreground hover:text-white rounded-xl font-bold text-xs transition-all shadow-lg"
                >
                  <HiOutlinePencilSquare className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(job.job_id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-destructive hover:bg-red-600 text-destructive-foreground rounded-xl font-bold text-xs transition-all shadow-lg"
                >
                  <HiOutlineTrash className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && !loading && (
          <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
            <h3 className="text-xl font-bold">No Jobs Posted Yet</h3>
            <p className="text-muted-foreground mt-2 mb-8">
              Start by creating your first job listing.
            </p>
            <Link
              href="/recruiter/jobs/create"
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl"
            >
              Create Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
